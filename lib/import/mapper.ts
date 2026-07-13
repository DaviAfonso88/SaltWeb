import { COLUMN_ALIASES } from "@/lib/participant/constants";

import { ColumnMapping } from "./types";

const normalizeString = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const calculateSimilarity = (a: string, b: string): number => {
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.8;

  const wordsA = a.split(" ");
  const wordsB = b.split(" ");
  const commonWords = wordsA.filter((w) => wordsB.includes(w));

  if (commonWords.length > 0) {
    return 0.6 + (commonWords.length / Math.max(wordsA.length, wordsB.length)) * 0.4;
  }

  return 0;
};

export function autoMapColumns(headers: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];

  for (const header of headers) {
    const normalizedHeader = normalizeString(header);
    let bestMatch: { field: string; confidence: number } | null = null;

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      for (const alias of aliases) {
        const normalizedAlias = normalizeString(alias);
        const similarity = calculateSimilarity(normalizedHeader, normalizedAlias);

        if (similarity > 0.5) {
          if (!bestMatch || similarity > bestMatch.confidence) {
            bestMatch = { field, confidence: similarity };
          }
        }
      }
    }

    mappings.push({
      sourceColumn: header,
      targetField: bestMatch?.field || "ignored",
      confidence: bestMatch?.confidence || 0,
    });
  }

  return mappings;
}

export function applyMappings(
  row: Record<string, string | null | undefined>,
  mappings: ColumnMapping[]
): Record<string, string | null | undefined> {
  const result: Record<string, string | null | undefined> = {};

  for (const mapping of mappings) {
    if (mapping.targetField === "ignored") continue;
    result[mapping.targetField] = row[mapping.sourceColumn] ?? null;
  }

  return result;
}

export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    nome: "Nome",
    sexo: "Sexo",
    dataNascimento: "Data de Nascimento",
    idade: "Idade",
    cpf: "CPF",
    rg: "RG",
    tipoSanguineo: "Tipo Sanguíneo",
    igreja: "Igreja",
    cidade: "Cidade",
    endereco: "Endereço",
    celular: "Celular",
    whatsapp: "WhatsApp",
    email: "Email",
    responsavelNome: "Nome do Responsável",
    responsavelTelefone: "Telefone do Responsável",
    responsavelEmail: "Email do Responsável",
    responsavelParentesco: "Parentesco do Responsável",
    contatoEmergenciaNome: "Nome do Contato de Emergência",
    contatoEmergenciaParentesco: "Parentesco do Contato de Emergência",
    contatoEmergenciaTelefone: "Telefone do Contato de Emergência",
    condicaoSaude: "Doença/Condição Médica?",
    condicaoEspecificacao: "Especificação da Condição",
    deficiencia: "Deficiência/Necessidade Específica?",
    deficienciaEspecificacao: "Especificação da Deficiência",
    possuiAlergias: "Possui Alergias?",
    alergias: "Quais Alergias",
    alergiaReacao: "Reação das Alergias",
    alergiaMedicacao: "Medicação para Alergia",
    utilizaMedicamentosContinuos: "Uso de Medicamentos Contínuos?",
    medicamentos: "Medicamentos (Nome, Dose, Horário, Motivo)",
    possuiRestricoesAlimentares: "Restrições Alimentares?",
    restricoesAlimentares: "Quais Restrições Alimentares",
    possuiRestricoesFisicas: "Restrições Físicas?",
    restricoesFisicas: "Quais Restrições Físicas",
    outraInfoSaude: "Outra Informação sobre Saúde",
    declaracao: "Declaração",
    observacoes: "Observações",
    ignored: "Ignorado",
  };
  return labels[field] || field;
}

export function getFieldSuggestions(header: string): string[] {
  const normalized = normalizeString(header);
  const suggestions: string[] = [];

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const sim = calculateSimilarity(normalized, normalizeString(alias));
      if (sim > 0.4) {
        suggestions.push(field);
        break;
      }
    }
  }

  return suggestions;
}
