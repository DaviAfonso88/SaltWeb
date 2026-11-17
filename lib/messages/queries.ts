import { and, count, desc, eq, type SQL } from "drizzle-orm";

import { PAGE_SIZE } from "@/components/painel/Pagination";
import { getDb } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export type MessageKind = (typeof messages.$inferSelect)["kind"];
export type MessageStatus = (typeof messages.$inferSelect)["status"];

export const MESSAGE_KINDS: MessageKind[] = ["contato", "servir"];
export const MESSAGE_STATUSES: MessageStatus[] = ["new", "read", "archived"];

export async function countNewMessages(): Promise<number> {
  const [{ total }] = await getDb().select({ total: count() }).from(messages).where(eq(messages.status, "new"));
  return total;
}

export async function listMessages(params: { kind?: MessageKind; status?: MessageStatus; page: number }) {
  const db = getDb();
  const filters: SQL[] = [];
  if (params.kind) filters.push(eq(messages.kind, params.kind));
  if (params.status) filters.push(eq(messages.status, params.status));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(where)
      .orderBy(desc(messages.createdAt))
      .limit(PAGE_SIZE)
      .offset((params.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(messages).where(where),
  ]);
  return { rows, total };
}

export async function getMessage(id: string) {
  const [row] = await getDb().select().from(messages).where(eq(messages.id, id)).limit(1);
  return row ?? null;
}
