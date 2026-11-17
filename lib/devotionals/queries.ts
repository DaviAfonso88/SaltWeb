import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { PAGE_SIZE } from "@/components/painel/Pagination";
import { TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { devotionals } from "@/lib/db/schema";

export type PublishedDevotional = { id: string; title: string; url: string; month: string };

/** Publicados, do mais recente para o mais antigo (publicação, depois mês de referência). */
export const getPublishedDevotionals = unstable_cache(
  async (): Promise<PublishedDevotional[]> => {
    const rows = await getDb()
      .select()
      .from(devotionals)
      .where(eq(devotionals.published, true))
      .orderBy(desc(devotionals.publishedAt), desc(devotionals.referenceMonth));
    return rows.map((r) => ({ id: r.id, title: r.title, url: r.url, month: r.referenceMonth }));
  },
  ["devotionals:published"],
  { tags: [TAGS.devocionais], revalidate: 3600 },
);

const like = (text: string) => `%${text.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export async function listDevotionalsAdmin(params: { q?: string; published?: boolean; page: number }) {
  const db = getDb();
  const filters: SQL[] = [];
  const term = params.q?.trim();
  if (term) filters.push(or(ilike(devotionals.title, like(term)), ilike(devotionals.url, like(term))) as SQL);
  if (params.published !== undefined) filters.push(eq(devotionals.published, params.published));
  const where = filters.length ? and(...filters) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(devotionals)
      .where(where)
      .orderBy(desc(devotionals.referenceMonth), desc(devotionals.createdAt))
      .limit(PAGE_SIZE)
      .offset((params.page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(devotionals).where(where),
  ]);
  return { rows, total };
}
