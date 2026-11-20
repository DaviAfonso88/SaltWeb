"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { recordHistory } from "@/lib/history";

import { isSinglePayment, paymentInstallments } from "./payment";

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
