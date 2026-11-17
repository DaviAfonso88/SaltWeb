import type { Db, Tx } from "@/lib/db";
import { entityHistory } from "@/lib/db/schema";

export type FieldChange = { field: string; old: unknown; new: unknown };

const asText = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/** Grava uma linha por campo que realmente mudou. */
export async function recordHistory(
  db: Db | Tx,
  params: {
    entityType: "registration" | "participant";
    entityId: string;
    actor: { id: string; name: string } | null;
    changes: FieldChange[];
  },
) {
  const rows = params.changes
    .map((c) => ({ field: c.field, oldValue: asText(c.old), newValue: asText(c.new) }))
    .filter((c) => c.oldValue !== c.newValue)
    .map((c) => ({
      entityType: params.entityType,
      entityId: params.entityId,
      field: c.field,
      oldValue: c.oldValue,
      newValue: c.newValue,
      actorUserId: params.actor?.id ?? null,
      actorLabel: params.actor?.name ?? null,
    }));
  if (rows.length) await db.insert(entityHistory).values(rows);
}

/** Compara `before` com `after` nos campos listados em `labels` (campo → rótulo legível). */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
  labels: Partial<Record<keyof T, string>>,
): FieldChange[] {
  const out: FieldChange[] = [];
  for (const key of Object.keys(labels) as (keyof T)[]) {
    if (!(key in after)) continue;
    out.push({ field: labels[key] as string, old: before[key], new: after[key] });
  }
  return out;
}
