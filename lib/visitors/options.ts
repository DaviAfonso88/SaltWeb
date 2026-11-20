import { onlyDigits } from "@/lib/text";

/** Grupos do discipulado (Planejamento SALT 2026), para encaminhar o visitante ao líder certo. */
export const AGE_GROUPS = [
  { value: "12-14", label: "Adolescente · 12 a 14 anos", short: "12 a 14" },
  { value: "15-17", label: "Adolescente · 15 a 17 anos", short: "15 a 17" },
  { value: "18-23", label: "Jovem · 18 a 23 anos", short: "18 a 23" },
  { value: "24-35", label: "Jovem · 24 a 35 anos", short: "24 a 35" },
  { value: "casado", label: "Jovem casado(a)", short: "Casados" },
  { value: "outra", label: "Outra idade", short: "Outra idade" },
] as const;

export const INTERESTS = [
  { value: "celula", label: "Participar de uma célula" },
  { value: "discipulado", label: "Ser discipulado" },
  { value: "servir", label: "Servir em um ministério" },
  { value: "conhecer", label: "Só conhecer, por enquanto" },
] as const;

export const HOW_FOUND = [
  { value: "amigo", label: "Convite de um amigo" },
  { value: "instagram", label: "Instagram" },
  { value: "igreja", label: "Já frequento a PIB Lagoa Santa" },
  { value: "evento", label: "Evento da SALT" },
  { value: "outro", label: "Outro" },
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number]["value"];
export type Interest = (typeof INTERESTS)[number]["value"];
export type HowFound = (typeof HOW_FOUND)[number]["value"];

export const AGE_GROUP_VALUES = AGE_GROUPS.map((g) => g.value) as [AgeGroup, ...AgeGroup[]];
export const INTEREST_VALUES = INTERESTS.map((i) => i.value) as [Interest, ...Interest[]];
export const HOW_FOUND_VALUES = HOW_FOUND.map((h) => h.value) as [HowFound, ...HowFound[]];

const labelOf = (list: readonly { value: string; label: string }[], value: string | null | undefined) =>
  list.find((o) => o.value === value)?.label ?? value ?? "";

export const ageGroupLabel = (value: string) => labelOf(AGE_GROUPS, value);
export const howFoundLabel = (value: string | null) => labelOf(HOW_FOUND, value);
export const interestLabels = (values: string[]) => values.map((v) => labelOf(INTERESTS, v));

/** Link do WhatsApp com uma saudação pronta; `null` se o número não parece brasileiro com DDD. */
export function visitorWhatsappUrl(phone: string, name: string): string | null {
  const digits = onlyDigits(phone);
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits.startsWith("55") && digits.length >= 12 ? digits : null;
  if (!full) return null;
  const first = name.trim().split(/\s+/)[0] ?? "";
  return `https://wa.me/${full}?text=${encodeURIComponent(`Oi, ${first}! Tudo bem? Aqui é da Juventude SALT.`)}`;
}
