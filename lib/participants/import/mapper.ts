import { normalizeKey } from "@/lib/text";

import { COLUMN_ALIASES } from "./aliases";

/** Valor usado para colunas que não serão importadas. */
export const IGNORED = "ignored";

/** Coluna da planilha → campo de destino (ou IGNORED). */
export type ColumnMapping = Record<string, string>;

export type ColumnSuggestion = { field: string; confidence: number };

export const FIELD_LABELS: Record<string, string> = {
  nome: "Nome",
  sexo: "Sexo",
  dataNascimento: "Data de nascimento",
  idade: "Idade",
  cpf: "CPF",
  rg: "RG",
  tipoSanguineo: "Tipo sanguíneo",
  igreja: "Igreja",
  cidade: "Cidade",
  endereco: "Endereço",
  celular: "Celular",
  whatsapp: "WhatsApp",
  email: "E-mail",
  responsavelNome: "Nome do responsável",
  responsavelTelefone: "Telefone do responsável",
  responsavelEmail: "E-mail do responsável",
  responsavelParentesco: "Parentesco do responsável",
  contatoEmergenciaNome: "Nome do contato de emergência",
  contatoEmergenciaParentesco: "Parentesco do contato de emergência",
  contatoEmergenciaTelefone: "Telefone do contato de emergência",
  condicaoSaude: "Doença ou condição médica?",
  condicaoEspecificacao: "Especificação da condição",
  deficiencia: "Deficiência ou necessidade específica?",
  deficienciaEspecificacao: "Especificação da deficiência",
  necessidadesEspeciaisDescricao: "Descrição das necessidades especiais",
  possuiAlergias: "Possui alergias?",
  alergias: "Quais alergias",
  alergiaReacao: "Reação das alergias",
  alergiaMedicacao: "Medicação para alergia",
  utilizaMedicamentosContinuos: "Uso de medicamentos contínuos?",
  medicamentos: "Medicamentos",
  possuiRestricoesAlimentares: "Restrições alimentares?",
  restricoesAlimentares: "Quais restrições alimentares",
  possuiRestricoesFisicas: "Restrições físicas?",
  restricoesFisicas: "Quais restrições físicas",
  outraInfoSaude: "Outra informação de saúde",
  declaracao: "Declaração",
  observacoes: "Observações",
  [IGNORED]: "Ignorar esta coluna",
};

/** Campos que carregam dados de saúde (exigem `participantes.saude.editar` para importar). */
export const HEALTH_IMPORT_FIELDS = new Set([
  "tipoSanguineo",
  "condicaoSaude",
  "condicaoEspecificacao",
  "deficiencia",
  "deficienciaEspecificacao",
  "necessidadesEspeciaisDescricao",
  "possuiAlergias",
  "alergias",
  "alergiaReacao",
  "alergiaMedicacao",
  "utilizaMedicamentosContinuos",
  "medicamentos",
  "possuiRestricoesAlimentares",
  "restricoesAlimentares",
  "possuiRestricoesFisicas",
  "restricoesFisicas",
  "outraInfoSaude",
]);

export const fieldLabel = (field: string) => FIELD_LABELS[field] ?? field;

/** Campos de destino disponíveis, na ordem de exibição (sem o "ignorar"). */
export const TARGET_FIELDS = Object.keys(FIELD_LABELS).filter((f) => f !== IGNORED);

const simplify = (value: string) => normalizeKey(value).replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const wordsA = a.split(" ");
  const wordsB = b.split(" ");
  const common = wordsA.filter((w) => wordsB.includes(w));
  // Contenção por palavras inteiras ("nome" em "nome do aluno"), nunca por pedaço de palavra.
  if (common.length === Math.min(wordsA.length, wordsB.length)) return 0.8;
  return common.length ? 0.6 + (common.length / Math.max(wordsA.length, wordsB.length)) * 0.4 : 0;
}

const SIMPLIFIED_ALIASES = Object.entries(COLUMN_ALIASES).map(([field, aliases]) => ({ field, aliases: aliases.map(simplify) }));

/** Melhor campo sugerido para um cabeçalho (confiança 0–1), ou null se nada parecer. */
export function suggestField(header: string): ColumnSuggestion | null {
  const h = simplify(header);
  let best: ColumnSuggestion | null = null;
  for (const { field, aliases } of SIMPLIFIED_ALIASES) {
    for (const alias of aliases) {
      const s = similarity(h, alias);
      if (s > 0.5 && (!best || s > best.confidence)) best = { field, confidence: s };
    }
  }
  return best;
}

/** Campos plausíveis para o cabeçalho, do mais provável ao menos (para sugerir alternativas). */
export function fieldSuggestions(header: string): string[] {
  const h = simplify(header);
  return SIMPLIFIED_ALIASES.map(({ field, aliases }) => ({ field, score: Math.max(...aliases.map((a) => similarity(h, a))) }))
    .filter((x) => x.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.field);
}

/**
 * Sugere o mapeamento de todas as colunas. Cada campo de destino fica só com a coluna de
 * maior confiança; as demais viram "ignorar" (a pessoa pode trocar na tela).
 */
export function autoMapColumns(headers: string[]): ColumnMapping {
  const suggestions = headers.map((header) => ({ header, s: suggestField(header) }));
  const winner = new Map<string, { header: string; confidence: number }>();
  for (const { header, s } of suggestions) {
    if (!s) continue;
    const current = winner.get(s.field);
    if (!current || s.confidence > current.confidence) winner.set(s.field, { header, confidence: s.confidence });
  }
  const mapping: ColumnMapping = {};
  for (const { header, s } of suggestions) {
    mapping[header] = s && winner.get(s.field)?.header === header ? s.field : IGNORED;
  }
  return mapping;
}

/** Assinatura estável dos cabeçalhos (ordem e acento não importam), para reaproveitar o mapeamento salvo. */
export function headerSignature(headers: string[]): string {
  const text = [...new Set(headers.map(simplify).filter(Boolean))].sort().join("|");
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(16).padStart(8, "0")}${h2.toString(16).padStart(8, "0")}${text.length.toString(16)}`;
}

export type RawRow = Record<string, string | null | undefined>;

/** Converte uma linha da planilha (por cabeçalho) em campos de destino. Vazios viram ausentes. */
export function applyMapping(row: RawRow, mapping: ColumnMapping): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [column, field] of Object.entries(mapping)) {
    if (field === IGNORED) continue;
    const value = row[column];
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text && !(field in out)) out[field] = text;
  }
  return out;
}
