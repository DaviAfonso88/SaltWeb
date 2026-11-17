const TZ = "America/Sao_Paulo";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const dateLongFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
  year: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const monthFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const currencyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type DateInput = Date | string | number;
const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d));

export const formatDate = (d: DateInput) => dateFmt.format(toDate(d));
export const formatDateLong = (d: DateInput) => dateLongFmt.format(toDate(d));
export const formatDateTime = (d: DateInput) => dateTimeFmt.format(toDate(d));
/** `reference` é uma data YYYY-MM-DD (dia 1 do mês). */
export const formatMonth = (reference: string) => monthFmt.format(new Date(`${reference}T00:00:00Z`));
export const formatCurrency = (cents: number) => currencyFmt.format(cents / 100);

/** Date → valor de `<input type="datetime-local">` no fuso de Brasília. */
export function toSaoPauloInput(d: DateInput | null | undefined): string {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(toDate(d));
  return parts.replace(" ", "T");
}

/** Valor de `<input type="datetime-local">` (horário de Brasília, offset fixo −03:00) → Date. */
export function fromSaoPauloInput(value: string): Date | null {
  if (!value) return null;
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${withSeconds}-03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Data de hoje em Brasília, YYYY-MM-DD. */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function calculateAge(birthDate: string, now: Date = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  const [ty, tm, td] = todayInSaoPaulo(now).split("-").map(Number);
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age--;
  return age;
}

const dayFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "numeric" });
const monthLongFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, month: "long" });
const monthShortFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, month: "short" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

const ymd = (d: Date) => todayInSaoPaulo(d);

/** Resumo de datas de um evento para cartões e página de detalhe. */
export function describeEventDates(startsAt: DateInput, endsAt?: DateInput | null) {
  const start = toDate(startsAt);
  const end = endsAt ? toDate(endsAt) : null;
  const sameDay = !end || ymd(start) === ymd(end);
  const sameMonth = !end || ymd(start).slice(0, 7) === ymd(end).slice(0, 7);
  const time = timeFmt.format(start);
  const startTime = time === "00:00" ? null : time.replace(":00", "h").replace(":", "h");

  const month = monthShortFmt.format(start).replace(".", "").toUpperCase();
  const days = sameDay ? dayFmt.format(start) : `${dayFmt.format(start)}–${dayFmt.format(end!)}`;

  let long: string;
  if (sameDay) long = `${dayFmt.format(start)} de ${monthLongFmt.format(start)}`;
  else if (sameMonth) long = `${dayFmt.format(start)} a ${dayFmt.format(end!)} de ${monthLongFmt.format(start)}`;
  else long = `${dayFmt.format(start)} de ${monthLongFmt.format(start)} a ${dayFmt.format(end!)} de ${monthLongFmt.format(end!)}`;
  if (startTime) long += ` · a partir das ${startTime}`;

  return { month, days, long, startTime };
}
