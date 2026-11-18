import { z } from "zod";

/** Módulo puro (sem banco): tipos, validação e os textos de dia/horário usados em todo o site. */

export const KINDS = ["semanal", "mensal", "personalizada"] as const;
export type ScheduleKind = (typeof KINDS)[number];

export type Schedule = {
  kind: ScheduleKind;
  /** 0 = domingo … 6 = sábado. */
  weekday: number;
  /** Semana do mês (1–4) ou 5 = última; só vale para `mensal`. */
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

export const NTH_OPTIONS = [
  { value: 1, label: "Primeira" },
  { value: 2, label: "Segunda" },
  { value: 3, label: "Terceira" },
  { value: 4, label: "Quarta" },
  { value: 5, label: "Última" },
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
  if (schedule.nth >= 5) return masculine ? "último" : "última";
  return `${schedule.nth}${masculine ? "º" : "ª"}`;
}

/** Texto completo: "Todas as sextas-feiras", "Toda 1ª sexta-feira do mês", "A combinar". */
export function describeDayLong(schedule: Schedule): string {
  if (schedule.kind === "personalizada") return schedule.customDay.trim();
  const day = weekdayOf(schedule);
  if (schedule.kind === "semanal") return `${day.masculine ? "Todos os" : "Todas as"} ${day.plural}`;
  return `${day.masculine ? "Todo" : "Toda"} ${nthOrdinal(schedule)} ${day.name} do mês`;
}

/** Texto curto para espaços apertados: "Sextas", "1ª sexta do mês", "A combinar". */
export function describeDayShort(schedule: Schedule): string {
  if (schedule.kind === "personalizada") return schedule.customDay.trim();
  const day = weekdayOf(schedule);
  const base = day.name.replace("-feira", "");
  if (schedule.kind === "semanal") return `${base[0].toUpperCase()}${base.slice(1)}s`;
  return `${nthOrdinal(schedule)} ${base} do mês`.replace(/^./, (c) => c.toUpperCase());
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

const text = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);

export const scheduleSchema = z
  .object({
    kind: z.enum(KINDS, { message: "Escolha como a programação se repete." }),
    weekday: z.coerce.number().int().min(0).max(6),
    nth: z.coerce.number().int().min(1).max(5),
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
