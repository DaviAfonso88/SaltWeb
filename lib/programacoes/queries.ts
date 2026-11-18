import { unstable_cache } from "next/cache";
import { connection } from "next/server";

import { TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { programacoes } from "@/lib/db/schema";
import { describeError } from "@/lib/safe-error";

import { PROGRAMACOES, type ProgramacaoInfo } from "./catalog";
import type { Schedule } from "./schedule";

export type Programacao = ProgramacaoInfo & { schedule: Schedule; version: number };

type Row = typeof programacoes.$inferSelect;

const toSchedule = (row: Row): Schedule => ({
  kind: row.kind,
  weekday: row.weekday,
  nth: row.nth,
  time: row.time,
  customDay: row.customDay ?? "",
  customTime: row.customTime ?? "",
});

function merge(rows: Row[]): Programacao[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return PROGRAMACOES.map((info) => {
    const row = bySlug.get(info.slug);
    return { ...info, schedule: row ? toSchedule(row) : info.padrao, version: row?.version ?? 0 };
  });
}

const cached = unstable_cache(async () => merge(await getDb().select().from(programacoes)), ["programacoes:all"], {
  tags: [TAGS.programacoes],
  revalidate: 3600,
});

/** Para o site público: nunca quebra a página — se o banco falhar, usa os horários padrão. */
export async function getProgramacoes(): Promise<Programacao[]> {
  // Renderização dinâmica: o horário não pode ficar congelado no build (o dado em si é cacheado acima).
  await connection();
  try {
    return await cached();
  } catch (error) {
    console.error("[programacoes] falha ao ler o banco; usando padrões", describeError(error));
    return merge([]);
  }
}

/** Para o painel: sempre direto do banco (com `version` para detectar edição concorrente). */
export async function getProgramacoesAdmin(): Promise<Programacao[]> {
  return merge(await getDb().select().from(programacoes));
}

/** Seleciona e ordena programações pelos slugs informados. */
export function pickProgramacoes(list: Programacao[], slugs: string[]): Programacao[] {
  return slugs.flatMap((slug) => list.find((p) => p.slug === slug) ?? []);
}
