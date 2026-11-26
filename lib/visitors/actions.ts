"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { visitors } from "@/lib/db/schema";

const idSchema = z.string().uuid();
const LABEL = { new: "novo", contacted: "contatado", archived: "arquivado" } as const;

function refresh(id?: string) {
  revalidatePath("/painel/visitantes");
  if (id) revalidatePath(`/painel/visitantes/${id}`);
  // Contador de novos no menu e no Dashboard.
  revalidatePath("/painel", "layout");
}

export async function setVisitorStatus(visitorId: string, status: "new" | "contacted" | "archived"): Promise<ActionResult> {
  const auth = await authorizeAction("visitantes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(visitorId).success || !(status in LABEL)) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db
    .select({ name: visitors.name, status: visitors.status, contactedAt: visitors.contactedAt })
    .from(visitors)
    .where(eq(visitors.id, visitorId))
    .limit(1);
  if (!current) return fail("Visitante não encontrado.");
  if (current.status === status) return ok(undefined, `Visitante já está como ${LABEL[status]}.`);

  // "Contatado" guarda quem falou com o visitante (desarquivar mantém o registro original);
  // voltar para "novo" limpa esse registro. Arquivar não mexe nele.
  const contact =
    status === "contacted"
      ? current.contactedAt
        ? {}
        : { contactedAt: new Date(), contactedBy: auth.user.id, contactedByLabel: auth.user.name }
      : status === "new"
        ? { contactedAt: null, contactedBy: null, contactedByLabel: null }
        : {};

  await db
    .update(visitors)
    .set({ status, ...contact })
    .where(eq(visitors.id, visitorId));
  await logAudit({
    actor: auth.user,
    action: "visitor.status",
    entityType: "visitor",
    entityId: visitorId,
    summary: `Visitante ${current.name} marcado como ${LABEL[status]}`,
  });
  refresh(visitorId);
  return ok(undefined, `Visitante marcado como ${LABEL[status]}.`);
}

export async function deleteVisitor(visitorId: string): Promise<ActionResult> {
  const auth = await authorizeAction("visitantes.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(visitorId).success) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db.select({ name: visitors.name }).from(visitors).where(eq(visitors.id, visitorId)).limit(1);
  if (!current) return fail("Visitante não encontrado.");

  await db.delete(visitors).where(eq(visitors.id, visitorId));
  await logAudit({
    actor: auth.user,
    action: "visitor.delete",
    entityType: "visitor",
    entityId: visitorId,
    summary: `Visitante ${current.name} excluído`,
  });
  refresh();
  return ok(undefined, "Visitante excluído.");
}
