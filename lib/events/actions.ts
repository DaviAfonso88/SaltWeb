"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { expireTag, TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { events, participants, registrations } from "@/lib/db/schema";
import { fromSaoPauloInput } from "@/lib/format";
import { getFormModel } from "@/lib/forms/registry";
import { slugify } from "@/lib/text";

import { deleteImage, storeImage, validateImage } from "./images";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : null));

/** Só http(s): evita `javascript:` e similares em links exibidos publicamente. */
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), "Use um link que comece com http:// ou https://.");

const field = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
};

const eventSchema = z.object({
  title: z.string().trim().min(3, "Informe o título.").max(120),
  slug: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? slugify(v) : "")),
  summary: optionalText(300),
  description: optionalText(5000),
  startsAt: z.string().min(1, "Informe a data e a hora de início."),
  endsAt: z.string().optional(),
  locationName: optionalText(120),
  locationAddress: optionalText(250),
  locationMapUrl: optionalUrl,
  imageAlt: optionalText(200),
  category: optionalText(40),
  externalUrl: optionalUrl,
  externalLabel: optionalText(40),
  formModel: z.string().optional(),
  registrationClosesAt: z.string().optional(),
});

function toPublicationError(error: unknown): ActionResult {
  const code = (error as { code?: string; cause?: { code?: string } })?.code ?? (error as { cause?: { code?: string } })?.cause?.code;
  if (code === "23505") {
    return fail("Já existe um evento com este endereço (slug).", { fieldErrors: { slug: ["Endereço já usado."] } });
  }
  throw error;
}

export async function saveEvent(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await authorizeAction("eventos.gerenciar");
  if (!auth.ok) return auth.result;

  const parsed = eventSchema.safeParse({
    title: field(formData, "title"),
    slug: field(formData, "slug"),
    summary: field(formData, "summary"),
    description: field(formData, "description"),
    startsAt: field(formData, "startsAt"),
    endsAt: field(formData, "endsAt"),
    locationName: field(formData, "locationName"),
    locationAddress: field(formData, "locationAddress"),
    locationMapUrl: field(formData, "locationMapUrl"),
    imageAlt: field(formData, "imageAlt"),
    category: field(formData, "category"),
    externalUrl: field(formData, "externalUrl"),
    externalLabel: field(formData, "externalLabel"),
    formModel: field(formData, "formModel"),
    registrationClosesAt: field(formData, "registrationClosesAt"),
  });
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const id = field(formData, "id") || null;
  const version = Number(field(formData, "version") ?? 0);
  const featured = formData.get("featured") === "on";
  const registrationOpen = formData.get("registrationOpen") === "on";
  const removeImage = formData.get("removeImage") === "on";

  const startsAt = fromSaoPauloInput(data.startsAt);
  if (!startsAt) return fail("Data de início inválida.", { fieldErrors: { startsAt: ["Data inválida."] } });
  const endsAt = data.endsAt ? fromSaoPauloInput(data.endsAt) : null;
  if (data.endsAt && !endsAt) return fail("Data de término inválida.", { fieldErrors: { endsAt: ["Data inválida."] } });
  if (endsAt && endsAt < startsAt) {
    return fail("O término deve ser depois do início.", { fieldErrors: { endsAt: ["Deve ser depois do início."] } });
  }
  const closesAt = data.registrationClosesAt ? fromSaoPauloInput(data.registrationClosesAt) : null;
  if (data.registrationClosesAt && !closesAt) {
    return fail("Data de encerramento inválida.", { fieldErrors: { registrationClosesAt: ["Data inválida."] } });
  }

  // Modelo + parâmetros.
  const model = data.formModel ? getFormModel(data.formModel) : null;
  if (data.formModel && !model) return fail("Modelo de formulário desconhecido.", { fieldErrors: { formModel: ["Modelo inválido."] } });
  let formConfig: Record<string, unknown> = {};
  if (model) {
    let raw: unknown = {};
    try {
      raw = JSON.parse(field(formData, "formConfig") || "{}");
    } catch {
      return fail("Parâmetros do formulário inválidos.", { fieldErrors: { formConfig: ["Parâmetros inválidos."] } });
    }
    const config = model.parseConfig(raw);
    if (!config.success) {
      return fail(config.error.issues[0]?.message ?? "Parâmetros inválidos.", {
        fieldErrors: { formConfig: config.error.issues.map((i) => i.message) },
      });
    }
    formConfig = config.data;
  }
  if (registrationOpen && !model) {
    return fail("Escolha um modelo de formulário antes de abrir as inscrições.", {
      fieldErrors: { formModel: ["Escolha um modelo."] },
    });
  }

  // Imagem nova (validada fora da transação).
  const upload = formData.get("image");
  let newImage: Awaited<ReturnType<typeof validateImage>> | null = null;
  if (upload instanceof File && upload.size > 0) {
    newImage = await validateImage(upload);
    if (!newImage.ok) return fail(newImage.error, { fieldErrors: { image: [newImage.error] } });
  }

  const slug = data.slug || slugify(data.title);
  if (!slug) return fail("Não foi possível gerar o endereço do evento.", { fieldErrors: { slug: ["Informe um endereço."] } });

  const db = getDb();
  try {
    const result = await db.transaction(async (tx): Promise<ActionResult<{ id: string }>> => {
      const [current] = id ? await tx.select().from(events).where(eq(events.id, id)).limit(1) : [];
      if (id && !current) return fail("Evento não encontrado.");
      if (current && current.version !== version) {
        return fail("Este evento foi alterado por outra pessoa. Recarregue a página e refaça a edição.", { conflict: true });
      }

      if (current && (current.formModel ?? null) !== (model?.id ?? null)) {
        const [{ total }] = await tx.select({ total: count() }).from(registrations).where(eq(registrations.eventId, current.id));
        if (total > 0) return fail("O modelo não pode mudar depois da primeira inscrição.", { fieldErrors: { formModel: ["Modelo bloqueado."] } });
      }

      let imageId = current?.imageId ?? null;
      const oldImageId = imageId;
      if (newImage?.ok) imageId = await storeImage(tx, newImage.image);
      else if (removeImage) imageId = null;
      if (imageId && !data.imageAlt) {
        return fail("Descreva a imagem (texto alternativo).", { fieldErrors: { imageAlt: ["Obrigatório quando há imagem."] } });
      }

      if (featured) {
        await tx.update(events).set({ featured: false }).where(current ? and(eq(events.featured, true), ne(events.id, current.id)) : eq(events.featured, true));
      }

      const values = {
        slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        startsAt,
        endsAt,
        locationName: data.locationName,
        locationAddress: data.locationAddress,
        locationMapUrl: data.locationMapUrl,
        imageId,
        imageAlt: imageId ? data.imageAlt : null,
        category: data.category,
        featured,
        externalUrl: data.externalUrl,
        externalLabel: data.externalLabel,
        formModel: model?.id ?? null,
        formConfig,
        registrationOpen,
        registrationClosesAt: closesAt,
      };

      let savedId: string;
      if (current) {
        const [row] = await tx
          .update(events)
          .set({ ...values, version: current.version + 1, updatedAt: new Date() })
          .where(and(eq(events.id, current.id), eq(events.version, current.version)))
          .returning({ id: events.id });
        if (!row) return fail("Este evento foi alterado por outra pessoa. Recarregue a página.", { conflict: true });
        savedId = row.id;
      } else {
        const [row] = await tx
          .insert(events)
          .values({ ...values, createdBy: auth.user.id })
          .returning({ id: events.id });
        savedId = row.id;
      }

      if (oldImageId && oldImageId !== imageId) await deleteImage(tx, oldImageId);
      return ok({ id: savedId }, id ? "Evento salvo." : "Evento criado.");
    });

    if (result.ok && result.data) {
      await logAudit({
        actor: auth.user,
        action: id ? "event.update" : "event.create",
        entityType: "event",
        entityId: result.data.id,
        summary: `${id ? "Evento atualizado" : "Evento criado"}: ${data.title}`,
        metadata: { formModel: model?.id ?? null, registrationOpen },
      });
      expireTag(TAGS.eventos);
      revalidatePath("/painel/eventos");
      revalidatePath("/eventos");
      revalidatePath("/");
    }
    return result;
  } catch (error) {
    return toPublicationError(error) as ActionResult<{ id: string }>;
  }
}

export async function setEventPublication(
  eventId: string,
  publication: "draft" | "published" | "archived",
): Promise<ActionResult> {
  const auth = await authorizeAction("eventos.gerenciar");
  if (!auth.ok) return auth.result;
  if (!z.enum(["draft", "published", "archived"]).safeParse(publication).success) return fail("Situação inválida.");

  const db = getDb();
  const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, eventId)).limit(1);
  if (!event) return fail("Evento não encontrado.");

  await db
    .update(events)
    .set({
      publication,
      // Arquivar ou voltar para rascunho tira do destaque e fecha as inscrições.
      ...(publication !== "published" ? { featured: false, registrationOpen: false } : {}),
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId));

  await logAudit({
    actor: auth.user,
    action: "event.publication",
    entityType: "event",
    entityId: eventId,
    summary: `Evento "${event.title}" → ${publication}`,
  });
  expireTag(TAGS.eventos);
  revalidatePath("/painel/eventos");
  revalidatePath("/eventos");
  revalidatePath("/");
  return ok(undefined, publication === "published" ? "Evento publicado." : publication === "archived" ? "Evento arquivado." : "Evento voltou a rascunho.");
}

export async function setRegistrationOpen(eventId: string, open: boolean): Promise<ActionResult> {
  const auth = await authorizeAction("eventos.gerenciar");
  if (!auth.ok) return auth.result;

  const db = getDb();
  const [event] = await db
    .select({ title: events.title, formModel: events.formModel })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) return fail("Evento não encontrado.");
  if (open && !event.formModel) return fail("Escolha um modelo de formulário antes de abrir as inscrições.");

  await db.update(events).set({ registrationOpen: open, updatedAt: new Date() }).where(eq(events.id, eventId));
  await logAudit({
    actor: auth.user,
    action: open ? "event.registration_open" : "event.registration_close",
    entityType: "event",
    entityId: eventId,
    summary: `Inscrições ${open ? "abertas" : "encerradas"}: ${event.title}`,
  });
  expireTag(TAGS.eventos);
  revalidatePath("/painel/eventos");
  return ok(undefined, open ? "Inscrições abertas." : "Inscrições encerradas.");
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const auth = await authorizeAction("eventos.gerenciar");
  if (!auth.ok) return auth.result;

  const db = getDb();
  const result = await db.transaction(async (tx): Promise<ActionResult<string>> => {
    const [event] = await tx
      .select({ title: events.title, imageId: events.imageId })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);
    if (!event) return fail("Evento não encontrado.");

    const [[reg], [part]] = await Promise.all([
      tx.select({ total: count() }).from(registrations).where(eq(registrations.eventId, eventId)),
      tx.select({ total: count() }).from(participants).where(eq(participants.eventId, eventId)),
    ]);
    if (reg.total > 0 || part.total > 0) {
      return fail("Este evento tem inscrições ou participantes. Arquive-o em vez de excluir.");
    }

    await tx.delete(events).where(eq(events.id, eventId));
    if (event.imageId) await deleteImage(tx, event.imageId);
    return ok(event.title);
  });
  if (!result.ok) return result;

  await logAudit({
    actor: auth.user,
    action: "event.delete",
    entityType: "event",
    entityId: eventId,
    summary: `Evento excluído: ${String(result.data)}`,
  });
  expireTag(TAGS.eventos);
  revalidatePath("/painel/eventos");
  revalidatePath("/eventos");
  return ok(undefined, "Evento excluído.");
}
