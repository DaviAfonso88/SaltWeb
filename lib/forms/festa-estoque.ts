import { ITEM_PREFIX, SLOT_KEY, festaModel, type FestaCategoria, type FestaConfig } from "./festa";
import type { Answers } from "./types";

type StockRow = { status: "pending" | "confirmed" | "cancelled"; answers: Answers };

export type StockChoice<R> = { pessoa: R; quantidade: number };

export type StockLine<R> = {
  quantidade: number;
  /** Unidades escolhidas por inscrições não canceladas. */
  usado: number;
  escolhas: StockChoice<R>[];
  restante: number;
  /** Acima do configurado (quantidade reduzida depois ou inscrição cancelada que foi reativada). */
  excedente: number;
};

export type FestaStock<R> = {
  itens: (StockLine<R> & { nome: string; categoria: FestaCategoria })[];
  valor: StockLine<R>;
  /** Escolhas de itens que foram renomeados ou removidos do formulário. */
  foraDaLista: { nome: string; escolhas: StockChoice<R>[] }[];
};

/**
 * Estoque do evento a partir das inscrições, com a mesma regra de consumo usada pelo
 * formulário público (`getFestaAvailability`): inscrições canceladas devolvem o item.
 */
export function festaStock<R extends StockRow>(config: FestaConfig, rows: R[]): FestaStock<R> {
  // chave → inscrição → unidades (a ordem de inserção mantém a ordem das inscrições).
  const chosen = new Map<string, Map<R, number>>();
  for (const row of rows) {
    if (row.status === "cancelled") continue;
    for (const key of festaModel.consumes(config, row.answers)) {
      const byRow = chosen.get(key) ?? new Map<R, number>();
      byRow.set(row, (byRow.get(row) ?? 0) + 1);
      chosen.set(key, byRow);
    }
  }

  const choicesOf = (key: string): StockChoice<R>[] =>
    [...(chosen.get(key) ?? [])].map(([pessoa, quantidade]) => ({ pessoa, quantidade }));

  const line = (key: string, quantidade: number): StockLine<R> => {
    const escolhas = choicesOf(key);
    const usado = escolhas.reduce((sum, c) => sum + c.quantidade, 0);
    return { quantidade, usado, escolhas, restante: Math.max(0, quantidade - usado), excedente: Math.max(0, usado - quantidade) };
  };

  const itens = config.itens.map((i) => ({ nome: i.nome, categoria: i.categoria, ...line(`${ITEM_PREFIX}${i.nome}`, i.quantidade) }));
  const listed = new Set(config.itens.map((i) => `${ITEM_PREFIX}${i.nome}`));
  const foraDaLista = [...chosen.keys()]
    .filter((key) => key.startsWith(ITEM_PREFIX) && !listed.has(key))
    .map((key) => ({ nome: key.slice(ITEM_PREFIX.length), escolhas: choicesOf(key) }));

  return { itens, valor: line(SLOT_KEY, config.vagasContribuicao), foraDaLista };
}
