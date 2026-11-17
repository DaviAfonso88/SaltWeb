import { onlyDigits } from "@/lib/text";

import { ageFromBirthDate } from "../schemas";

const MONTHS: Record<string, string> = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };

const pad = (n: string) => n.padStart(2, "0");

/** Aceita DD/MM/AAAA, AAAA-MM-DD, "mai de 2008" e número serial do Excel; devolve AAAA-MM-DD ou null. */
export function parseBirthDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;
  const br = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (br) {
    const year = br[3].length === 2 ? (Number(br[3]) > 30 ? `19${br[3]}` : `20${br[3]}`) : br[3];
    return `${year}-${pad(br[2])}-${pad(br[1])}`;
  }
  const pt = v.match(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+de\s+(\d{4})$/i);
  if (pt) return `${pt[2]}-${MONTHS[pt[1].toLowerCase()]}-01`;
  if (/^\d{5}$/.test(v)) {
    const date = new Date(Date.UTC(1899, 11, 30) + Number(v) * 86_400_000);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  }
  return null;
}

export function parseSex(raw: string | undefined | null): "M" | "F" | null {
  const v = raw?.trim().toLowerCase();
  if (!v) return null;
  if (["m", "masculino", "masc", "male", "homem"].includes(v)) return "M";
  if (["f", "feminino", "fem", "female", "mulher"].includes(v)) return "F";
  return null; // "Outro" / "Prefiro não informar" ficam sem informação
}

/** Divide "a, b; c" em itens sem repetição. */
export function parseList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean))];
}

const NEGATIVE = /^(nao|não|n|nenhum|nenhuma|-|0)\.?$/i;

/** Sim/não de planilha. Texto livre ("diabetes") conta como sim; "não", "nenhum" e vazio como não. */
export function parseYesNo(raw: string | undefined | null): boolean {
  const v = raw?.trim();
  if (!v) return false;
  return !NEGATIVE.test(v);
}

/** Se a planilha só traz idade (sem nascimento), estima um nascimento não usado como dado real: devolve só a idade. */
export function parseAge(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isNaN(n) && n >= 0 && n <= 130 && /^\d{1,3}$/.test(raw.trim())) return n;
  const date = parseBirthDate(raw);
  return date ? ageFromBirthDate(date) : null;
}

export const digits = onlyDigits;
