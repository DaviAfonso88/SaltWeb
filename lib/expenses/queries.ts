import { desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { eventExpenses } from "@/lib/db/schema";

/** Gastos do evento, do mais recente para o mais antigo, e o total. */
export async function listExpenses(eventId: string) {
  const rows = await getDb()
    .select()
    .from(eventExpenses)
    .where(eq(eventExpenses.eventId, eventId))
    .orderBy(desc(sql`coalesce(${eventExpenses.spentOn}, ${eventExpenses.createdAt}::date)`), desc(eventExpenses.createdAt));
  return { rows, totalCents: rows.reduce((sum, r) => sum + r.amountCents, 0) };
}
