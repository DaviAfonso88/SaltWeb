import { and, asc, count, eq, sql } from "drizzle-orm";

import { logAudit } from "@/lib/audit";
import { can, type SessionUser } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { events, participantHealth, participants } from "@/lib/db/schema";

// Único módulo (além das ações de escrita) que lê `participant_health`.
// Toda função exige `participantes.saude.ver` e registra a consulta na auditoria.

export type Health = typeof participantHealth.$inferSelect;

export class HealthAccessError extends Error {
  constructor() {
    super("Sem permissão para ver dados de saúde.");
    this.name = "HealthAccessError";
  }
}

function assertCanViewHealth(user: SessionUser) {
  if (!can(user, "participantes.saude.ver")) throw new HealthAccessError();
}

export const EMPTY_HEALTH = {
  bloodType: null,
  allergies: [],
  allergyReaction: null,
  allergyMedication: null,
  medications: [],
  conditions: [],
  conditionDetails: null,
  disability: null,
  disabilityDetails: null,
  dietaryRestrictions: [],
  physicalRestrictions: null,
  medicalNotes: [],
  otherHealthInfo: null,
  specialNeeds: false,
  specialNeedsDetails: null,
  extraAnswers: [],
} satisfies Omit<Health, "participantId" | "updatedAt">;

/** Ficha de saúde de um participante (registra a consulta). `health` é null se ainda não existe ficha. */
export async function getParticipantHealth(participantId: string, user: SessionUser) {
  assertCanViewHealth(user);
  const db = getDb();
  const [row] = await db
    .select({ name: participants.name, health: participantHealth })
    .from(participants)
    .leftJoin(participantHealth, eq(participantHealth.participantId, participants.id))
    .where(eq(participants.id, participantId))
    .limit(1);
  if (!row) return null;

  await logAudit({
    actor: user,
    action: "participant.health_view",
    entityType: "participant",
    entityId: participantId,
    summary: `Ficha de saúde de ${row.name} visualizada`,
  });
  return { name: row.name, health: row.health?.participantId ? row.health : null };
}

export type HealthListItem = { id: string; number: number; name: string; details: string[] };

const hasItems = (list: string[] | null | undefined) => Boolean(list && list.length);

/** Indicadores de saúde de um acampamento, com os nomes por categoria (auditoria nominal). */
export async function getHealthStats(eventId: string, user: SessionUser) {
  assertCanViewHealth(user);
  const db = getDb();
  const rows = await db
    .select({ id: participants.id, number: participants.number, name: participants.name, health: participantHealth })
    .from(participantHealth)
    .innerJoin(participants, eq(participants.id, participantHealth.participantId))
    .where(eq(participants.eventId, eventId))
    .orderBy(asc(participants.nameKey));

  const pick = (include: (h: Health) => boolean, detail: (h: Health) => string[]): HealthListItem[] =>
    rows.filter((r) => include(r.health)).map((r) => ({ id: r.id, number: r.number, name: r.name, details: detail(r.health) }));

  const allergies = pick((h) => hasItems(h.allergies), (h) => h.allergies);
  const medications = pick((h) => hasItems(h.medications), (h) => h.medications);
  const dietary = pick((h) => hasItems(h.dietaryRestrictions), (h) => h.dietaryRestrictions);
  const conditions = pick((h) => hasItems(h.conditions), (h) => h.conditions);
  const specialNeeds = pick((h) => h.specialNeeds, (h) => (h.specialNeedsDetails ? [h.specialNeedsDetails] : []));

  await logAudit({
    actor: user,
    action: "participant.health_stats_view",
    entityType: "event",
    entityId: eventId,
    summary: "Indicadores de saúde do acampamento visualizados (com nomes)",
    metadata: { allergies: allergies.length, medications: medications.length, dietary: dietary.length, conditions: conditions.length, specialNeeds: specialNeeds.length },
  });

  return { allergies, medications, dietary, conditions, specialNeeds };
}

export type HealthStats = Awaited<ReturnType<typeof getHealthStats>>;

/** Participantes com uma condição específica (registra a consulta). */
export async function filterByCondition(eventId: string, condition: string, user: SessionUser): Promise<HealthListItem[]> {
  assertCanViewHealth(user);
  const value = condition.trim().slice(0, 80);
  if (!value) return [];
  const rows = await getDb()
    .select({ id: participants.id, number: participants.number, name: participants.name, conditions: participantHealth.conditions })
    .from(participantHealth)
    .innerJoin(participants, eq(participants.id, participantHealth.participantId))
    .where(and(eq(participants.eventId, eventId), sql`exists (select 1 from unnest(${participantHealth.conditions}) as c where c ilike ${likePattern(value)})`))
    .orderBy(asc(participants.nameKey));

  await logAudit({
    actor: user,
    action: "participant.health_filter",
    entityType: "event",
    entityId: eventId,
    summary: `Participantes filtrados por condição de saúde "${value}"`,
    metadata: { condition: value, matches: rows.length },
  });
  return rows.map((r) => ({ id: r.id, number: r.number, name: r.name, details: r.conditions }));
}

const RETENTION_DAYS = 60;

const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, "\\$&")}%`;

/**
 * Acampamentos encerrados há mais de 60 dias que ainda guardam fichas de saúde.
 * Devolve só contagens (nenhum dado de saúde), por isso não exige a permissão de saúde.
 */
export async function listRetentionWarnings() {
  const rows = await getDb()
    .select({
      eventId: events.id,
      title: events.title,
      endedAt: sql<Date>`coalesce(${events.endsAt}, ${events.startsAt})`,
      healthRecords: count(participantHealth.participantId),
    })
    .from(events)
    .innerJoin(participants, eq(participants.eventId, events.id))
    .innerJoin(participantHealth, eq(participantHealth.participantId, participants.id))
    .where(and(eq(events.formModel, "acampamento"), sql`coalesce(${events.endsAt}, ${events.startsAt}) < now() - make_interval(days => ${RETENTION_DAYS})`))
    .groupBy(events.id)
    .orderBy(asc(events.startsAt));
  return rows.map((r) => ({ ...r, endedAt: new Date(r.endedAt) }));
}

export type RetentionWarning = Awaited<ReturnType<typeof listRetentionWarnings>>[number];

/** Resumo de saúde por participante, para a exportação com saúde. A rota que chama registra a auditoria. */
export async function getHealthSummaries(eventId: string, user: SessionUser) {
  assertCanViewHealth(user);
  const rows = await getDb()
    .select({ id: participants.id, health: participantHealth })
    .from(participantHealth)
    .innerJoin(participants, eq(participants.id, participantHealth.participantId))
    .where(eq(participants.eventId, eventId));
  return new Map(rows.map((r) => [r.id, r.health]));
}
