import { unstable_cache } from "next/cache";
import { connection } from "next/server";

import { TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { programacoes } from "@/lib/db/schema";
import { describeError } from "@/lib/safe-error";

import { PROGRAMACOES, type ProgramacaoInfo } from "./catalog";
import type { Schedule } from "./schedule";

export type Programacao = ProgramacaoInfo & { schedule: Schedule; version: number };

const COLUMNS = {
  slug: programacoes.slug,
  kind: programacoes.kind,
  weekday: programacoes.weekday,
  nth: programacoes.nth,
  time: programacoes.time,
  customDay: programacoes.customDay,
  customTime: programacoes.customTime,
  version: programacoes.version,
};

type Row = { [K in keyof typeof COLUMNS]: (typeof programacoes.$inferSelect)[K] };

const toSchedule = (row: Row): Schedule => ({
  kind: row.kind,
  weekday: row.weekday,
  nth: row.nth,
  time: row.time,
  customDay: row.customDay ?? "",
  customTime: row.customTime ?? "",
});

/**
 * Junta o catálogo (código) com o que foi salvo no painel; sem linha no banco, vale o padrão.
 * Programações sem agenda (células por bairro) ignoram o que estiver salvo de antes.
 */
function merge(rows: Row[]): Programacao[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return PROGRAMACOES.map((info) => {
    const row = info.semAgenda ? undefined : bySlug.get(info.slug);
    return { ...info, schedule: row ? toSchedule(row) : info.padrao, version: row?.version ?? 0 };
  });
}

const selectRows = async (): Promise<Row[]> => await getDb().select(COLUMNS).from(programacoes);

// Só as linhas do banco ficam em cache: o catálogo vem do código, então uma programação nova
// (ou um texto alterado) aparece no deploy seguinte sem esperar o cache expirar.
const cachedRows = unstable_cache(selectRows, ["programacoes:rows"], {
  tags: [TAGS.programacoes],
  revalidate: 3600,
});

/** Para o site público: nunca quebra a página — se o banco falhar, usa os horários padrão. */
export async function getProgramacoes(): Promise<Programacao[]> {
  // Renderização dinâmica: o horário não pode ficar congelado no build (o dado em si é cacheado acima).
  await connection();
  try {
    return merge(await cachedRows());
  } catch (error) {
    console.error("[programacoes] falha ao ler o banco; usando padrões", describeError(error));
    return merge([]);
  }
}

/** Para o painel: sempre direto do banco (com `version` para detectar edição concorrente). */
export async function getProgramacoesAdmin(): Promise<Programacao[]> {
  return merge(await selectRows());
}
