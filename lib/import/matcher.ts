import { Participant } from "@/lib/participant/types";

import { MatchResult } from "./types";

const normalizeString = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
};

const nameSimilarity = (a: string, b: string): number => {
  const na = normalizeString(a);
  const nb = normalizeString(b);

  if (na === nb) return 1;

  const distance = levenshteinDistance(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1;

  return 1 - distance / maxLen;
};

const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
};

const normalizeCPF = (cpf: string | null | undefined): string => {
  if (!cpf) return "";
  return cpf.replace(/\D/g, "");
};

const normalizeEmail = (email: string | null | undefined): string => {
  if (!email) return "";
  return email.toLowerCase().trim();
};

export function matchParticipant(
  data: Record<string, string | null | undefined>,
  existingParticipants: Participant[]
): MatchResult {
  const nome = data.nome;
  const cpf = data.cpf;
  const email = data.email;
  const celular = data.cellular || data.celular;
  const dataNascimento = data.dataNascimento;

  // Exact CPF match = highest confidence
  if (cpf) {
    const normCPF = normalizeCPF(cpf);
    for (const p of existingParticipants) {
      if (normalizeCPF(p.cpf) === normCPF && normCPF.length >= 11) {
        return {
          existingParticipantId: p.id,
          confidence: 1,
          matchType: "exact",
          suggestedMerge: false,
        };
      }
    }
  }

  // Exact email match
  if (email) {
    const normEmail = normalizeEmail(email);
    for (const p of existingParticipants) {
      if (normalizeEmail(p.email) === normEmail && normEmail.length > 3) {
        return {
          existingParticipantId: p.id,
          confidence: 0.95,
          matchType: "exact",
          suggestedMerge: false,
        };
      }
    }
  }

  // Name + phone match
  if (nome && celular) {
    const normPhone = normalizePhone(celular);

    for (const p of existingParticipants) {
      const nameSim = nameSimilarity(p.nome, nome);
      const phoneMatch = normalizePhone(p.celular) === normPhone;

      if (nameSim > 0.85 && phoneMatch) {
        return {
          existingParticipantId: p.id,
          confidence: 0.95,
          matchType: "high",
          suggestedMerge: false,
        };
      }
    }
  }

  // Name + birth date match
  if (nome && dataNascimento) {
    for (const p of existingParticipants) {
      const nameSim = nameSimilarity(p.nome, nome);
      const dobMatch = p.dataNascimento === dataNascimento;

      if (nameSim > 0.85 && dobMatch) {
        return {
          existingParticipantId: p.id,
          confidence: 0.9,
          matchType: "high",
          suggestedMerge: false,
        };
      }
    }
  }

  // Name-only fuzzy match (suggest merge if similarity is high enough)
  if (nome) {
    const candidates: Array<{ participant: Participant; similarity: number }> = [];

    for (const p of existingParticipants) {
      const sim = nameSimilarity(p.nome, nome);
      if (sim >= 0.75) {
        candidates.push({ participant: p, similarity: sim });
      }
    }

    candidates.sort((a, b) => b.similarity - a.similarity);

    if (candidates.length > 0 && candidates[0].similarity >= 0.85) {
      return {
        existingParticipantId: candidates[0].participant.id,
        confidence: candidates[0].similarity,
        matchType: candidates[0].similarity >= 0.95 ? "high" : "medium",
        suggestedMerge: candidates[0].similarity < 0.95,
      };
    }

    if (candidates.length > 0 && candidates[0].similarity >= 0.75) {
      return {
        existingParticipantId: null,
        confidence: candidates[0].similarity,
        matchType: "low",
        suggestedMerge: true,
      };
    }
  }

  return {
    existingParticipantId: null,
    confidence: 0,
    matchType: "none",
    suggestedMerge: false,
  };
}

export function mergeParticipants(
  existing: Participant,
  incoming: Record<string, string | null | undefined>,
  sourceFile: string
): Participant {
  const updated = { ...existing };

  const fields = [
    "nome",
    "cpf",
    "rg",
    "igreja",
    "cidade",
    "endereco",
    "celular",
    "whatsapp",
    "email",
    "foto",
  ] as const;

  for (const field of fields) {
    const incomingValue = incoming[field];
    if (incomingValue && (!updated[field] || String(updated[field]).trim() === "")) {
      (updated as Record<string, unknown>)[field] = incomingValue;
    }
  }

  if (incoming.sexo && (!updated.sexo || updated.sexo.trim() === "")) {
    const v = String(incoming.sexo).trim().toLowerCase();
    if (["m", "masculino", "masc", "male", "homme"].includes(v)) {
      updated.sexo = "M";
    } else if (["f", "feminino", "fem", "female", "femme"].includes(v)) {
      updated.sexo = "F";
    }
    // "Prefiro não informar" / "Outro" → fica null (não atualiza)
  }

  if (incoming.dataNascimento && !updated.dataNascimento) {
    const v = incoming.dataNascimento.trim();
    const brMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      updated.dataNascimento = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else {
      const ptMonthMatch = v.match(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+de\s+(\d{4})$/i);
      if (ptMonthMatch) {
        const months: Record<string, string> = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };
        const monthNum = months[ptMonthMatch[1].toLowerCase().replace(".", "")];
        updated.dataNascimento = monthNum ? `${ptMonthMatch[2]}-${monthNum}-01` : v;
      } else {
        updated.dataNascimento = v;
      }
    }
  }

  if (incoming.idade) {
    const raw = String(incoming.idade).trim();
    let age: number | null = null;
    const numeric = parseInt(raw, 10);
    if (!isNaN(numeric) && numeric >= 0 && numeric <= 130) {
      age = numeric;
    } else {
      const brMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      let dateStr = raw;
      if (brMatch) {
        const [, day, month, year] = brMatch;
        dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const today = new Date();
        age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
        if (age < 0) age = null;
      }
    }
    if (age !== null && (updated.idade === null || updated.idade === undefined)) {
      updated.idade = age;
    }
  }

  if (incoming.responsavelNome && incoming.responsavelNome.trim()) {
    const hasExisting = updated.responsaveis.some(
      (r) => normalizeString(r.nome) === normalizeString(incoming.responsavelNome!)
    );
    if (!hasExisting) {
      updated.responsaveis.push({
        id: crypto.randomUUID(),
        nome: incoming.responsavelNome,
        grauParentesco: incoming.responsavelParentesco || "Não informado",
        telefone: incoming.responsavelTelefone || "",
        whatsapp: incoming.responsavelTelefone || null,
        email: incoming.responsavelEmail || null,
        endereco: null,
        observacoes: null,
      });
    }
  }

  if (incoming.alergias) {
    const items = incoming.alergias
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const item of items) {
      if (!updated.saude.alergias.includes(item)) {
        updated.saude.alergias.push(item);
      }
    }
  }

  if (incoming.medicamentos) {
    const items = incoming.medicamentos
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const item of items) {
      if (!updated.saude.medicamentos.includes(item)) {
        updated.saude.medicamentos.push(item);
      }
    }
  }

  if (incoming.restricoesAlimentares) {
    const items = incoming.restricoesAlimentares
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const item of items) {
      if (!updated.saude.restricoesAlimentares.includes(item)) {
        updated.saude.restricoesAlimentares.push(item);
      }
    }
  }

  if (incoming.observacoes && incoming.observacoes.trim()) {
    const hasDuplicate = updated.observacoes.some(
      (o) => normalizeString(o.texto) === normalizeString(incoming.observacoes!)
    );
    if (!hasDuplicate) {
      updated.observacoes.push({
        id: crypto.randomUUID(),
        texto: incoming.observacoes,
        autor: `Importação (${sourceFile})`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (!updated.fontes.includes(sourceFile)) {
    updated.fontes.push(sourceFile);
  }

  updated.historico.push({
    id: crypto.randomUUID(),
    campo: "importação",
    valorAnterior: null,
    valorNovo: `Dados atualizados via importação de ${sourceFile}`,
    autor: "Sistema",
    createdAt: new Date().toISOString(),
  });

  updated.updatedAt = new Date().toISOString();

  return updated;
}
