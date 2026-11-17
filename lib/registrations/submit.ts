import { and, eq, max, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { events, registrations, type RegistrationPayment } from "@/lib/db/schema";
import { todayInSaoPaulo } from "@/lib/format";
import { getFestaAvailability, type FestaAvailability } from "@/lib/forms/availability";
import { SLOT_KEY, ITEM_PREFIX } from "@/lib/forms/festa";
import { getFormModel } from "@/lib/forms/registry";
import type { Installment } from "@/lib/forms/types";
import { normalizeKey, onlyDigits, phoneKey } from "@/lib/text";

const baseSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(100, "Nome muito longo."),
  telefone: z
    .string()
    .trim()
    .refine((v) => {
      const digits = onlyDigits(v).length;
      return digits >= 10 && digits <= 13;
    }, "Informe um telefone com DDD."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, "Informe um e-mail válido."),
  respostas: z.unknown(),
});

export type SubmitSummary = {
  numero: number;
  valorFinalCentavos: number;
  valorOriginalCentavos: number;
  lote?: string;
  plano?: string;
  forma?: string;
  parcelas: Installment[];
};

export type SubmitResult =
  | { ok: true; summary: SubmitSummary }
  | { ok: false; error: "validacao"; fieldErrors: Record<string, string[]> }
  | { ok: false; error: "duplicada" | "encerrada" | "nao_encontrado" }
  | { ok: false; error: "sem_vagas"; itens: string[]; disponibilidade: FestaAvailability };

const validation = (fieldErrors: Record<string, string[]>): SubmitResult => ({ ok: false, error: "validacao", fieldErrors });

function collect(error: z.ZodError, prefix = ""): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = `${prefix}${issue.path.join(".")}` || "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/**
 * Grava uma inscrição pública. Tudo acontece em uma transação com trava por evento, então
 * número sequencial, detecção de duplicada e contagem de vagas não sofrem corrida.
 */
export async function submitRegistration(slug: string, body: unknown): Promise<SubmitResult> {
  const common = baseSchema.safeParse(body);
  if (!common.success) return validation(collect(common.error));

  const db = getDb();
  return db.transaction(async (tx): Promise<SubmitResult> => {
    const [event] = await tx.select().from(events).where(eq(events.slug, slug)).limit(1);
    if (!event || event.publication !== "published") return { ok: false, error: "nao_encontrado" };

    // Serializa inscrições do mesmo evento.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${event.id}))`);

    const model = getFormModel(event.formModel);
    const now = new Date();
    if (!model || !event.registrationOpen || (event.registrationClosesAt && event.registrationClosesAt <= now)) {
      return { ok: false, error: "encerrada" };
    }

    if (model.requiresEmail && !common.data.email) {
      return validation({ email: ["Informe seu e-mail."] });
    }

    const answers = model.parseAnswers(event.formConfig, common.data.respostas ?? {});
    if (!answers.success) return validation(collect(answers.error, "respostas."));

    const nameKey = normalizeKey(common.data.nome);
    const key = phoneKey(common.data.telefone);

    // Duplicada vale também para inscrição cancelada (a equipe reativa, não recria).
    const [duplicate] = await tx
      .select({ id: registrations.id })
      .from(registrations)
      .where(and(eq(registrations.eventId, event.id), eq(registrations.nameKey, nameKey), eq(registrations.phoneKey, key)))
      .limit(1);
    if (duplicate) return { ok: false, error: "duplicada" };

    // Disponibilidade (Festa): itens e vagas consumidos por inscrições não canceladas.
    if (model.id === "festa") {
      const wanted = model.consumes(event.formConfig, answers.data);
      if (wanted.length) {
        const availability = await getFestaAvailability(event.id, event.formConfig, tx);
        const exhausted: string[] = [];
        for (const key of wanted) {
          if (key === SLOT_KEY && availability.vagasContribuicao <= 0) exhausted.push("Contribuição em valor");
          if (key.startsWith(ITEM_PREFIX)) {
            const name = key.slice(ITEM_PREFIX.length);
            const item = availability.itens.find((i) => i.nome === name);
            if (!item || item.restante <= 0) exhausted.push(name);
          }
        }
        if (exhausted.length) return { ok: false, error: "sem_vagas", itens: exhausted, disponibilidade: availability };
      }
    }

    // Valor sempre recalculado no servidor.
    const price = model.price(event.formConfig, answers.data, todayInSaoPaulo(now));
    const payment: RegistrationPayment | null = price
      ? {
          lote: price.lote,
          valorOriginalCentavos: price.valorOriginalCentavos,
          valorFinalCentavos: price.valorFinalCentavos,
          plano: price.plano,
          forma: price.forma,
          parcelas: price.parcelas,
        }
      : null;

    const [{ last }] = await tx
      .select({ last: max(registrations.number) })
      .from(registrations)
      .where(eq(registrations.eventId, event.id));
    const number = (last ?? 0) + 1;

    await tx.insert(registrations).values({
      eventId: event.id,
      number,
      name: common.data.nome,
      nameKey,
      phone: common.data.telefone,
      phoneKey: key,
      email: common.data.email ?? null,
      amountCents: price?.valorFinalCentavos ?? 0,
      answers: answers.data,
      payment,
    });

    return {
      ok: true,
      summary: {
        numero: number,
        valorFinalCentavos: price?.valorFinalCentavos ?? 0,
        valorOriginalCentavos: price?.valorOriginalCentavos ?? 0,
        lote: price?.lote,
        plano: price?.plano,
        forma: price?.forma,
        parcelas: price?.parcelas ?? [],
      },
    };
  });
}
