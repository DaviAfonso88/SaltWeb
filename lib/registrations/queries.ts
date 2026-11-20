import { and, count, desc, eq, ilike, isNotNull, or, type SQL } from "drizzle-orm";

import { PAGE_SIZE } from "@/components/painel/Pagination";
import { getDb } from "@/lib/db";
import { entityHistory, events, registrations } from "@/lib/db/schema";
import { normalizeKey, onlyDigits } from "@/lib/text";

import { summarizePayments } from "./payment";

export type RegistrationStatus = (typeof registrations.$inferSelect)["status"];
export const REGISTRATION_STATUSES: RegistrationStatus[] = ["pending", "confirmed", "cancelled"];

export type RegistrationFilters = {
  eventId: string;
  status?: RegistrationStatus;
  q?: string;
};

/** Escapa `%` e `_` para usar o texto digitado como trecho literal em ILIKE. */
const like = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export function registrationWhere({ eventId, status, q }: RegistrationFilters): SQL {
  const filters: SQL[] = [eq(registrations.eventId, eventId)];
  if (status) filters.push(eq(registrations.status, status));

  const term = q?.trim();
  if (term) {
    const digits = onlyDigits(term);
    const byName = ilike(registrations.nameKey, like(normalizeKey(term)));
    // Só trata como telefone quando o termo é majoritariamente numérico.
    const isPhoneSearch = digits.length >= 3 && digits.length >= term.replace(/[\s()+-]/g, "").length;
    filters.push(isPhoneSearch ? (or(byName, ilike(registrations.phoneKey, like(digits))) as SQL) : byName);
  }
  return and(...filters) as SQL;
}

export async function listRegistrations(filters: RegistrationFilters & { page: number }) {
  const db = getDb();
  const where = registrationWhere(filters);

  const [rows, [{ total }], statusCounts] = await Promise.all([
    db
      .select()
      .from(registrations)
      .where(where)
      .orderBy(desc(registrations.number))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(registrations).where(where),
    // Contadores do evento inteiro (independem de status e busca).
    db
      .select({ status: registrations.status, total: count() })
      .from(registrations)
      .where(eq(registrations.eventId, filters.eventId))
      .groupBy(registrations.status),
  ]);

  const counts: Record<RegistrationStatus, number> = { pending: 0, confirmed: 0, cancelled: 0 };
  for (const row of statusCounts) counts[row.status] = row.total;

  return { rows, total, counts };
}

/** Arrecadado e a receber do evento inteiro (independe de situação e busca). */
export async function getEventPaymentSummary(eventId: string) {
  const rows = await getDb()
    .select({ status: registrations.status, payment: registrations.payment })
    .from(registrations)
    .where(and(eq(registrations.eventId, eventId), isNotNull(registrations.payment)));
  return summarizePayments(rows);
}

/** Eventos que têm modelo de formulário ou já receberam inscrições, mais recentes primeiro. */
export async function listEventsWithRegistrations() {
  return getDb()
    .select({ id: events.id, title: events.title, slug: events.slug, startsAt: events.startsAt, formModel: events.formModel })
    .from(events)
    .orderBy(desc(events.startsAt));
}

export async function getRegistration(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      registration: registrations,
      eventTitle: events.title,
      eventSlug: events.slug,
      formModel: events.formModel,
      formConfig: events.formConfig,
    })
    .from(registrations)
    .innerJoin(events, eq(events.id, registrations.eventId))
    .where(eq(registrations.id, id))
    .limit(1);
  if (!row) return null;

  const history = await db
    .select()
    .from(entityHistory)
    .where(and(eq(entityHistory.entityType, "registration"), eq(entityHistory.entityId, id)))
    .orderBy(desc(entityHistory.createdAt));

  return { ...row, history };
}
