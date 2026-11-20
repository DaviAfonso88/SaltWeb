import { and, count, desc, eq, type SQL } from "drizzle-orm";

import { PAGE_SIZE } from "@/components/painel/Pagination";
import { getDb } from "@/lib/db";
import { visitors, type Visitor } from "@/lib/db/schema";

import type { AgeGroup } from "./options";

export type VisitorStatus = Visitor["status"];
export const VISITOR_STATUSES: VisitorStatus[] = ["new", "contacted", "archived"];

/** Visitantes ainda sem contato (aviso no menu e na visão geral). */
export async function countNewVisitors(): Promise<number> {
  const [{ total }] = await getDb().select({ total: count() }).from(visitors).where(eq(visitors.status, "new"));
  return total;
}

export async function listVisitors(params: { status?: VisitorStatus; group?: AgeGroup; page: number }) {
  const db = getDb();
  const filters: SQL[] = [];
  if (params.status) filters.push(eq(visitors.status, params.status));
  if (params.group) filters.push(eq(visitors.ageGroup, params.group));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(visitors)
      .where(where)
      .orderBy(desc(visitors.createdAt))
      .limit(PAGE_SIZE)
      .offset((params.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(visitors).where(where),
  ]);
  return { rows, total };
}

export async function getVisitor(id: string) {
  const [row] = await getDb().select().from(visitors).where(eq(visitors.id, id)).limit(1);
  return row ?? null;
}
