import { z } from "zod";

/** Módulo puro (sem banco): tipos, validação e os textos de dia/horário usados em todo o site. */

export const KINDS = ["semanal", "mensal", "personalizada"] as const;
export type ScheduleKind = (typeof KINDS)[number];

export type Schedule = {
  kind: ScheduleKind;
  /** 0 = domingo … 6 = sábado. */
  weekday: number;
  /** Semana do mês: 1–4, `NTH_LAST` (última) ou `NTH_FIFTH` (5ª, só nos meses que têm). Só vale para `mensal`. */
  nth: number;
  /** "HH:MM" (Brasília); vazio em `personalizada`. */
  time: string | null;
  customDay: string;
  customTime: string;
};

export const KIND_LABELS: Record<ScheduleKind, string> = {
  semanal: "Toda semana",
  mensal: "Uma vez por mês",
  personalizada: "Texto livre (ex.: a combinar)",
};

const WEEKDAYS = [
  { name: "domingo", plural: "domingos", masculine: true },
  { name: "segunda-feira", plural: "segundas-feiras", masculine: false },
  { name: "terça-feira", plural: "terças-feiras", masculine: false },
  { name: "quarta-feira", plural: "quartas-feiras", masculine: false },
  { name: "quinta-feira", plural: "quintas-feiras", masculine: false },
  { name: "sexta-feira", plural: "sextas-feiras", masculine: false },
  { name: "sábado", plural: "sábados", masculine: true },
] as const;

export const WEEKDAY_OPTIONS = WEEKDAYS.map((d, value) => ({ value, label: d.name[0].toUpperCase() + d.name.slice(1) }));

/** "Última" ficou com o 5 (já gravado no banco); a 5ª semana, que só existe em alguns meses, usa o 6. */
export const NTH_LAST = 5;
export const NTH_FIFTH = 6;

export const NTH_OPTIONS = [
  { value: 1, label: "Primeira" },
  { value: 2, label: "Segunda" },
  { value: 3, label: "Terceira" },
  { value: 4, label: "Quarta" },
  { value: NTH_FIFTH, label: "Quinta (só nos meses que têm)" },
  { value: NTH_LAST, label: "Última" },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "19:30" → "19h30"; "19:00" → "19h". */
export function formatTime(time: string | null | undefined): string {
  if (!time || !TIME_RE.test(time)) return "";
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

function weekdayOf(schedule: Schedule) {
  return WEEKDAYS[schedule.weekday] ?? WEEKDAYS[5];
}

function nthOrdinal(schedule: Schedule) {
  const { masculine } = weekdayOf(schedule);
  if (schedule.nth === NTH_LAST) return masculine ? "último" : "última";
  const n = schedule.nth === NTH_FIFTH ? 5 : schedule.nth;
  return `${n}${masculine ? "º" : "ª"}`;
}

const capitalize = (s: string) => s.replace(/^./, (c) => c.toUpperCase());
const shortName = (schedule: Schedule) => weekdayOf(schedule).name.replace("-feira", "");
const whenAvailable = (schedule: Schedule) => (schedule.nth === NTH_FIFTH ? " (quando houver)" : "");

/** Texto completo: "Todas as sextas-feiras", "Toda 1ª sexta-feira do mês", "A combinar". */
export function describeDayLong(schedule: Schedule): string {
  if (schedule.kind === "personalizada") return schedule.customDay.trim();
  const day = weekdayOf(schedule);
  if (schedule.kind === "semanal") return `${day.masculine ? "Todos os" : "Todas as"} ${day.plural}`;
  return `${day.masculine ? "Todo" : "Toda"} ${nthOrdinal(schedule)} ${day.name} do mês${whenAvailable(schedule)}`;
}

/** Texto curto para espaços apertados: "Sextas", "1ª sexta do mês", "A combinar". */
export function describeDayShort(schedule: Schedule): string {
  if (schedule.kind === "personalizada") return schedule.customDay.trim();
  const base = shortName(schedule);
  if (schedule.kind === "semanal") return `${capitalize(base)}s`;
  return capitalize(`${nthOrdinal(schedule)} ${base} do mês${whenAvailable(schedule)}`);
}

/** Rótulo do ritmo mensal: "1ª sexta", "5ª sexta", "Última sexta", "Toda sexta", "A combinar". */
export function describeDayTag(schedule: Schedule): string {
  if (schedule.kind === "personalizada") return schedule.customDay.trim();
  const base = shortName(schedule);
  if (schedule.kind === "semanal") return `${weekdayOf(schedule).masculine ? "Todo" : "Toda"} ${base}`;
  return capitalize(`${nthOrdinal(schedule)} ${base}`);
}

export function describeTime(schedule: Schedule): string {
  return schedule.kind === "personalizada" ? schedule.customTime.trim() : formatTime(schedule.time);
}

const join = (parts: string[], separator: string) => parts.filter(Boolean).join(separator);

/** Os quatro formatos usados no site (home, rodapé, /eventos e /sobre). */
export function describeSchedule(schedule: Schedule) {
  const time = describeTime(schedule);
  const dayLong = describeDayLong(schedule);
  const dayShort = describeDayShort(schedule);
  return {
    dayLong,
    time,
    /** "Todas as sextas-feiras · 19h30" */
    long: join([dayLong, time], " · "),
    /** "Sextas · 19h30" */
    short: join([dayShort, time], " · "),
    /** "Sextas, 19h30" */
    footer: join([dayShort, time], ", "),
  };
}

// ── Próxima data ────────────────────────────────────────────────────────────
// Datas sem hora ("YYYY-MM-DD"), no calendário de Brasília; a conta é feita em UTC para não depender do fuso do servidor.

const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

/** Soma dias a uma data "YYYY-MM-DD". */
export function addDaysIso(iso: string, days: number): string {
  return toIso(addDays(toDate(iso), days));
}

/** Hoje em Brasília, "YYYY-MM-DD". */
export function todayInBrasilia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

/** Dia da semana `weekday` que cai na `nth` semana do mês (`month` a partir de 0); null se o mês não tiver (5ª semana). */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  if (nth === NTH_LAST) {
    const last = new Date(Date.UTC(year, month + 1, 0));
    return addDays(last, -((last.getUTCDay() - weekday + 7) % 7));
  }
  const first = new Date(Date.UTC(year, month, 1));
  const n = nth === NTH_FIFTH ? 5 : nth;
  const day = addDays(first, ((weekday - first.getUTCDay() + 7) % 7) + (n - 1) * 7);
  // `month` pode passar de 11 (meses seguintes): compara com o mês já normalizado.
  return day.getUTCMonth() === first.getUTCMonth() ? day : null;
}

/** Próxima data da programação a partir de `today` (inclusive), "YYYY-MM-DD"; null para texto livre. */
export function nextOccurrence(schedule: Schedule, today: string): string | null {
  if (schedule.kind === "personalizada") return null;
  const start = toDate(today);
  if (schedule.kind === "semanal") return toIso(addDays(start, (schedule.weekday - start.getUTCDay() + 7) % 7));
  // Mensal: procura no mês atual e nos seguintes (a 5ª semana pode pular alguns meses).
  for (let offset = 0; offset < 14; offset++) {
    const date = nthWeekdayOfMonth(start.getUTCFullYear(), start.getUTCMonth() + offset, schedule.weekday, schedule.nth);
    if (date && date >= start) return toIso(date);
  }
  return null;
}

const dayMonth = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "numeric", month: "numeric" });

/** "Hoje", "Amanhã", "Nesta sexta, 20/11" (até 6 dias) ou "Sexta, 04/12". */
export function describeNextDate(date: string, today: string): string {
  const d = toDate(date);
  const days = Math.round((d.getTime() - toDate(today).getTime()) / 86_400_000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  const day = WEEKDAYS[d.getUTCDay()];
  const name = day.name.replace("-feira", "");
  const when = dayMonth.format(d);
  return days < 7 ? `${day.masculine ? "Neste" : "Nesta"} ${name}, ${when}` : `${capitalize(name)}, ${when}`;
}

const text = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);

export const scheduleSchema = z
  .object({
    kind: z.enum(KINDS, { message: "Escolha como a programação se repete." }),
    weekday: z.coerce.number().int().min(0).max(6),
    nth: z.coerce.number().int().min(1).max(NTH_FIFTH),
    time: z.string().trim(),
    customDay: text(80),
    customTime: text(60),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "personalizada") {
      if (!v.customDay) ctx.addIssue({ code: "custom", path: ["customDay"], message: "Informe o texto do dia (ex.: A combinar)." });
      return;
    }
    if (!TIME_RE.test(v.time)) ctx.addIssue({ code: "custom", path: ["time"], message: "Informe o horário." });
  })
  .transform((v): Schedule => {
    if (v.kind === "personalizada") {
      return { kind: v.kind, weekday: 5, nth: 1, time: null, customDay: v.customDay, customTime: v.customTime };
    }
    return {
      kind: v.kind,
      weekday: v.weekday,
      nth: v.kind === "mensal" ? v.nth : 1,
      time: v.time,
      customDay: "",
      customTime: "",
    };
  });
