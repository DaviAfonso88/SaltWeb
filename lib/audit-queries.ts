import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { auditLog, users } from "@/lib/db/schema";

const PAGE = 50;

export async function listAudit(params: { action?: string; actorId?: string; page: number }) {
  const db = getDb();
  const filters: SQL[] = [];
  if (params.action) filters.push(ilike(auditLog.action, `${params.action}%`));
  if (params.actorId) filters.push(eq(auditLog.actorUserId, params.actorId));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        summary: auditLog.summary,
        actorLabel: auditLog.actorLabel,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        createdAt: auditLog.createdAt,
        ip: auditLog.ip,
      })
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.createdAt))
      .limit(PAGE)
      .offset((params.page - 1) * PAGE),
    db.select({ total: count() }).from(auditLog).where(where),
  ]);

  return { rows, total, pageSize: PAGE };
}

export async function listAuditActors() {
  return getDb().select({ id: users.id, name: users.name }).from(users).orderBy(users.name);
}
