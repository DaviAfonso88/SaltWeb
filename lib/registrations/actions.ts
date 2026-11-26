"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { events, registrations } from "@/lib/db/schema";
import { formatCurrency, todayInSaoPaulo } from "@/lib/format";
import { getFestaAvailability } from "@/lib/forms/availability";
import { festaConfigSchema, festaShortages, peopleCount, wantsValue } from "@/lib/forms/festa";
import { getFormModel } from "@/lib/forms/registry";
import { recordHistory } from "@/lib/history";

import { isSinglePayment, paymentInstallments, repricePayment, type Reprice } from "./payment";
import { submitRegistration } from "./submit";

const idSchema = z.string().uuid();
const STATUS_LABEL = { pending: "Pendente", confirmed: "Confirmada", cancelled: "Cancelada" } as const;

export async function setRegistrationStatus(
  registrationId: string,
  status: "pending" | "confirmed" | "cancelled",
): Promise<ActionResult> {
  const auth = await authorizeAction("inscricoes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(registrationId).success || !(status in STATUS_LABEL)) return fail("Dados inválidos.");

  const db = getDb();
  const result = await db.transaction(async (tx): Promise<ActionResult<string>> => {
    const [current] = await tx.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
    if (!current) return fail("Inscrição não encontrada.");
    if (current.status === status) return ok(current.name);

    await tx.update(registrations).set({ status, updatedAt: new Date() }).where(eq(registrations.id, registrationId));
    await recordHistory(tx, {
      entityType: "registration",
      entityId: registrationId,
      actor: auth.user,
      changes: [{ field: "Situação", old: STATUS_LABEL[current.status], new: STATUS_LABEL[status] }],
    });
    return ok(current.name);
  });
  if (!result.ok) return result;

  await logAudit({
    actor: auth.user,
    action: "registration.status",
    entityType: "registration",
    entityId: registrationId,
    summary: `Inscrição de ${String(result.data)} → ${STATUS_LABEL[status]}`,
  });
  revalidatePath("/painel/inscricoes");
  revalidatePath(`/painel/inscricoes/${registrationId}`);
  return ok(undefined, "Situação atualizada.");
}

export async function setInstallmentPaid(registrationId: string, index: number, paid: boolean): Promise<ActionResult> {
  const auth = await authorizeAction("inscricoes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(registrationId).success || !Number.isInteger(index) || index < 0) return fail("Dados inválidos.");

  const db = getDb();
  type Done = { name: string; label: string; single: boolean };
  const result = await db.transaction(async (tx): Promise<ActionResult<Done>> => {
    const [current] = await tx.select().from(registrations).where(eq(registrations.id, registrationId)).limit(1);
    if (!current?.payment) return fail("Inscrição sem pagamento.");
    // À vista e contribuição em valor não têm parcelas gravadas: a parcela única é gravada aqui.
    const single = isSinglePayment(current.payment);
    const installment = paymentInstallments(current.payment)[index];
    if (!installment) return fail("Parcela não encontrada.");
    const done = { name: current.name, label: installment.rotulo, single };
    if (installment.pago === paid) return ok(done);

    const parcelas = paymentInstallments(current.payment).map((p, i) =>
      i === index ? { ...p, pago: paid, pagoEm: paid ? new Date().toISOString() : undefined } : p,
    );
    await tx
      .update(registrations)
      .set({ payment: { ...current.payment, parcelas }, updatedAt: new Date() })
      .where(eq(registrations.id, registrationId));
    await recordHistory(tx, {
      entityType: "registration",
      entityId: registrationId,
      actor: auth.user,
      changes: [
        single
          ? { field: `Pagamento (${installment.rotulo})`, old: installment.pago ? "Pago" : "Em aberto", new: paid ? "Pago" : "Em aberto" }
          : { field: `Parcela ${installment.rotulo}`, old: installment.pago ? "Paga" : "Em aberto", new: paid ? "Paga" : "Em aberto" },
      ],
    });
    return ok(done);
  });
  if (!result.ok) return result;

  const done = result.data as Done;
  await logAudit({
    actor: auth.user,
    action: "registration.installment",
    entityType: "registration",
    entityId: registrationId,
    summary: done.single
      ? `Pagamento (${done.label}) de ${done.name}: ${paid ? "pago" : "em aberto"}`
      : `Parcela ${done.label} de ${done.name}: ${paid ? "paga" : "em aberto"}`,
  });
  revalidatePath("/painel/inscricoes");
  revalidatePath(`/painel/inscricoes/${registrationId}`);
  if (done.single) return ok(undefined, paid ? "Pagamento marcado como pago." : "Pagamento reaberto.");
  return ok(undefined, paid ? "Parcela marcada como paga." : "Parcela reaberta.");
}

export async function deleteRegistration(registrationId: string): Promise<ActionResult> {
  const auth = await authorizeAction("inscricoes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(registrationId).success) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db
    .select({ name: registrations.name, number: registrations.number })
    .from(registrations)
    .where(eq(registrations.id, registrationId))
    .limit(1);
  if (!current) return fail("Inscrição não encontrada.");

  await db.delete(registrations).where(eq(registrations.id, registrationId));
  await logAudit({
    actor: auth.user,
    action: "registration.delete",
    entityType: "registration",
    entityId: registrationId,
    summary: `Inscrição nº ${current.number} excluída (${current.name})`,
  });
  revalidatePath("/painel/inscricoes");
  return ok(undefined, "Inscrição excluída.");
}

/**
 * Exclui todas as inscrições de um evento (qualquer situação). Os cadastros em Participantes e as
 * fichas de saúde ficam: o banco só desfaz o vínculo com a inscrição.
 */
export async function deleteAllRegistrations(eventId: string): Promise<ActionResult> {
  const auth = await authorizeAction("inscricoes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success) return fail("Dados inválidos.");

  const db = getDb();
  const result = await db.transaction(async (tx): Promise<ActionResult<{ title: string; total: number }>> => {
    const [event] = await tx.select({ title: events.title }).from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) return fail("Evento não encontrado.");
    // Mesma trava da inscrição pública: nada entra no evento enquanto a exclusão acontece.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${eventId}))`);
    const deleted = await tx.delete(registrations).where(eq(registrations.eventId, eventId)).returning({ id: registrations.id });
    return ok({ title: event.title, total: deleted.length });
  });
  if (!result.ok) return result;

  const { title, total } = result.data as { title: string; total: number };
  if (!total) return fail("Este evento não tem inscrições.");

  await logAudit({
    actor: auth.user,
    action: "registration.delete_all",
    entityType: "event",
    entityId: eventId,
    summary: `${total} ${total === 1 ? "inscrição excluída" : "inscrições excluídas"} de uma vez: ${title}`,
    metadata: { total },
  });
  revalidatePath("/painel/inscricoes");
  revalidatePath("/painel/estoque");
  return ok(undefined, total === 1 ? "1 inscrição excluída." : `${total} inscrições excluídas.`);
}

function refreshRegistrationPages(registrationId?: string) {
  revalidatePath("/painel/inscricoes");
  revalidatePath("/painel/estoque");
  revalidatePath("/painel/gastos");
  if (registrationId) revalidatePath(`/painel/inscricoes/${registrationId}`);
}

/** Inscrição lançada pela equipe (evento Festa), mesmo com o formulário público fechado. */
export async function createFestaRegistration(
  eventId: string,
  input: { nome: string; telefone: string; email?: string; respostas: unknown },
): Promise<ActionResult<{ id: string }>> {
  const auth = await authorizeAction("inscricoes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success) return fail("Dados inválidos.");

  const [event] = await getDb()
    .select({ slug: events.slug, title: events.title, formModel: events.formModel })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event || event.formModel !== "festa") return fail("Evento não encontrado ou sem formulário Confraternização.");

  const result = await submitRegistration(event.slug, input, { fromPanel: true });
  if (!result.ok) {
    switch (result.error) {
      case "validacao":
        return fail("Confira os campos destacados.", {
          fieldErrors: Object.fromEntries(Object.entries(result.fieldErrors).map(([k, v]) => [k.replace(/^respostas\./, ""), v])),
        });
      case "sem_vagas":
        return fail(`Não há o suficiente de: ${result.itens.join(", ")}.`);
      case "duplicada":
        return fail("Já existe uma inscrição com este nome e telefone neste evento (pode estar cancelada). Abra e edite a existente.");
      default:
        return fail("Não foi possível criar a inscrição neste evento.");
    }
  }

  await logAudit({
    actor: auth.user,
    action: "registration.create",
    entityType: "registration",
    entityId: result.id,
    summary: `Inscrição nº ${result.summary.numero} lançada pelo painel: ${input.nome.trim()} (${event.title})`,
  });
  refreshRegistrationPages();
  return ok({ id: result.id }, `Inscrição nº ${result.summary.numero} criada.`);
}

/** Troca itens, valor, acompanhantes e demais respostas de uma inscrição de evento Festa. */
export async function updateFestaRegistration(registrationId: string, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction("inscricoes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(registrationId).success) return fail("Dados inválidos.");

  const db = getDb();
  const result = await db.transaction(async (tx): Promise<ActionResult<{ name: string; changed: boolean }>> => {
    const [found] = await tx
      .select({ eventId: registrations.eventId })
      .from(registrations)
      .where(eq(registrations.id, registrationId))
      .limit(1);
    if (!found) return fail("Inscrição não encontrada.");
    // Mesma trava da inscrição pública: o estoque não muda enquanto conferimos.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${found.eventId}))`);

    const [[current], [event]] = await Promise.all([
      tx.select().from(registrations).where(eq(registrations.id, registrationId)).for("update"),
      tx.select().from(events).where(eq(events.id, found.eventId)).limit(1),
    ]);
    const model = getFormModel(event?.formModel);
    if (!current || !event || model?.id !== "festa") return fail("Só inscrições de eventos de confraternização podem ser editadas aqui.");

    // Quem já contribuía com pagamento pode continuar, mesmo que o evento tenha deixado de oferecer.
    const formConfig = wantsValue(current.answers) ? { ...event.formConfig, aceitaValor: true } : event.formConfig;
    const parsed = model.parseAnswers(formConfig, input ?? {});
    if (!parsed.success) return fromZodError(parsed.error);
    // Passa pelo JSON para descartar campos indefinidos, como o banco guardaria.
    const answers = JSON.parse(JSON.stringify(parsed.data)) as Record<string, unknown>;

    if (current.status !== "cancelled") {
      const availability = await getFestaAvailability(event.id, event.formConfig, tx, registrationId);
      const missing = festaShortages(availability, answers, current.answers);
      if (missing.length) return fail(`Não há o suficiente de: ${missing.join(", ")}.`);
    }

    // O valor só é refeito se mudou o que a pessoa paga: trocar um item não aplica um preço novo do evento.
    const { valorPorPessoa } = festaConfigSchema.parse(event.formConfig);
    const priceChanged =
      wantsValue(current.answers) !== wantsValue(answers) || (valorPorPessoa && peopleCount(current.answers) !== peopleCount(answers));
    const repriced: Reprice = priceChanged
      ? repricePayment(current.payment, model.price(event.formConfig, answers, todayInSaoPaulo(new Date())))
      : { ok: true, payment: current.payment };
    if (!repriced.ok) {
      return fail(`Já foram recebidos ${formatCurrency(repriced.paidCents)}. Reabra o pagamento antes de baixar o valor.`);
    }

    const columns = model.columns(event.formConfig);
    const changes = columns
      .map((c) => ({ field: c.header, old: c.value(current.answers, current.payment), new: c.value(answers, repriced.payment) }))
      .filter((c) => c.old !== c.new);
    if (!changes.length) return ok({ name: current.name, changed: false });

    await tx
      .update(registrations)
      .set({
        answers,
        payment: repriced.payment,
        amountCents: repriced.payment?.valorFinalCentavos ?? 0,
        updatedAt: new Date(),
      })
      .where(eq(registrations.id, registrationId));
    await recordHistory(tx, { entityType: "registration", entityId: registrationId, actor: auth.user, changes });
    return ok({ name: current.name, changed: true });
  });
  if (!result.ok) return result;

  const { name, changed } = result.data!;
  if (!changed) return ok(undefined, "Nada mudou.");
  await logAudit({
    actor: auth.user,
    action: "registration.update",
    entityType: "registration",
    entityId: registrationId,
    summary: `Inscrição de ${name} editada`,
  });
  refreshRegistrationPages(registrationId);
  return ok(undefined, "Inscrição atualizada.");
}
