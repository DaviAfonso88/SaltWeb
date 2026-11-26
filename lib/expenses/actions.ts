"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { eventExpenses, events } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/format";

const expenseSchema = z.object({
  eventId: z.string().uuid(),
  description: z.string().trim().min(2, "Descreva o gasto.").max(120, "Use no máximo 120 caracteres."),
  /** Em reais, como o campo numérico envia ("35.90"). */
  amount: z
    .string()
    .trim()
    .transform((v) => Math.round(Number(v.replace(",", ".")) * 100))
    .refine((cents) => Number.isInteger(cents) && cents > 0 && cents <= 100_000_000, "Informe um valor maior que zero."),
  paidBy: z
    .string()
    .trim()
    .max(80, "Use no máximo 80 caracteres.")
    .transform((v) => v || null),
  spentOn: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().date().safeParse(v).success, "Data inválida.")
    .transform((v) => v || null),
});

export async function addExpense(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction("gastos.gerenciar");
  if (!auth.ok) return auth.result;

  const text = (key: string) => String(formData.get(key) ?? "");
  const parsed = expenseSchema.safeParse({
    eventId: text("eventId"),
    description: text("description"),
    amount: text("amount"),
    paidBy: text("paidBy"),
    spentOn: text("spentOn"),
  });
  if (!parsed.success) return fromZodError(parsed.error);
  const { eventId, description, amount, paidBy, spentOn } = parsed.data;

  const db = getDb();
  const [event] = await db.select({ title: events.title }).from(events).where(eq(events.id, eventId)).limit(1);
  if (!event) return fail("Evento não encontrado.");

  const [created] = await db
    .insert(eventExpenses)
    .values({ eventId, description, amountCents: amount, paidBy, spentOn, createdBy: auth.user.id, createdByLabel: auth.user.name })
    .returning({ id: eventExpenses.id });

  await logAudit({
    actor: auth.user,
    action: "expense.create",
    entityType: "expense",
    entityId: created.id,
    summary: `Gasto lançado em ${event.title}: ${description} (${formatCurrency(amount)})`,
  });
  revalidatePath("/painel/gastos");
  return ok(undefined, "Gasto lançado.");
}

export async function deleteExpense(expenseId: string): Promise<ActionResult> {
  const auth = await authorizeAction("gastos.gerenciar");
  if (!auth.ok) return auth.result;
  if (!z.string().uuid().safeParse(expenseId).success) return fail("Dados inválidos.");

  const [deleted] = await getDb()
    .delete(eventExpenses)
    .where(eq(eventExpenses.id, expenseId))
    .returning({ description: eventExpenses.description, amountCents: eventExpenses.amountCents });
  if (!deleted) return fail("Gasto não encontrado.");

  await logAudit({
    actor: auth.user,
    action: "expense.delete",
    entityType: "expense",
    entityId: expenseId,
    summary: `Gasto excluído: ${deleted.description} (${formatCurrency(deleted.amountCents)})`,
  });
  revalidatePath("/painel/gastos");
  return ok(undefined, "Gasto excluído.");
}
