import { and, asc, count, desc, eq, gte, inArray, isNotNull, lt, ne, or, sum } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { devotionals, eventExpenses, events, messages, registrations, visitors } from "@/lib/db/schema";
import { todayInSaoPaulo } from "@/lib/format";
import { festaConfigSchema, peopleCount } from "@/lib/forms/festa";
import { festaStock } from "@/lib/forms/festa-estoque";
import { summarizePayments } from "@/lib/registrations/payment";

import { countByWeek, startOfDay, weeksStart } from "./time";

/**
 * Leituras do Dashboard. Nenhuma confere permissão: a página só chama o que o papel pode ver.
 * Nada daqui lê dados de saúde.
 */

export const CHART_WEEKS = 8;
const LIST_SIZE = 5;

/** O que carregar de cada evento, conforme as permissões de quem está vendo. */
export type EventScope = { drafts: boolean; registrations: boolean; stock: boolean; money: boolean; expenses: boolean };

export async function listUpcomingEventsOverview(scope: EventScope, limit = 4) {
  const db = getDb();
  const today = startOfDay(todayInSaoPaulo());
  const upcoming = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      locationName: events.locationName,
      publication: events.publication,
      formModel: events.formModel,
      formConfig: events.formConfig,
      registrationOpen: events.registrationOpen,
      registrationClosesAt: events.registrationClosesAt,
    })
    .from(events)
    .where(
      and(
        scope.drafts ? ne(events.publication, "archived") : eq(events.publication, "published"),
        or(gte(events.startsAt, today), and(isNotNull(events.endsAt), gte(events.endsAt, today))),
      ),
    )
    .orderBy(asc(events.startsAt));

  const shown = upcoming.slice(0, limit);
  const ids = shown.map((e) => e.id);
  const needsRows = scope.registrations || scope.stock || scope.money;
  const [rows, spent] = await Promise.all([
    needsRows && ids.length
      ? db
          .select({ eventId: registrations.eventId, status: registrations.status, answers: registrations.answers, payment: registrations.payment })
          .from(registrations)
          .where(inArray(registrations.eventId, ids))
      : [],
    scope.expenses && ids.length
      ? db
          .select({ eventId: eventExpenses.eventId, total: sum(eventExpenses.amountCents).mapWith(Number) })
          .from(eventExpenses)
          .where(inArray(eventExpenses.eventId, ids))
          .groupBy(eventExpenses.eventId)
      : [],
  ]);

  const now = new Date();
  const isOpen = (e: (typeof upcoming)[number]) =>
    e.publication === "published" && !!e.formModel && e.registrationOpen && (!e.registrationClosesAt || e.registrationClosesAt > now);

  return {
    published: upcoming.filter((e) => e.publication === "published").length,
    open: upcoming.filter(isOpen).length,
    total: upcoming.length,
    events: shown.map((event) => {
      const all = rows.filter((r) => r.eventId === event.id);
      const active = all.filter((r) => r.status !== "cancelled");
      const config = event.formModel === "festa" ? festaConfigSchema.safeParse(event.formConfig) : null;

      let stock: { used: number; total: number; missing: { nome: string; restante: number }[] } | null = null;
      if (scope.stock && config?.success && config.data.itens.length) {
        const items = festaStock(config.data, active).itens;
        stock = {
          used: items.reduce((n, i) => n + Math.min(i.usado, i.quantidade), 0),
          total: items.reduce((n, i) => n + i.quantidade, 0),
          missing: items.filter((i) => i.restante > 0).map((i) => ({ nome: i.nome, restante: i.restante })),
        };
      }

      const payments = scope.money ? summarizePayments(all) : null;
      const spentCents = scope.expenses ? (spent.find((s) => s.eventId === event.id)?.total ?? 0) : null;

      return {
        ...event,
        open: isOpen(event),
        attendance: scope.registrations
          ? {
              registrations: active.length,
              pending: active.filter((r) => r.status === "pending").length,
              people: active.reduce((n, r) => n + peopleCount(r.answers), 0),
              capacity: config?.success ? config.data.limiteParticipantes : 0,
            }
          : null,
        stock,
        money:
          payments && (payments.expectedCents || spentCents)
            ? { receivedCents: payments.receivedCents, pendingCents: payments.pendingCents, spentCents }
            : spentCents
              ? { receivedCents: null, pendingCents: null, spentCents }
              : null,
      };
    }),
  };
}

export type EventOverviewData = Awaited<ReturnType<typeof listUpcomingEventsOverview>>["events"][number];

export async function getRegistrationActivity() {
  const db = getDb();
  const since = startOfDay(weeksStart(CHART_WEEKS));
  const [pendingByEvent, recent, dates] = await Promise.all([
    db
      .select({ eventId: registrations.eventId, total: count() })
      .from(registrations)
      .where(eq(registrations.status, "pending"))
      .groupBy(registrations.eventId)
      .orderBy(desc(count())),
    db
      .select({ id: registrations.id, name: registrations.name, createdAt: registrations.createdAt, eventTitle: events.title })
      .from(registrations)
      .innerJoin(events, eq(events.id, registrations.eventId))
      .where(ne(registrations.status, "cancelled"))
      .orderBy(desc(registrations.createdAt))
      .limit(LIST_SIZE),
    db
      .select({ createdAt: registrations.createdAt })
      .from(registrations)
      .where(and(ne(registrations.status, "cancelled"), gte(registrations.createdAt, since))),
  ]);
  const all = dates.map((d) => d.createdAt);
  return {
    pending: pendingByEvent.reduce((n, e) => n + e.total, 0),
    /** Evento com mais pendências: o atalho do cartão leva direto a ele. */
    busiestEventId: pendingByEvent[0]?.eventId ?? null,
    lastSevenDays: all.filter((d) => d.getTime() >= Date.now() - 7 * 86_400_000).length,
    recent,
    weeks: countByWeek(all, CHART_WEEKS),
  };
}

export async function getVisitorActivity() {
  const db = getDb();
  const since = startOfDay(weeksStart(CHART_WEEKS));
  const waiting = eq(visitors.status, "new");
  const [[{ total }], [{ late }], oldest, dates] = await Promise.all([
    db.select({ total: count() }).from(visitors).where(waiting),
    db
      .select({ late: count() })
      .from(visitors)
      .where(and(waiting, lt(visitors.createdAt, new Date(Date.now() - 7 * 86_400_000)))),
    // Quem espera há mais tempo vem primeiro.
    db
      .select({ id: visitors.id, name: visitors.name, ageGroup: visitors.ageGroup, createdAt: visitors.createdAt })
      .from(visitors)
      .where(waiting)
      .orderBy(asc(visitors.createdAt))
      .limit(LIST_SIZE),
    db.select({ createdAt: visitors.createdAt }).from(visitors).where(gte(visitors.createdAt, since)),
  ]);
  return { waiting: total, late, oldest, weeks: countByWeek(dates.map((d) => d.createdAt), CHART_WEEKS) };
}

export async function getMessageActivity() {
  const db = getDb();
  const unread = eq(messages.status, "new");
  const [[{ total }], latest] = await Promise.all([
    db.select({ total: count() }).from(messages).where(unread),
    db
      .select({ id: messages.id, name: messages.name, kind: messages.kind, createdAt: messages.createdAt })
      .from(messages)
      .where(unread)
      .orderBy(desc(messages.createdAt))
      .limit(LIST_SIZE),
  ]);
  return { unread: total, latest };
}

export async function getDevotionalStatus() {
  const db = getDb();
  const month = `${todayInSaoPaulo().slice(0, 7)}-01`;
  const [latest, current] = await Promise.all([
    db
      .select({ title: devotionals.title, referenceMonth: devotionals.referenceMonth })
      .from(devotionals)
      .where(eq(devotionals.published, true))
      .orderBy(desc(devotionals.referenceMonth), desc(devotionals.publishedAt))
      .limit(1),
    db
      .select({ id: devotionals.id })
      .from(devotionals)
      .where(and(eq(devotionals.published, true), eq(devotionals.referenceMonth, month)))
      .limit(1),
  ]);
  return { month, hasCurrentMonth: current.length > 0, latest: latest[0] ?? null };
}
