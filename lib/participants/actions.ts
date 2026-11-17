"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { getDb, type Tx } from "@/lib/db";
import { entityHistory, events, participantGuardians, participantHealth, participantNotes, participants, registrations } from "@/lib/db/schema";
import { diffFields, recordHistory } from "@/lib/history";
import { normalizeKey } from "@/lib/text";

import { nextParticipantNumber as nextNumber } from "./enroll";
import { searchParticipantsForMerge } from "./queries";

import {
  emergencyContactSchema,
  guardiansSchema,
  HEALTH_FIELD_LABELS,
  healthSchema,
  noteSchema,
  PARTICIPANT_FIELD_LABELS,
  participantSchema,
  type HealthInput,
} from "./schemas";

const idSchema = z.string().uuid();
const createSchema = participantSchema.extend({
  guardians: guardiansSchema.default([]),
  emergencyContact: emergencyContactSchema.default(null),
});

const actorOf = (user: { id: string; name: string }) => ({ id: user.id, name: user.name });

function refresh(participantId?: string) {
  revalidatePath("/painel/participantes");
  if (participantId) revalidatePath(`/painel/participantes/${participantId}`);
  revalidatePath("/painel");
}

async function getCampEvent(tx: Tx | ReturnType<typeof getDb>, eventId: string) {
  const [event] = await tx.select({ id: events.id, title: events.title, formModel: events.formModel }).from(events).where(eq(events.id, eventId)).limit(1);
  return event?.formModel === "acampamento" ? event : null;
}

// ------------------------------------------------------------------ criar e editar

export async function createParticipant(eventId: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const auth = await authorizeAction("participantes.editar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success) return fail("Dados inválidos.");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const { guardians, emergencyContact, ...data } = parsed.data;

  const db = getDb();
  const created = await db.transaction(async (tx) => {
    const event = await getCampEvent(tx, eventId);
    if (!event) return null;
    const number = await nextNumber(tx, eventId);
    const [row] = await tx
      .insert(participants)
      .values({ ...data, eventId, number, nameKey: normalizeKey(data.name), emergencyContact, source: "manual" })
      .returning({ id: participants.id });
    if (guardians.length) {
      await tx.insert(participantGuardians).values(guardians.map((g, position) => ({ ...g, participantId: row.id, position })));
    }
    return { id: row.id, number, title: event.title };
  });
  if (!created) return fail("Acampamento não encontrado.");

  await logAudit({
    actor: auth.user,
    action: "participant.create",
    entityType: "participant",
    entityId: created.id,
    summary: `Participante ${data.name} criado em ${created.title}`,
  });
  refresh();
  return ok({ id: created.id }, "Participante criado.");
}

export async function updateParticipant(id: string, version: number, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction("participantes.editar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(id).success) return fail("Dados inválidos.");
  const parsed = participantSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const result = await getDb().transaction(async (tx): Promise<ActionResult> => {
    const [current] = await tx.select().from(participants).where(eq(participants.id, id)).limit(1);
    if (!current) return fail("Participante não encontrado.");
    if (current.version !== version) {
      return fail("Este cadastro foi alterado por outra pessoa. Atualize a página para ver a versão atual.", { conflict: true });
    }
    const [updated] = await tx
      .update(participants)
      .set({ ...data, nameKey: normalizeKey(data.name), version: current.version + 1, updatedAt: new Date() })
      .where(and(eq(participants.id, id), eq(participants.version, current.version)))
      .returning({ id: participants.id });
    if (!updated) return fail("Este cadastro foi alterado por outra pessoa.", { conflict: true });

    await recordHistory(tx, {
      entityType: "participant",
      entityId: id,
      actor: actorOf(auth.user),
      changes: diffFields(current, data, PARTICIPANT_FIELD_LABELS),
    });
    return ok(undefined, "Cadastro salvo.");
  });

  if (result.ok) {
    await logAudit({ actor: auth.user, action: "participant.update", entityType: "participant", entityId: id, summary: `Participante ${data.name} atualizado` });
    refresh(id);
  }
  return result;
}

export async function saveGuardians(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction("participantes.editar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(id).success) return fail("Dados inválidos.");
  const parsed = guardiansSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const result = await getDb().transaction(async (tx): Promise<ActionResult> => {
    const [current] = await tx.select({ name: participants.name }).from(participants).where(eq(participants.id, id)).limit(1);
    if (!current) return fail("Participante não encontrado.");
    const before = await tx.select({ name: participantGuardians.name }).from(participantGuardians).where(eq(participantGuardians.participantId, id));

    await tx.delete(participantGuardians).where(eq(participantGuardians.participantId, id));
    if (parsed.data.length) {
      await tx.insert(participantGuardians).values(parsed.data.map((g, position) => ({ ...g, participantId: id, position })));
    }
    await recordHistory(tx, {
      entityType: "participant",
      entityId: id,
      actor: actorOf(auth.user),
      changes: [{ field: "Responsáveis", old: before.map((g) => g.name).join(", "), new: parsed.data.map((g) => g.name).join(", ") }],
    });
    return ok(undefined, "Responsáveis salvos.");
  });

  if (result.ok) {
    await logAudit({ actor: auth.user, action: "participant.guardians", entityType: "participant", entityId: id, summary: "Responsáveis do participante atualizados" });
    refresh(id);
  }
  return result;
}

export async function saveEmergencyContact(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction("participantes.editar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(id).success) return fail("Dados inválidos.");
  const parsed = emergencyContactSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const result = await getDb().transaction(async (tx): Promise<ActionResult> => {
    const [current] = await tx.select({ contact: participants.emergencyContact }).from(participants).where(eq(participants.id, id)).limit(1);
    if (!current) return fail("Participante não encontrado.");
    await tx.update(participants).set({ emergencyContact: parsed.data, updatedAt: new Date() }).where(eq(participants.id, id));
    await recordHistory(tx, {
      entityType: "participant",
      entityId: id,
      actor: actorOf(auth.user),
      changes: [{ field: "Contato de emergência", old: current.contact, new: parsed.data }],
    });
    return ok(undefined, "Contato de emergência salvo.");
  });

  if (result.ok) refresh(id);
  return result;
}

// ------------------------------------------------------------------ saúde e observações

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export async function updateParticipantHealth(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction("participantes.saude.editar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(id).success) return fail("Dados inválidos.");
  const parsed = healthSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const data = parsed.data;

  const changedLabels = await getDb().transaction(async (tx): Promise<string[] | null> => {
    const [person] = await tx.select({ id: participants.id }).from(participants).where(eq(participants.id, id)).limit(1);
    if (!person) return null;
    const [before] = await tx.select().from(participantHealth).where(eq(participantHealth.participantId, id)).limit(1);

    const keys = Object.keys(HEALTH_FIELD_LABELS) as (keyof HealthInput)[];
    const changed = keys.filter((k) => !sameValue(before?.[k] ?? (Array.isArray(data[k]) ? [] : k === "specialNeeds" ? false : null), data[k]));

    await tx
      .insert(participantHealth)
      .values({ participantId: id, ...data })
      .onConflictDoUpdate({ target: participantHealth.participantId, set: { ...data, updatedAt: new Date() } });

    const labels = changed.map((k) => HEALTH_FIELD_LABELS[k]);
    if (labels.length) {
      // O histórico é visível a quem só tem `participantes.ver`: registra os campos, nunca os valores.
      await recordHistory(tx, {
        entityType: "participant",
        entityId: id,
        actor: actorOf(auth.user),
        changes: [{ field: "Ficha de saúde", old: null, new: `Alterado: ${labels.join(", ")}` }],
      });
    }
    return labels;
  });

  if (changedLabels === null) return fail("Participante não encontrado.");
  await logAudit({
    actor: auth.user,
    action: "participant.health_update",
    entityType: "participant",
    entityId: id,
    summary: "Ficha de saúde atualizada",
    metadata: { fields: changedLabels },
  });
  refresh(id);
  return ok(undefined, "Ficha de saúde salva.");
}

export async function addParticipantNote(id: string, input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction("participantes.observacoes");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(id).success) return fail("Dados inválidos.");
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  const [person] = await getDb().select({ name: participants.name }).from(participants).where(eq(participants.id, id)).limit(1);
  if (!person) return fail("Participante não encontrado.");

  await getDb().insert(participantNotes).values({ participantId: id, body: parsed.data.body, authorUserId: auth.user.id, authorLabel: auth.user.name });
  await logAudit({ actor: auth.user, action: "participant.note", entityType: "participant", entityId: id, summary: `Observação registrada em ${person.name}` });
  refresh(id);
  return ok(undefined, "Observação registrada.");
}

// ------------------------------------------------------------------ a partir das inscrições

export async function generateParticipantsFromRegistrations(eventId: string): Promise<ActionResult<{ created: number; linked: number }>> {
  const auth = await authorizeAction("participantes.editar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success) return fail("Dados inválidos.");

  const outcome = await getDb().transaction(async (tx) => {
    const event = await getCampEvent(tx, eventId);
    if (!event) return null;
    let next = await nextNumber(tx, eventId);

    const pending = await tx
      .select({ reg: registrations })
      .from(registrations)
      .leftJoin(participants, eq(participants.registrationId, registrations.id))
      .where(and(eq(registrations.eventId, eventId), eq(registrations.status, "confirmed"), isNull(participants.id)))
      .orderBy(registrations.number);

    const existing = await tx
      .select({ id: participants.id, nameKey: participants.nameKey })
      .from(participants)
      .where(and(eq(participants.eventId, eventId), isNull(participants.registrationId)));
    const byKey = new Map<string, string[]>();
    for (const p of existing) byKey.set(p.nameKey, [...(byKey.get(p.nameKey) ?? []), p.id]);

    let created = 0;
    let linked = 0;
    for (const { reg } of pending) {
      const matches = byKey.get(reg.nameKey);
      if (matches?.length === 1) {
        // Já existe um cadastro (ex.: importado) com este nome: vincula em vez de duplicar.
        await tx.update(participants).set({ registrationId: reg.id, updatedAt: new Date() }).where(eq(participants.id, matches[0]));
        byKey.delete(reg.nameKey);
        linked++;
        continue;
      }
      const answers = reg.answers as Record<string, unknown>;
      await tx.insert(participants).values({
        eventId,
        number: next++,
        registrationId: reg.id,
        name: reg.name,
        nameKey: reg.nameKey,
        mobile: reg.phone,
        email: reg.email,
        church: typeof answers.igreja === "string" ? answers.igreja : null,
        city: typeof answers.cidade === "string" ? answers.cidade : null,
        source: "registration",
      });
      created++;
    }
    return { created, linked, title: event.title };
  });
  if (!outcome) return fail("Acampamento não encontrado.");

  await logAudit({
    actor: auth.user,
    action: "participant.generate",
    entityType: "event",
    entityId: eventId,
    summary: `Participantes gerados a partir das inscrições de ${outcome.title}: ${outcome.created} novos, ${outcome.linked} vinculados`,
    metadata: { created: outcome.created, linked: outcome.linked },
  });
  refresh();
  const { created, linked } = outcome;
  const message = created || linked ? `${created} participante(s) criado(s)${linked ? ` e ${linked} vinculado(s) a cadastros existentes` : ""}.` : "Todas as inscrições confirmadas já têm participante.";
  return ok({ created, linked }, message);
}

// ------------------------------------------------------------------ mescla

const SCALAR_FIELDS = ["sex", "birthDate", "cpf", "rg", "church", "city", "address", "mobile", "whatsapp", "email"] as const;
const TEXT_HEALTH_FIELDS = ["bloodType", "allergyReaction", "allergyMedication", "conditionDetails", "disability", "disabilityDetails", "physicalRestrictions", "otherHealthInfo", "specialNeedsDetails"] as const;
const LIST_HEALTH_FIELDS = ["allergies", "medications", "conditions", "dietaryRestrictions", "medicalNotes"] as const;

const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

export async function mergeParticipants(principalId: string, otherId: string): Promise<ActionResult<{ id: string }>> {
  const auth = await authorizeAction("participantes.mesclar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(principalId).success || !idSchema.safeParse(otherId).success || principalId === otherId) return fail("Dados inválidos.");

  const result = await getDb().transaction(async (tx): Promise<ActionResult<{ id: string }> & { summary?: string }> => {
    const rows = await tx.select().from(participants).where(inArray(participants.id, [principalId, otherId]));
    const principal = rows.find((r) => r.id === principalId);
    const other = rows.find((r) => r.id === otherId);
    if (!principal || !other) return fail("Participante não encontrado.");
    if (principal.eventId !== other.eventId) return fail("Só é possível mesclar cadastros do mesmo acampamento.");

    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`participants:${principal.eventId}`}))`);

    // Campos vazios do principal recebem os do outro.
    const fill: Partial<typeof participants.$inferInsert> = {};
    for (const f of SCALAR_FIELDS) if (!principal[f] && other[f]) (fill as Record<string, unknown>)[f] = other[f];
    if (!principal.emergencyContact && other.emergencyContact) fill.emergencyContact = other.emergencyContact;
    if (!principal.authorizationDeclared && other.authorizationDeclared) fill.authorizationDeclared = true;

    // A inscrição de origem só pode estar em um cadastro (unique): libera do outro antes.
    const takeRegistration = !principal.registrationId && other.registrationId;
    if (other.registrationId) await tx.update(participants).set({ registrationId: null }).where(eq(participants.id, otherId));
    if (takeRegistration) fill.registrationId = other.registrationId;

    await tx
      .update(participants)
      .set({ ...fill, version: principal.version + 1, updatedAt: new Date() })
      .where(eq(participants.id, principalId));

    // Responsáveis (sem repetir nome + telefone) e observações passam para o principal.
    const [principalGuardians, otherGuardians] = await Promise.all([
      tx.select().from(participantGuardians).where(eq(participantGuardians.participantId, principalId)),
      tx.select().from(participantGuardians).where(eq(participantGuardians.participantId, otherId)),
    ]);
    const seen = new Set(principalGuardians.map((g) => `${normalizeKey(g.name)}|${g.phone.replace(/\D/g, "")}`));
    let position = principalGuardians.length;
    for (const g of otherGuardians) {
      const key = `${normalizeKey(g.name)}|${g.phone.replace(/\D/g, "")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await tx.update(participantGuardians).set({ participantId: principalId, position: position++ }).where(eq(participantGuardians.id, g.id));
    }
    await tx.update(participantNotes).set({ participantId: principalId }).where(eq(participantNotes.participantId, otherId));

    // Ficha de saúde: une listas e completa campos vazios.
    const [pHealth] = await tx.select().from(participantHealth).where(eq(participantHealth.participantId, principalId)).limit(1);
    const [oHealth] = await tx.select().from(participantHealth).where(eq(participantHealth.participantId, otherId)).limit(1);
    if (oHealth && !pHealth) {
      await tx.update(participantHealth).set({ participantId: principalId }).where(eq(participantHealth.participantId, otherId));
    } else if (oHealth && pHealth) {
      const merged: Partial<typeof participantHealth.$inferInsert> = { specialNeeds: pHealth.specialNeeds || oHealth.specialNeeds, updatedAt: new Date() };
      for (const f of TEXT_HEALTH_FIELDS) if (!pHealth[f] && oHealth[f]) (merged as Record<string, unknown>)[f] = oHealth[f];
      for (const f of LIST_HEALTH_FIELDS) (merged as Record<string, unknown>)[f] = union(pHealth[f], oHealth[f]);
      // Respostas às perguntas extras: mantém as do principal; se ele não tem, usa as do outro cadastro.
      if (!pHealth.extraAnswers.length && oHealth.extraAnswers.length) merged.extraAnswers = oHealth.extraAnswers;
      await tx.update(participantHealth).set(merged).where(eq(participantHealth.participantId, principalId));
    }

    // Histórico do outro cadastro acompanha o principal.
    await tx
      .update(entityHistory)
      .set({ entityId: principalId })
      .where(and(eq(entityHistory.entityType, "participant"), eq(entityHistory.entityId, otherId)));
    await recordHistory(tx, {
      entityType: "participant",
      entityId: principalId,
      actor: actorOf(auth.user),
      changes: [{ field: "Mescla", old: null, new: `Cadastro nº ${other.number} (${other.name}) mesclado a este` }],
    });

    await tx.delete(participants).where(eq(participants.id, otherId));
    return { ...ok({ id: principalId }, "Cadastros mesclados."), summary: `Cadastro nº ${other.number} (${other.name}) mesclado em ${principal.name}` };
  });

  if (result.ok) {
    await logAudit({ actor: auth.user, action: "participant.merge", entityType: "participant", entityId: principalId, summary: (result as { summary?: string }).summary ?? "Cadastros mesclados", metadata: { removedId: otherId } });
    refresh(principalId);
  }
  return result;
}

// ------------------------------------------------------------------ exclusão

export async function deleteParticipant(id: string): Promise<ActionResult> {
  const auth = await authorizeAction("participantes.excluir");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(id).success) return fail("Dados inválidos.");

  const removed = await getDb().transaction(async (tx) => {
    const [current] = await tx.select({ name: participants.name, number: participants.number }).from(participants).where(eq(participants.id, id)).limit(1);
    if (!current) return null;
    await tx.delete(entityHistory).where(and(eq(entityHistory.entityType, "participant"), eq(entityHistory.entityId, id)));
    await tx.delete(participants).where(eq(participants.id, id));
    return current;
  });
  if (!removed) return fail("Participante não encontrado.");

  await logAudit({ actor: auth.user, action: "participant.delete", entityType: "participant", entityId: id, summary: `Participante nº ${removed.number} (${removed.name}) excluído` });
  refresh();
  return ok(undefined, "Participante excluído.");
}

/** Exclusão em lote: exige digitar o título exato do acampamento. Remove também fichas de saúde e histórico. */
export async function deleteAllParticipants(eventId: string, typedTitle: string): Promise<ActionResult<{ deleted: number }>> {
  const auth = await authorizeAction("participantes.excluir");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success || typeof typedTitle !== "string") return fail("Dados inválidos.");

  const outcome = await getDb().transaction(async (tx) => {
    const event = await getCampEvent(tx, eventId);
    if (!event) return { error: "Acampamento não encontrado." } as const;
    if (typedTitle.trim() !== event.title) return { error: "O título digitado não confere com o do acampamento." } as const;

    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`participants:${eventId}`}))`);
    await tx.execute(sql`delete from ${entityHistory} where ${entityHistory.entityType} = 'participant'
      and ${entityHistory.entityId} in (select ${participants.id} from ${participants} where ${participants.eventId} = ${eventId})`);
    const deleted = await tx.delete(participants).where(eq(participants.eventId, eventId)).returning({ id: participants.id });
    return { deleted: deleted.length, title: event.title } as const;
  });
  if (outcome.error !== undefined) return fail(outcome.error);

  await logAudit({
    actor: auth.user,
    action: "participant.delete_all",
    entityType: "event",
    entityId: eventId,
    summary: `Todos os participantes de ${outcome.title} excluídos (${outcome.deleted})`,
    metadata: { deleted: outcome.deleted },
  });
  refresh();
  return ok({ deleted: outcome.deleted }, `${outcome.deleted} participante(s) excluído(s).`);
}

// ------------------------------------------------------------------ busca para a mescla

export async function searchMergeCandidates(eventId: string, excludeId: string, query: string) {
  const auth = await authorizeAction("participantes.mesclar");
  if (!auth.ok || !idSchema.safeParse(eventId).success || !idSchema.safeParse(excludeId).success || typeof query !== "string") return [];
  return searchParticipantsForMerge(eventId, excludeId, query.slice(0, 100));
}
