import type { ColumnMapping } from "./mapper";
import type { ScoredCandidate } from "./matcher";

export const MAX_IMPORT_ROWS = 2000;

/** Conteúdo lido da planilha no navegador (tudo como texto). */
export type ImportPayload = {
  fileName: string;
  headers: string[];
  rows: Record<string, string | null>[];
  mapping?: ColumnMapping;
};

export type PreviewPerson = {
  /** Número da linha na planilha (a linha 1 é o cabeçalho). */
  row: number;
  name: string;
  church: string | null;
  city: string | null;
  birthDate: string | null;
  mobile: string | null;
  warnings: string[];
};

export type ImportPreview = {
  mapping: ColumnMapping;
  mappingSource: "salvo" | "sugerido" | "manual";
  signature: string;
  totals: { linhas: number; novos: number; atualizacoes: number; revisao: number; invalidas: number; vazias: number };
  novos: PreviewPerson[];
  atualizacoes: (PreviewPerson & { candidate: ScoredCandidate })[];
  revisao: (PreviewPerson & { candidates: ScoredCandidate[] })[];
  invalidas: { row: number; reason: string; name?: string }[];
};

/** Escolha da pessoa para uma linha: criar novo, pular ou atualizar um cadastro existente. */
export type RowDecision = "new" | "skip" | { update: string };

export type CommitPayload = ImportPayload & {
  mapping: ColumnMapping;
  /** Chave: número da linha. Sem decisão: atualizações seguem a sugestão e a revisão é pulada. */
  decisions: Record<string, RowDecision>;
};

export type ImportCommitResult = { created: number; updated: number; skipped: number; invalid: number; batchId: string };
