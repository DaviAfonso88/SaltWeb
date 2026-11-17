import { normalizeKey, onlyDigits, phoneKey } from "@/lib/text";

/** Limiares do data-model.md (regra "Repetidos na importação"). */
export const UPDATE_THRESHOLD = 0.95;
export const REVIEW_THRESHOLD = 0.7;
const MAX_REVIEW_CANDIDATES = 5;

export type MatchCandidate = {
  id: string;
  name: string;
  cpf: string | null;
  email: string | null;
  mobile: string | null;
  birthDate: string | null;
};

export type MatchInput = {
  name?: string | null;
  cpf?: string | null;
  email?: string | null;
  mobile?: string | null;
  birthDate?: string | null;
};

export type ScoredCandidate = { id: string; name: string; score: number; reason: string };

export type MatchOutcome =
  | { kind: "new" }
  | { kind: "update"; candidate: ScoredCandidate }
  | { kind: "review"; candidates: ScoredCandidate[] };

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Semelhança de nomes 0–1 (Levenshtein normalizado, sem acento nem maiúsculas). */
export function nameSimilarity(a: string, b: string): number {
  const na = normalizeKey(a);
  const nb = normalizeKey(b);
  if (!na && !nb) return 1;
  const max = Math.max(na.length, nb.length);
  return max === 0 ? 1 : 1 - levenshtein(na, nb) / max;
}

const same = (a: string | null | undefined, b: string | null | undefined, key: (v: string) => string, minLen: number) => {
  if (!a || !b) return false;
  const ka = key(a);
  const kb = key(b);
  return ka.length >= minLen && ka === kb;
};

export function scoreCandidate(input: MatchInput, c: MatchCandidate): ScoredCandidate | null {
  if (same(input.cpf, c.cpf, onlyDigits, 11)) return { id: c.id, name: c.name, score: 1, reason: "Mesmo CPF" };

  const nameSim = input.name ? nameSimilarity(input.name, c.name) : 0;
  const sameEmail = same(input.email, c.email, (v) => v.toLowerCase().trim(), 5);
  const samePhone = same(input.mobile, c.mobile, phoneKey, 10);
  const bothBirth = Boolean(input.birthDate && c.birthDate);
  const sameBirth = bothBirth && input.birthDate === c.birthDate;

  let score = nameSim;
  const reasons: string[] = [];
  if (nameSim >= 0.95) reasons.push("Nome igual");
  else if (nameSim >= REVIEW_THRESHOLD) reasons.push("Nome parecido");

  if (sameBirth) {
    score = Math.min(1, score + 0.1);
    reasons.push("mesma data de nascimento");
  } else if (bothBirth) {
    score -= 0.15;
    reasons.push("data de nascimento diferente");
  }

  // E-mail ou celular iguais só decidem junto com o nome (irmãos costumam usar o mesmo telefone).
  if (sameEmail || samePhone) {
    if (nameSim >= 0.85) score = Math.max(score, UPDATE_THRESHOLD);
    else if (nameSim >= 0.5) score = Math.max(score, REVIEW_THRESHOLD);
    reasons.push(sameEmail ? "mesmo e-mail" : "mesmo celular");
  }

  if (score < REVIEW_THRESHOLD) return null;
  const reason = reasons.join(", ");
  return { id: c.id, name: c.name, score: Math.round(score * 100) / 100, reason: reason.charAt(0).toUpperCase() + reason.slice(1) };
}

/**
 * ≥ 0,95 e único → atualização sugerida; entre 0,7 e 0,95, ou mais de um candidato → revisão
 * manual; abaixo de 0,7 → cadastro novo.
 */
export function classifyMatch(input: MatchInput, candidates: MatchCandidate[]): MatchOutcome {
  const scored = candidates
    .map((c) => scoreCandidate(input, c))
    .filter((s): s is ScoredCandidate => s !== null)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return { kind: "new" };
  if (scored.length === 1 && scored[0].score >= UPDATE_THRESHOLD) return { kind: "update", candidate: scored[0] };
  // CPF igual identifica a pessoa mesmo que haja outros nomes parecidos.
  if (scored[0].score === 1 && scored[0].reason === "Mesmo CPF" && scored[1]?.score !== 1) return { kind: "update", candidate: scored[0] };
  return { kind: "review", candidates: scored.slice(0, MAX_REVIEW_CANDIDATES) };
}
