import { and, asc, count, desc, eq, gte, isNotNull, isNull, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { events, participants, registrations } from "@/lib/db/schema";

type EventRow = typeof events.$inferSelect;

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationMapUrl: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  category: string | null;
  featured: boolean;
  externalUrl: string | null;
  externalLabel: string | null;
  formModel: EventRow["formModel"];
  formConfig: Record<string, unknown>;
  registrationOpen: boolean;
  registrationClosesAt: string | null;
};

export const imageUrl = (id: string | null) => (id ? `/imagens/eventos/${id}` : null);

function toPublic(e: EventRow): PublicEvent {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    summary: e.summary,
    description: e.description,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt?.toISOString() ?? null,
    locationName: e.locationName,
    locationAddress: e.locationAddress,
    locationMapUrl: e.locationMapUrl,
    imageUrl: imageUrl(e.imageId),
    imageAlt: e.imageAlt,
    category: e.category,
    featured: e.featured,
    externalUrl: e.externalUrl,
    externalLabel: e.externalLabel,
    formModel: e.formModel,
    formConfig: e.formConfig,
    registrationOpen: e.registrationOpen,
    registrationClosesAt: e.registrationClosesAt?.toISOString() ?? null,
  };
}

/** Eventos ainda não encerrados: sem fim e começando de agora em diante, ou com fim no futuro. */
const upcoming = (now: Date) =>
  or(
    and(isNull(events.endsAt), gte(events.startsAt, now)),
    and(isNotNull(events.endsAt), gte(events.endsAt, now)),
  );

export const getUpcomingEvents = unstable_cache(
  async (): Promise<PublicEvent[]> => {
    const rows = await getDb()
      .select()
      .from(events)
      .where(and(eq(events.publication, "published"), upcoming(new Date())))
      .orderBy(asc(events.startsAt));
    return rows.map(toPublic);
  },
  ["events:upcoming"],
  { tags: [TAGS.eventos], revalidate: 3600 },
);

export const getFeaturedEvent = unstable_cache(
  async (): Promise<PublicEvent | null> => {
    const [row] = await getDb()
      .select()
      .from(events)
      .where(and(eq(events.publication, "published"), eq(events.featured, true), upcoming(new Date())))
      .orderBy(asc(events.startsAt))
      .limit(1);
    return row ? toPublic(row) : null;
  },
  ["events:featured"],
  { tags: [TAGS.eventos], revalidate: 3600 },
);

export const getPublicEventBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<PublicEvent | null> => {
      const [row] = await getDb()
        .select()
        .from(events)
        .where(and(eq(events.slug, slug), eq(events.publication, "published")))
        .limit(1);
      return row ? toPublic(row) : null;
    },
    ["events:slug", slug],
    { tags: [TAGS.eventos], revalidate: 3600 },
  )();

export async function listEventsAdmin(filter: { publication?: EventRow["publication"] } = {}) {
  const db = getDb();
  const regCount = db
    .select({ eventId: registrations.eventId, total: count().as("reg_total") })
    .from(registrations)
    .groupBy(registrations.eventId)
    .as("reg_counts");

  return db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      startsAt: events.startsAt,
      publication: events.publication,
      featured: events.featured,
      registrationOpen: events.registrationOpen,
      formModel: events.formModel,
      registrations: sql<number>`coalesce(${regCount.total}, 0)`.mapWith(Number),
    })
    .from(events)
    .leftJoin(regCount, eq(regCount.eventId, events.id))
    .where(filter.publication ? eq(events.publication, filter.publication) : undefined)
    .orderBy(desc(events.startsAt));
}

export async function getEventAdmin(id: string) {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return null;
  const [[reg], [part]] = await Promise.all([
    db.select({ total: count() }).from(registrations).where(eq(registrations.eventId, id)),
    db.select({ total: count() }).from(participants).where(eq(participants.eventId, id)),
  ]);
  return {
    event,
    imageUrl: imageUrl(event.imageId),
    registrationCount: reg.total,
    participantCount: part.total,
  };
}

export async function getEventOptions() {
  return getDb()
    .select({ id: events.id, title: events.title, startsAt: events.startsAt })
    .from(events)
    .orderBy(desc(events.startsAt));
}
