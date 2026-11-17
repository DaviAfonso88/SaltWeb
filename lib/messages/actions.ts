"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { messages } from "@/lib/db/schema";

const idSchema = z.string().uuid();
const LABEL = { new: "não lida", read: "lida", archived: "arquivada" } as const;

function refresh(id?: string) {
  revalidatePath("/painel/mensagens");
  if (id) revalidatePath(`/painel/mensagens/${id}`);
  revalidatePath("/painel", "layout");
}

export async function setMessageStatus(messageId: string, status: "new" | "read" | "archived"): Promise<ActionResult> {
  const auth = await authorizeAction("mensagens.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(messageId).success || !(status in LABEL)) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db.select({ name: messages.name }).from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!current) return fail("Mensagem não encontrada.");

  await db
    .update(messages)
    .set({ status, readAt: status === "new" ? null : new Date() })
    .where(eq(messages.id, messageId));
  await logAudit({
    actor: auth.user,
    action: "message.status",
    entityType: "message",
    entityId: messageId,
    summary: `Mensagem de ${current.name} marcada como ${LABEL[status]}`,
  });
  refresh(messageId);
  return ok(undefined, `Mensagem marcada como ${LABEL[status]}.`);
}

/** Marca como lida ao abrir, sem auditar (é só leitura). Não faz nada se já não for nova. */
export async function markMessageRead(messageId: string): Promise<void> {
  const auth = await authorizeAction("mensagens.ver");
  if (!auth.ok || !idSchema.safeParse(messageId).success) return;
  await getDb()
    .update(messages)
    .set({ status: "read", readAt: new Date() })
    .where(and(eq(messages.id, messageId), eq(messages.status, "new")));
  revalidatePath("/painel", "layout");
}

export async function deleteMessage(messageId: string): Promise<ActionResult> {
  const auth = await authorizeAction("mensagens.gerenciar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(messageId).success) return fail("Dados inválidos.");

  const db = getDb();
  const [current] = await db.select({ name: messages.name, kind: messages.kind }).from(messages).where(eq(messages.id, messageId)).limit(1);
  if (!current) return fail("Mensagem não encontrada.");

  await db.delete(messages).where(eq(messages.id, messageId));
  await logAudit({
    actor: auth.user,
    action: "message.delete",
    entityType: "message",
    entityId: messageId,
    summary: `Mensagem (${current.kind}) de ${current.name} excluída`,
  });
  refresh();
  return ok(undefined, "Mensagem excluída.");
}
