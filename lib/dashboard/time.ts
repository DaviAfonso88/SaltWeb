import { todayInSaoPaulo } from "@/lib/format";
import { addDaysIso } from "@/lib/programacoes/schedule";

/** Módulo puro: contas de data do Dashboard, sempre no dia de Brasília. */

const dayNumber = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 86_400_000;

/** Dias de calendário de `from` até `to` (positivo quando `to` é depois). */
export const daysBetween = (from: Date, to: Date) => dayNumber(todayInSaoPaulo(to)) - dayNumber(todayInSaoPaulo(from));

export const startOfDay = (iso: string) => new Date(`${iso}T00:00:00-03:00`);

/** "hoje", "ontem", "há 5 dias". */
export function timeAgo(date: Date, now: Date = new Date()): string {
  const days = daysBetween(date, now);
  if (days <= 0) return "hoje";
  return days === 1 ? "ontem" : `há ${days} dias`;
}

/** Quanto falta para um evento que ainda não terminou. */
export function countdown(startsAt: Date, now: Date = new Date()): string {
  const days = daysBetween(now, startsAt);
  if (days < 0) return "em andamento";
  if (days === 0) return "é hoje";
  return days === 1 ? "é amanhã" : `em ${days} dias`;
}

export type Week = { start: string; label: string; total: number; current: boolean };

/** Primeiro dia (domingo) da janela de `weeks` semanas que termina na semana atual. */
export function weeksStart(weeks: number, now: Date = new Date()): string {
  const today = todayInSaoPaulo(now);
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  return addDaysIso(today, -weekday - 7 * (weeks - 1));
}

/** Conta as datas por semana (domingo a sábado); semanas sem nada aparecem com zero. */
export function countByWeek(dates: Date[], weeks: number, now: Date = new Date()): Week[] {
  const first = weeksStart(weeks, now);
  const buckets: Week[] = Array.from({ length: weeks }, (_, i) => {
    const start = addDaysIso(first, i * 7);
    return { start, label: `${start.slice(8, 10)}/${start.slice(5, 7)}`, total: 0, current: i === weeks - 1 };
  });
  for (const date of dates) {
    const index = Math.floor((dayNumber(todayInSaoPaulo(date)) - dayNumber(first)) / 7);
    if (buckets[index]) buckets[index].total += 1;
  }
  return buckets;
}
