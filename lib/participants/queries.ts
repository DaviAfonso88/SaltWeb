import { and, asc, count, desc, eq, ilike, ne, or, sql, type SQL } from "drizzle-orm";

import { PAGE_SIZE } from "@/components/painel/Pagination";
import { getDb } from "@/lib/db";
import { entityHistory, events, participantGuardians, participantNotes, participants } from "@/lib/db/schema";
import { normalizeKey, onlyDigits } from "@/lib/text";

// Este módulo NUNCA lê `participant_health`: dados de saúde só passam por lib/participants/health.ts.

const ageYears = sql<number | null>`case when ${participants.birthDate} is null then null else date_part('year', age(${participants.birthDate}))::int end`;

/** Menor de 18 anos sem nenhum responsável cadastrado. */
const pendingGuardian = sql<boolean>`(${participants.birthDate} is not null
  and date_part('year', age(${participants.birthDate})) < 18
  and not exists (select 1 from ${participantGuardians} where ${participantGuardians.participantId} = ${participants.id}))`;

const like = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export async function listCampEvents() {
  const rows = await getDb()
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      total: count(participants.id),
    })
    .from(events)
    .leftJoin(participants, eq(participants.eventId, events.id))
    .where(eq(events.formModel, "acampamento"))
    .groupBy(events.id)
    .orderBy(desc(events.startsAt));
  return rows;
}

export type CampEventOption = Awaited<ReturnType<typeof listCampEvents>>[number];

export type ParticipantFilters = {
  eventId: string;
  q?: string;
  church?: string;
  city?: string;
  sex?: "M" | "F";
  pendingGuardian?: boolean;
  page: number;
};

function filtersToWhere(f: Omit<ParticipantFilters, "page">): SQL {
  const conds: SQL[] = [eq(participants.eventId, f.eventId)];
  const term = f.q?.trim();
  if (term) {
    const digits = onlyDigits(term);
    const byText = [ilike(participants.nameKey, like(normalizeKey(term)))];
    if (digits.length >= 3) {
      byText.push(ilike(participants.cpf, like(digits)), ilike(participants.mobile, like(digits)), ilike(participants.whatsapp, like(digits)));
    }
    conds.push(or(...byText) as SQL);
  }
  if (f.church) conds.push(eq(participants.church, f.church));
  if (f.city) conds.push(eq(participants.city, f.city));
  if (f.sex) conds.push(eq(participants.sex, f.sex));
  if (f.pendingGuardian) conds.push(pendingGuardian);
  return and(...conds) as SQL;
}

export async function listParticipants(filters: ParticipantFilters) {
  const db = getDb();
  const where = filtersToWhere(filters);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: participants.id,
        number: participants.number,
        name: participants.name,
        sex: participants.sex,
        age: ageYears,
        church: participants.church,
        city: participants.city,
        mobile: participants.mobile,
        pendingGuardian,
      })
      .from(participants)
      .where(where)
      .orderBy(asc(participants.nameKey), asc(participants.number))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(participants).where(where),
  ]);
  return { rows, total };
}

/** Todos os participantes do filtro, sem paginação (exportação). Não inclui saúde. */
export async function listParticipantsForExport(filters: Omit<ParticipantFilters, "page">) {
  return getDb()
    .select({
      id: participants.id,
      number: participants.number,
      name: participants.name,
      sex: participants.sex,
      birthDate: participants.birthDate,
      age: ageYears,
      cpf: participants.cpf,
      church: participants.church,
      city: participants.city,
      mobile: participants.mobile,
      whatsapp: participants.whatsapp,
      email: participants.email,
      emergencyContact: participants.emergencyContact,
    })
    .from(participants)
    .where(filtersToWhere(filters))
    .orderBy(asc(participants.nameKey), asc(participants.number));
}

/** Valores distintos de igreja e cidade do acampamento, para os filtros. */
export async function getFilterOptions(eventId: string) {
  const db = getDb();
  const [churches, cities] = await Promise.all([
    db
      .selectDistinct({ value: participants.church })
      .from(participants)
      .where(and(eq(participants.eventId, eventId), sql`${participants.church} is not null`))
      .orderBy(asc(participants.church)),
    db
      .selectDistinct({ value: participants.city })
      .from(participants)
      .where(and(eq(participants.eventId, eventId), sql`${participants.city} is not null`))
      .orderBy(asc(participants.city)),
  ]);
  return {
    churches: churches.map((r) => r.value).filter((v): v is string => Boolean(v)),
    cities: cities.map((r) => r.value).filter((v): v is string => Boolean(v)),
  };
}

export async function getParticipant(id: string) {
  const db = getDb();
  const [row] = await db
    .select({ participant: participants, event: { id: events.id, title: events.title }, age: ageYears })
    .from(participants)
    .innerJoin(events, eq(events.id, participants.eventId))
    .where(eq(participants.id, id))
    .limit(1);
  if (!row) return null;

  const [guardians, notes, history] = await Promise.all([
    db.select().from(participantGuardians).where(eq(participantGuardians.participantId, id)).orderBy(asc(participantGuardians.position)),
    db.select().from(participantNotes).where(eq(participantNotes.participantId, id)).orderBy(desc(participantNotes.createdAt)),
    db
      .select()
      .from(entityHistory)
      .where(and(eq(entityHistory.entityType, "participant"), eq(entityHistory.entityId, id)))
      .orderBy(desc(entityHistory.createdAt))
      .limit(100),
  ]);

  const isMinor = row.age !== null && row.age < 18;
  return {
    ...row.participant,
    event: row.event,
    age: row.age,
    guardians,
    notes,
    history,
    pendingGuardian: isMinor && guardians.length === 0,
  };
}

export type ParticipantDetail = NonNullable<Awaited<ReturnType<typeof getParticipant>>>;

/** Outros participantes do mesmo acampamento, para escolher com quem mesclar. */
export async function searchParticipantsForMerge(eventId: string, excludeId: string, q: string) {
  const term = q.trim();
  if (term.length < 2) return [];
  return getDb()
    .select({ id: participants.id, number: participants.number, name: participants.name, church: participants.church, city: participants.city, birthDate: participants.birthDate })
    .from(participants)
    .where(and(eq(participants.eventId, eventId), ne(participants.id, excludeId), ilike(participants.nameKey, like(normalizeKey(term)))))
    .orderBy(asc(participants.nameKey))
    .limit(10);
}

const topN = <T extends { total: number }>(rows: T[], n = 8): T[] => rows.slice(0, n);

export async function getCampStats(eventId: string) {
  const db = getDb();
  const ofEvent = eq(participants.eventId, eventId);

  const [[totals], bySex, byAge, byChurch, byCity] = await Promise.all([
    db.select({ total: count(), pending: sql<number>`count(*) filter (where ${pendingGuardian})::int` }).from(participants).where(ofEvent),
    db.select({ sex: participants.sex, total: count() }).from(participants).where(ofEvent).groupBy(participants.sex),
    db
      .select({
        band: sql<string>`case
          when ${participants.birthDate} is null then 'sem'
          when date_part('year', age(${participants.birthDate})) < 12 then '0-11'
          when date_part('year', age(${participants.birthDate})) < 15 then '12-14'
          when date_part('year', age(${participants.birthDate})) < 18 then '15-17'
          when date_part('year', age(${participants.birthDate})) < 26 then '18-25'
          else '26+' end`,
        total: count(),
      })
      .from(participants)
      .where(ofEvent)
      .groupBy(sql`1`),
    db
      .select({ name: participants.church, total: count() })
      .from(participants)
      .where(and(ofEvent, sql`${participants.church} is not null`))
      .groupBy(participants.church)
      .orderBy(desc(count())),
    db
      .select({ name: participants.city, total: count() })
      .from(participants)
      .where(and(ofEvent, sql`${participants.city} is not null`))
      .groupBy(participants.city)
      .orderBy(desc(count())),
  ]);

  const BAND_ORDER = ["0-11", "12-14", "15-17", "18-25", "26+", "sem"];
  const sexTotal = (s: "M" | "F" | null) => bySex.find((r) => r.sex === s)?.total ?? 0;

  return {
    total: totals?.total ?? 0,
    pendingGuardian: totals?.pending ?? 0,
    male: sexTotal("M"),
    female: sexTotal("F"),
    noSex: sexTotal(null),
    ageBands: BAND_ORDER.map((band) => ({ band, total: byAge.find((r) => r.band === band)?.total ?? 0 })).filter((b) => b.total > 0),
    churches: topN(byChurch.map((r) => ({ name: r.name as string, total: r.total }))),
    cities: topN(byCity.map((r) => ({ name: r.name as string, total: r.total }))),
  };
}

export type CampStats = Awaited<ReturnType<typeof getCampStats>>;
