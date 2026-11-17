"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction, can } from "@/lib/auth/guard";
import { getDb, type Db, type Tx } from "@/lib/db";
import { events, importBatches, importMappings, participantGuardians, participantHealth, participantNotes, participants } from "@/lib/db/schema";
import { recordHistory } from "@/lib/history";
import { normalizeKey, onlyDigits, phoneKey } from "@/lib/text";

import { applyMapping, autoMapColumns, headerSignature, IGNORED, TARGET_FIELDS, type ColumnMapping } from "./import/mapper";
import { classifyMatch, type MatchCandidate, type MatchOutcome } from "./import/matcher";
import { buildRecord, type ImportRecord } from "./import/record";
import { MAX_IMPORT_ROWS, type CommitPayload, type ImportCommitResult, type ImportPayload, type ImportPreview, type PreviewPerson } from "./import/types";

const idSchema = z.string().uuid();

const payloadSchema = z.object({
  fileName: z.string().trim().min(1, "Arquivo sem nome.").max(200),
  headers: z.array(z.string().max(200)).min(1, "A planilha não tem cabeçalho.").max(200, "Colunas demais."),
  rows: z
    .array(z.record(z.string(), z.string().nullish()))
    .min(1, "A planilha não tem linhas.")
    .max(MAX_IMPORT_ROWS, `Importe até ${MAX_IMPORT_ROWS.toLocaleString("pt-BR")} linhas por vez.`),
  mapping: z.record(z.string(), z.string()).optional(),
});

const commitSchema = payloadSchema.extend({
  mapping: z.record(z.string(), z.string()),
  decisions: z
    .record(z.string(), z.union([z.literal("new"), z.literal("skip"), z.object({ update: z.string().uuid() })]))
    .default({}),
});

const VALID_FIELDS = new Set<string>([...TARGET_FIELDS, IGNORED]);

/** Mantém só colunas existentes e campos de destino válidos. */
function sanitizeMapping(headers: string[], mapping: ColumnMapping): ColumnMapping {
  return Object.fromEntries(headers.map((h) => [h, VALID_FIELDS.has(mapping[h] ?? "") ? mapping[h] : IGNORED]));
}

async function getCampEvent(db: Db | Tx, eventId: string) {
  const [event] = await db.select({ id: events.id, title: events.title, formModel: events.formModel }).from(events).where(eq(events.id, eventId)).limit(1);
  return event?.formModel === "acampamento" ? event : null;
}

type Row =
  | { row: number; kind: "invalid"; reason: string; name?: string }
  | { row: number; kind: "ok"; record: ImportRecord; outcome: MatchOutcome };

/** Lê, valida e classifica cada linha contra os cadastros do acampamento (e contra linhas anteriores do arquivo). */
async function analyze(db: Db | Tx, eventId: string, payload: ImportPayload, mapping: ColumnMapping, canImportHealth: boolean) {
  const existing = await db
    .select({ id: participants.id, name: participants.name, cpf: participants.cpf, email: participants.email, mobile: participants.mobile, birthDate: participants.birthDate })
    .from(participants)
    .where(eq(participants.eventId, eventId));
  const candidates: MatchCandidate[] = existing;

  const rows: Row[] = [];
  let blank = 0;
  const seen = new Map<string, number>();

  payload.rows.forEach((raw, index) => {
    const row = index + 2;
    const data = applyMapping(raw, mapping);
    if (!Object.keys(data).length) {
      blank++;
      return;
    }
    const built = buildRecord(data, { canImportHealth });
    if (!built.ok) {
      rows.push({ row, kind: "invalid", reason: built.reason, name: built.name });
      return;
    }
    const { participant } = built.record;
    const nameKey = normalizeKey(participant.name);
    const keys = [
      participant.cpf ? `cpf:${participant.cpf}` : null,
      participant.birthDate ? `nb:${nameKey}|${participant.birthDate}` : null,
      participant.mobile && phoneKey(participant.mobile).length >= 10 ? `np:${nameKey}|${phoneKey(participant.mobile)}` : null,
    ].filter((k): k is string => k !== null);
    const duplicateOf = keys.map((k) => seen.get(k)).find((r) => r !== undefined);
    if (duplicateOf !== undefined) {
      rows.push({ row, kind: "invalid", reason: `Repetida na planilha (mesma pessoa da linha ${duplicateOf}).`, name: participant.name });
      return;
    }
    for (const k of keys) seen.set(k, row);

    rows.push({ row, kind: "ok", record: built.record, outcome: classifyMatch(participant, candidates) });
  });

  return { rows, blank };
}

const person = (row: number, record: ImportRecord): PreviewPerson => ({
  row,
  name: record.participant.name,
  church: record.participant.church,
  city: record.participant.city,
  birthDate: record.participant.birthDate,
  mobile: record.participant.mobile,
  warnings: record.warnings,
});

export async function previewImport(eventId: string, input: unknown): Promise<ActionResult<ImportPreview>> {
  const auth = await authorizeAction("participantes.importar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success) return fail("Dados inválidos.");
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Planilha inválida.");
  const payload = parsed.data as ImportPayload;

  const db = getDb();
  if (!(await getCampEvent(db, eventId))) return fail("Acampamento não encontrado.");

  const signature = headerSignature(payload.headers);
  const auto = autoMapColumns(payload.headers);
  let mapping: ColumnMapping;
  let mappingSource: ImportPreview["mappingSource"];
  if (payload.mapping) {
    mapping = sanitizeMapping(payload.headers, payload.mapping);
    mappingSource = "manual";
  } else {
    const [saved] = await db.select().from(importMappings).where(eq(importMappings.signature, signature)).limit(1);
    if (saved) {
      mapping = sanitizeMapping(payload.headers, Object.fromEntries(payload.headers.map((h) => [h, saved.mapping[h] ?? auto[h]])));
      mappingSource = "salvo";
    } else {
      mapping = auto;
      mappingSource = "sugerido";
    }
  }

  if (!Object.values(mapping).includes("nome")) {
    // Sem a coluna de nome não há o que classificar: devolve o mapeamento para a pessoa ajustar.
    return ok(
      { mapping, mappingSource, signature, totals: { linhas: payload.rows.length, novos: 0, atualizacoes: 0, revisao: 0, invalidas: 0, vazias: 0 }, novos: [], atualizacoes: [], revisao: [], invalidas: [] },
      "Associe uma coluna ao campo Nome para continuar.",
    );
  }

  const { rows, blank } = await analyze(db, eventId, payload, mapping, can(auth.user, "participantes.saude.editar"));
  const preview: ImportPreview = {
    mapping,
    mappingSource,
    signature,
    totals: { linhas: payload.rows.length, novos: 0, atualizacoes: 0, revisao: 0, invalidas: 0, vazias: blank },
    novos: [],
    atualizacoes: [],
    revisao: [],
    invalidas: [],
  };
  for (const r of rows) {
    if (r.kind === "invalid") preview.invalidas.push({ row: r.row, reason: r.reason, name: r.name });
    else if (r.outcome.kind === "new") preview.novos.push(person(r.row, r.record));
    else if (r.outcome.kind === "update") preview.atualizacoes.push({ ...person(r.row, r.record), candidate: r.outcome.candidate });
    else preview.revisao.push({ ...person(r.row, r.record), candidates: r.outcome.candidates });
  }
  preview.totals.novos = preview.novos.length;
  preview.totals.atualizacoes = preview.atualizacoes.length;
  preview.totals.revisao = preview.revisao.length;
  preview.totals.invalidas = preview.invalidas.length;
  return ok(preview);
}

// ------------------------------------------------------------------ gravação

const SCALARS = ["sex", "birthDate", "cpf", "rg", "church", "city", "address", "mobile", "whatsapp", "email"] as const;
const TEXT_HEALTH = ["bloodType", "allergyReaction", "allergyMedication", "conditionDetails", "disability", "disabilityDetails", "physicalRestrictions", "otherHealthInfo", "specialNeedsDetails"] as const;
const LIST_HEALTH = ["allergies", "medications", "conditions", "dietaryRestrictions", "medicalNotes"] as const;
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
const guardianKey = (name: string, phone: string) => `${normalizeKey(name)}|${onlyDigits(phone)}`;

/** Completa um cadastro existente: só preenche o que está vazio e junta listas; nunca sobrescreve. */
async function updateExisting(tx: Tx, id: string, record: ImportRecord, fileName: string, actor: { id: string; name: string }) {
  const [current] = await tx.select().from(participants).where(eq(participants.id, id)).limit(1);
  if (!current) return;
  const p = record.participant;
  const fill: Partial<typeof participants.$inferInsert> = {};
  const labels: string[] = [];

  for (const f of SCALARS) {
    if (!current[f] && p[f]) {
      (fill as Record<string, unknown>)[f] = p[f];
      labels.push(f);
    }
  }
  if (!current.emergencyContact && record.emergencyContact) {
    fill.emergencyContact = record.emergencyContact;
    labels.push("emergencyContact");
  }
  if (!current.authorizationDeclared && p.authorizationDeclared) fill.authorizationDeclared = true;
  await tx.update(participants).set({ ...fill, version: current.version + 1, updatedAt: new Date() }).where(eq(participants.id, id));

  if (record.guardian) {
    const existing = await tx.select().from(participantGuardians).where(eq(participantGuardians.participantId, id));
    if (!existing.some((g) => guardianKey(g.name, g.phone) === guardianKey(record.guardian!.name, record.guardian!.phone))) {
      await tx.insert(participantGuardians).values({ ...record.guardian, participantId: id, position: existing.length });
      labels.push("responsável");
    }
  }

  if (record.health) {
    const [before] = await tx.select().from(participantHealth).where(eq(participantHealth.participantId, id)).limit(1);
    if (!before) {
      await tx.insert(participantHealth).values({ participantId: id, ...record.health });
    } else {
      const merged: Partial<typeof participantHealth.$inferInsert> = { specialNeeds: before.specialNeeds || record.health.specialNeeds, updatedAt: new Date() };
      for (const f of TEXT_HEALTH) if (!before[f] && record.health[f]) (merged as Record<string, unknown>)[f] = record.health[f];
      for (const f of LIST_HEALTH) (merged as Record<string, unknown>)[f] = union(before[f], record.health[f]);
      await tx.update(participantHealth).set(merged).where(eq(participantHealth.participantId, id));
    }
    labels.push("saúde");
  }

  if (record.note) {
    const notes = await tx.select({ body: participantNotes.body }).from(participantNotes).where(eq(participantNotes.participantId, id));
    if (!notes.some((n) => normalizeKey(n.body) === normalizeKey(record.note!))) {
      await tx.insert(participantNotes).values({ participantId: id, body: record.note, authorUserId: actor.id, authorLabel: `Importação (${fileName})` });
      labels.push("observação");
    }
  }

  // O histórico é visível a quem só tem `participantes.ver`: registra o que foi completado, sem valores de saúde.
  await recordHistory(tx, {
    entityType: "participant",
    entityId: id,
    actor,
    changes: [{ field: "Importação", old: null, new: `Cadastro completado via ${fileName}${labels.length ? ` (${labels.length} item(ns))` : ""}` }],
  });
}

export async function commitImport(eventId: string, input: unknown): Promise<ActionResult<ImportCommitResult>> {
  const auth = await authorizeAction("participantes.importar");
  if (!auth.ok) return auth.result;
  if (!idSchema.safeParse(eventId).success) return fail("Dados inválidos.");
  const parsed = commitSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  const payload = parsed.data as CommitPayload;
  const actor = { id: auth.user.id, name: auth.user.name };
  const canImportHealth = can(auth.user, "participantes.saude.editar");

  const mapping = sanitizeMapping(payload.headers, payload.mapping);
  if (!Object.values(mapping).includes("nome")) return fail("Associe uma coluna ao campo Nome.");

  const outcome = await getDb().transaction(async (tx) => {
    const event = await getCampEvent(tx, eventId);
    if (!event) return { error: "Acampamento não encontrado." } as const;
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`participants:${eventId}`}))`);

    // Reclassifica no servidor (nunca confia no resultado da prévia).
    const { rows } = await analyze(tx, eventId, payload, mapping, canImportHealth);
    const validIds = new Set((await tx.select({ id: participants.id }).from(participants).where(eq(participants.eventId, eventId))).map((r) => r.id));

    const toCreate: ImportRecord[] = [];
    const toUpdate: { id: string; record: ImportRecord }[] = [];
    let skipped = 0;
    let invalid = 0;
    let reviewCount = 0;

    for (const r of rows) {
      if (r.kind === "invalid") {
        invalid++;
        continue;
      }
      const decision = payload.decisions[String(r.row)];
      if (r.outcome.kind === "review") reviewCount++;

      if (decision === "skip") skipped++;
      else if (decision === "new") toCreate.push(r.record);
      else if (decision && typeof decision === "object") {
        if (validIds.has(decision.update)) toUpdate.push({ id: decision.update, record: r.record });
        else skipped++;
      } else if (r.outcome.kind === "new") toCreate.push(r.record);
      else if (r.outcome.kind === "update") toUpdate.push({ id: r.outcome.candidate.id, record: r.record });
      else skipped++; // revisão sem decisão: não grava nada
    }

    const [batch] = await tx
      .insert(importBatches)
      .values({ eventId, fileName: payload.fileName, totalRows: payload.rows.length, mapping, actorUserId: actor.id })
      .returning({ id: importBatches.id });

    // Novos cadastros em lote.
    if (toCreate.length) {
      const [{ max }] = await tx.select({ max: sql<number>`coalesce(max(${participants.number}), 0)::int` }).from(participants).where(eq(participants.eventId, eventId));
      const numbered = toCreate.map((record, i) => ({ record, number: max + i + 1 }));
      for (let start = 0; start < numbered.length; start += 400) {
        const chunk = numbered.slice(start, start + 400);
        const inserted = await tx
          .insert(participants)
          .values(
            chunk.map(({ record, number }) => ({
              ...record.participant,
              eventId,
              number,
              nameKey: normalizeKey(record.participant.name),
              emergencyContact: record.emergencyContact,
              source: "import" as const,
              importBatchId: batch.id,
            })),
          )
          .returning({ id: participants.id, number: participants.number });
        const idByNumber = new Map(inserted.map((r) => [r.number, r.id]));

        const guardians = chunk.flatMap(({ record, number }) => (record.guardian ? [{ ...record.guardian, participantId: idByNumber.get(number)!, position: 0 }] : []));
        const healths = chunk.flatMap(({ record, number }) => (record.health ? [{ ...record.health, participantId: idByNumber.get(number)! }] : []));
        const notes = chunk.flatMap(({ record, number }) =>
          record.note ? [{ participantId: idByNumber.get(number)!, body: record.note, authorUserId: actor.id, authorLabel: `Importação (${payload.fileName})` }] : [],
        );
        if (guardians.length) await tx.insert(participantGuardians).values(guardians);
        if (healths.length) await tx.insert(participantHealth).values(healths);
        if (notes.length) await tx.insert(participantNotes).values(notes);
      }
    }

    for (const u of toUpdate) await updateExisting(tx, u.id, u.record, payload.fileName, actor);

    await tx
      .update(importBatches)
      .set({ createdCount: toCreate.length, updatedCount: toUpdate.length, reviewCount })
      .where(eq(importBatches.id, batch.id));
    await tx
      .insert(importMappings)
      .values({ signature: headerSignature(payload.headers), mapping })
      .onConflictDoUpdate({ target: importMappings.signature, set: { mapping, updatedAt: new Date() } });

    return { created: toCreate.length, updated: toUpdate.length, skipped, invalid, batchId: batch.id, title: event.title } as const;
  });

  if (outcome.error !== undefined) return fail(outcome.error);

  await logAudit({
    actor: auth.user,
    action: "participant.import",
    entityType: "event",
    entityId: eventId,
    summary: `Importação de ${payload.fileName} em ${outcome.title}: ${outcome.created} novos, ${outcome.updated} atualizados, ${outcome.skipped} pulados, ${outcome.invalid} inválidos`,
    metadata: { batchId: outcome.batchId, created: outcome.created, updated: outcome.updated, skipped: outcome.skipped, invalid: outcome.invalid },
  });
  revalidatePath("/painel/participantes");
  revalidatePath("/painel");

  const { created, updated, skipped, invalid, batchId } = outcome;
  return ok({ created, updated, skipped, invalid, batchId }, `${created} criado(s) e ${updated} atualizado(s).`);
}
