import { headers } from "next/headers";

import { getDb, type Db, type Tx } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { describeError } from "@/lib/safe-error";

export type AuditActor = { id: string; name?: string; email?: string } | null;

export type AuditEntry = {
  actor: AuditActor;
  /** Usado quando não há usuário (ex.: login com falha). */
  actorLabel?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

async function clientIp() {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip") ?? null;
  } catch {
    return null;
  }
}

/** Registra uma ação sensível. Nunca lança: falha de auditoria é só logada. */
export async function logAudit(entry: AuditEntry, db: Db | Tx = getDb()) {
  try {
    await db.insert(auditLog).values({
      actorUserId: entry.actor?.id ?? null,
      actorLabel: entry.actorLabel ?? entry.actor?.name ?? entry.actor?.email ?? null,
      action: entry.action,
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
      ip: await clientIp(),
    });
  } catch (error) {
    console.error("[audit] falha ao registrar", entry.action, describeError(error));
  }
}
