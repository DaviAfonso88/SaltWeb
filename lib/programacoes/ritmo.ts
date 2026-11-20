import type { Programacao } from "./queries";
import {
  addDaysIso,
  describeDayLong,
  describeDayTag,
  describeNextDate,
  describeSchedule,
  describeTime,
  nextOccurrence,
  NTH_FIFTH,
  todayInBrasilia,
} from "./schedule";

/** Módulo puro: separa os grupos de programação e monta o ritmo das sextas mostrado no site. */

export type Encontro = Extract<Programacao, { grupo: "encontros" }>;
export type Sexta = Extract<Programacao, { grupo: "sextas" }>;

export const isEncontro = (p: Programacao): p is Encontro => p.grupo === "encontros";
export const isSexta = (p: Programacao): p is Sexta => p.grupo === "sextas";

export type SextaDoMes = {
  slug: string;
  titulo: string;
  /** "1ª sexta" */
  tag: string;
  /** "19h45" */
  time: string;
  /** "Toda 1ª sexta-feira do mês · 19h45" */
  long: string;
  /** Só acontece nos meses que têm a semana (5ª sexta). */
  ocasional: boolean;
  /** Próxima data, "YYYY-MM-DD" (Brasília). */
  date: string | null;
};

export type RitmoDasSextas = {
  items: SextaDoMes[];
  /** "Todas as sextas-feiras" quando todas caem no mesmo dia da semana; senão "Uma vez por mês, cada uma". */
  dia: string;
  /** A próxima a acontecer, com "Hoje", "Amanhã", "Nesta sexta, 20/11"… */
  next: (SextaDoMes & { quando: string }) | null;
};

export function ritmoDasSextas(list: Programacao[], now: Date = new Date()): RitmoDasSextas {
  const today = todayInBrasilia(now);
  const sextas = list.filter(isSexta);

  const items = sextas.map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    tag: describeDayTag(p.schedule),
    time: describeTime(p.schedule),
    long: describeSchedule(p.schedule).long,
    ocasional: p.schedule.kind === "mensal" && p.schedule.nth === NTH_FIFTH,
    date: nextOccurrence(p.schedule, today),
  }));

  // Em empate (duas na mesma data), vale a que vem primeiro no mês.
  const next = items.reduce<SextaDoMes | null>((best, item) => (item.date && (!best?.date || item.date < best.date) ? item : best), null);

  const weekdays = new Set(sextas.filter((p) => p.schedule.kind !== "personalizada").map((p) => p.schedule.weekday));
  const [weekday] = weekdays;
  const dia =
    weekdays.size === 1
      ? describeDayLong({ kind: "semanal", weekday, nth: 1, time: null, customDay: "", customTime: "" })
      : "Uma vez por mês, cada uma";

  return { items, dia, next: next?.date ? { ...next, quando: describeNextDate(next.date, today) } : null };
}

export type ConflitoDeSexta = { titulos: string[]; primeiraData: string; vezes: number };

/**
 * Programações das sextas que caem no mesmo dia nos próximos `days` dias (ex.: duas na 2ª sexta,
 * ou "última" e "4ª" num mês de quatro sextas). Agrupado por par, com a primeira data em comum.
 */
export function conflitosDasSextas(list: Programacao[], now: Date = new Date(), days = 186): ConflitoDeSexta[] {
  const today = todayInBrasilia(now);
  const limit = addDaysIso(today, days);
  const byDate = new Map<string, string[]>();
  for (const p of list.filter(isSexta)) {
    let from = today;
    for (let i = 0; i < 60; i++) {
      const date = nextOccurrence(p.schedule, from);
      if (!date || date > limit) break;
      byDate.set(date, [...(byDate.get(date) ?? []), p.titulo]);
      from = addDaysIso(date, 1);
    }
  }

  const byGroup = new Map<string, ConflitoDeSexta>();
  for (const [date, titulos] of [...byDate].sort(([a], [b]) => a.localeCompare(b))) {
    if (titulos.length < 2) continue;
    const key = titulos.join("|");
    const current = byGroup.get(key);
    if (current) current.vezes += 1;
    else byGroup.set(key, { titulos, primeiraData: date, vezes: 1 });
  }
  return [...byGroup.values()];
}
