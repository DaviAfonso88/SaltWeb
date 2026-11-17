"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { expireTag, TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { devotionals } from "@/lib/db/schema";

const schema = z.object({
  title: z.string().trim().min(3, "Informe o título.").max(160),
  referenceMonth: z.string().regex(/^\d{4}-\d{2}$/, "Escolha o mês de referência."),
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => /^https?:\/\//i.test(v), "Use um link que comece com http:// ou https://."),
  published: z.boolean(),
});

function refresh() {
  expireTag(TAGS.devocionais);
  revalidatePath("/painel/devocionais");
  revalidatePath("/devocional");
}

export async function saveDevotional(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction("devocionais.gerenciar");
  if (!auth.ok) return auth.result;

  const parsed = schema.safeParse({
    title: formData.get("title"),
    referenceMonth: formData.get("referenceMonth"),
    url: formData.get("url"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const id = String(formData.get("id") ?? "") || null;
  const version = Number(formData.get("version") ?? 0);
  const values = {
    title: parsed.data.title,
    referenceMonth: `${parsed.data.referenceMonth}-01`,
    url: parsed.data.url,
  };

  const db = getDb();
  if (!id) {
    const [row] = await db
      .insert(devotionals)
      .values({ ...values, published: parsed.data.published, publishedAt: parsed.data.published ? new Date() : null })
      .returning({ id: devotionals.id });
    await logAudit({ actor: auth.user, action: "devotional.create", entityType: "devotional", entityId: row.id, summary: `Devocional criado: ${values.title}` });
    refresh();
    return ok(undefined, "Devocional criado.");
  }

  const result = await db.transaction(async (tx): Promise<ActionResult> => {
    const [current] = await tx.select().from(devotionals).where(eq(devotionals.id, id)).limit(1);
    if (!current) return fail("Devocional não encontrado.");
    if (current.version !== version) {
      return fail("Este devocional foi alterado por outra pessoa. Feche e abra de novo para ver a versão atual.", { conflict: true });
    }
    const becomesPublished = parsed.data.published && !current.published;
    const [updated] = await tx
      .update(devotionals)
      .set({
        ...values,
        published: parsed.data.published,
        publishedAt: becomesPublished ? new Date() : parsed.data.published ? current.publishedAt : null,
        version: current.version + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(devotionals.id, id), eq(devotionals.version, current.version)))
      .returning({ id: devotionals.id });
    if (!updated) return fail("Este devocional foi alterado por outra pessoa.", { conflict: true });
    return ok(undefined, "Devocional salvo.");
  });

  if (result.ok) {
    await logAudit({ actor: auth.user, action: "devotional.update", entityType: "devotional", entityId: id, summary: `Devocional atualizado: ${values.title}` });
    refresh();
  }
  return result;
}

export async function setDevotionalPublished(devotionalId: string, published: boolean): Promise<ActionResult> {
  const auth = await authorizeAction("devocionais.gerenciar");
  if (!auth.ok) return auth.result;
  if (!z.string().uuid().safeParse(devotionalId).success) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db.select().from(devotionals).where(eq(devotionals.id, devotionalId)).limit(1);
  if (!current) return fail("Devocional não encontrado.");

  await db
    .update(devotionals)
    .set({
      published,
      publishedAt: published ? (current.published ? current.publishedAt : new Date()) : null,
      version: current.version + 1,
      updatedAt: new Date(),
    })
    .where(eq(devotionals.id, devotionalId));
  await logAudit({
    actor: auth.user,
    action: published ? "devotional.publish" : "devotional.unpublish",
    entityType: "devotional",
    entityId: devotionalId,
    summary: `Devocional ${published ? "publicado" : "despublicado"}: ${current.title}`,
  });
  refresh();
  return ok(undefined, published ? "Devocional publicado." : "Devocional despublicado.");
}

export async function deleteDevotional(devotionalId: string): Promise<ActionResult> {
  const auth = await authorizeAction("devocionais.gerenciar");
  if (!auth.ok) return auth.result;
  if (!z.string().uuid().safeParse(devotionalId).success) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db.select({ title: devotionals.title }).from(devotionals).where(eq(devotionals.id, devotionalId)).limit(1);
  if (!current) return fail("Devocional não encontrado.");

  await db.delete(devotionals).where(eq(devotionals.id, devotionalId));
  await logAudit({ actor: auth.user, action: "devotional.delete", entityType: "devotional", entityId: devotionalId, summary: `Devocional excluído: ${current.title}` });
  refresh();
  return ok(undefined, "Devocional excluído.");
}
