import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { calculateAge, normalizeForSearch, saveParticipant, updateParticipant } from "@/lib/participant/storage";
import { Participant } from "@/lib/participant/types";
import { listParticipants } from "@/lib/participant/storage";
import { applyMappings, autoMapColumns } from "@/lib/import/mapper";
import { matchParticipant, mergeParticipants } from "@/lib/import/matcher";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { rows, filename, customMappings } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "Dados da planilha são obrigatórios" },
        { status: 400 }
      );
    }

    const headers = Object.keys(rows[0]);
    const mappings = customMappings || autoMapColumns(headers);

    const existingParticipants = await listParticipants();

    const result = {
      newParticipants: 0,
      updatedParticipants: 0,
      conflicts: 0,
      details: {
        created: [] as string[],
        updated: [] as string[],
        conflictRows: [] as number[],
      },
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mappedData = applyMappings(row, mappings);

      const match = matchParticipant(mappedData, existingParticipants);

      if (match.existingParticipantId) {
        const existing = await import(
          "@/lib/participant/storage"
        ).then((m) => m.getParticipantById(match.existingParticipantId!));

        if (existing) {
          const merged = mergeParticipants(existing, mappedData, filename);
          await updateParticipant(merged);
          result.updatedParticipants++;
          result.details.updated.push(merged.id);
        }
      } else if (match.suggestedMerge && match.confidence > 0.7) {
        result.conflicts++;
        result.details.conflictRows.push(i + 1);
      } else {
        const participant = await createParticipantFromImport(mappedData, filename, session.displayName);
        result.newParticipants++;
        result.details.created.push(participant.id);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Erro ao processar importação" },
      { status: 500 }
    );
  }
}

async function createParticipantFromImport(
  data: Record<string, string | null | undefined>,
  filename: string,
  autor: string
): Promise<Participant> {
  const id = crypto.randomUUID();
  const numero = await import("@/lib/participant/storage").then((m) => m.getNextNumber());

  const responsaveis = [];
  if (data.responsavelNome && data.responsavelNome.trim()) {
    responsaveis.push({
      id: crypto.randomUUID(),
      nome: data.responsavelNome,
      grauParentesco: data.responsavelParentesco || "Não informado",
      telefone: data.responsavelTelefone || "",
      whatsapp: data.responsavelTelefone || null,
      email: data.responsavelEmail || null,
      endereco: null,
      observacoes: null,
    });
  }

  const contatoEmergencia =
    data.contatoEmergenciaNome && data.contatoEmergenciaNome.trim()
      ? {
          nome: data.contatoEmergenciaNome,
          parentesco: data.contatoEmergenciaParentesco || null,
          telefone: data.contatoEmergenciaTelefone || "",
        }
      : null;

  const parseList = (value: string | null | undefined): string[] => {
    if (!value || !value.trim()) return [];
    return value
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const isSim = (value: string | null | undefined): boolean => {
    if (!value) return false;
    return value.trim().toLowerCase().startsWith("sim");
  };

  const normalizeSexo = (value: string | null | undefined): "M" | "F" | null => {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    if (["m", "masculino", "masc", "male", "homme"].includes(v)) return "M";
    if (["f", "feminino", "fem", "female", "femme"].includes(v)) return "F";
    if (v.includes("prefiro") || v.includes("não informar") || v.includes("nao informar") || v.includes("não quero") || v.includes("outro")) return null;
    return null;
  };

  const parseIdade = (value: string | null | undefined): number | null => {
    if (!value || !value.trim()) return null;
    const v = value.trim()
      .normalize("NFC")
      .replace(/[\u00A0\u2000-\u200B\u202F\u2060\uFEFF]/g, " ")
      .replace(/[\u2018\u2019\u201C\u201D]/g, "'");
    const numeric = parseInt(v, 10);
    if (!isNaN(numeric) && numeric >= 0 && numeric <= 130) return numeric;
    const brMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      return calculateAge(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
    }
    const ptMonthMatch = v.match(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+de\s+(\d{4})$/i);
    if (ptMonthMatch) {
      const months: Record<string, string> = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };
      const monthNum = months[ptMonthMatch[1].toLowerCase().replace(".", "")];
      if (monthNum) return calculateAge(`${ptMonthMatch[2]}-${monthNum}-01`);
    }
    const date = new Date(v);
    if (!isNaN(date.getTime())) {
      return calculateAge(v);
    }
    return null;
  };

  const normalizeDate = (value: string | null | undefined): string | null => {
    if (!value || !value.trim()) return null;
    const v = value.trim()
      .normalize("NFC")
      .replace(/[\u00A0\u2000-\u200B\u202F\u2060\uFEFF]/g, " ")
      .replace(/[\u2018\u2019\u201C\u201D]/g, "'");
    const brMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const ptMonthMatch = v.match(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+de\s+(\d{4})$/i);
    if (ptMonthMatch) {
      const months: Record<string, string> = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };
      const monthNum = months[ptMonthMatch[1].toLowerCase().replace(".", "")];
      if (monthNum) return `${ptMonthMatch[2]}-${monthNum}-01`;
    }
    const isoMatch = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const y = parseInt(year, 10);
      if (y >= 1900 && y <= 2100) return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    const simpleDateMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{1,2})$/);
    if (simpleDateMatch) {
      const [, day, month, yearShort] = simpleDateMatch;
      const y = parseInt(yearShort, 10);
      const fullYear = y < 100 ? 2000 + y : y;
      if (fullYear >= 1900 && fullYear <= 2100) return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return null;
  };

  const participant: Participant = {
    id,
    numero,
    nome: data.nome || "Sem nome",
    nomeNormalizado: normalizeForSearch(data.nome || "Sem nome"),
    sexo: normalizeSexo(data.sexo),
    dataNascimento: normalizeDate(data.dataNascimento),
    idade: data.dataNascimento
      ? calculateAge(data.dataNascimento)
      : parseIdade(data.idade),
    cpf: data.cpf || null,
    rg: data.rg || null,
    igreja: data.igreja || null,
    cidade: data.cidade || null,
    endereco: data.endereco || null,
    foto: null,

    celular: data.celular || null,
    whatsapp: data.whatsapp || data.celular || null,
    email: data.email || null,

    responsaveis,

    contatoEmergencia,

    saude: {
      tipoSanguineo: data.tipoSanguineo || null,
      alergias: parseList(data.alergias),
      alergiaReacao: data.alergiaReacao || null,
      alergiaMedicacao: data.alergiaMedicacao || null,
      medicamentos: parseList(data.medicamentos),
      condicoes: isSim(data.condicaoSaude) && data.condicaoEspecificacao
        ? parseList(data.condicaoEspecificacao)
        : isSim(data.condicaoSaude)
          ? ["Condição não especificada"]
          : [],
      condicaoEspecificacao: data.condicaoEspecificacao || null,
      deficiencia: isSim(data.deficiencia) ? (data.deficienciaEspecificacao || "Não especificada") : null,
      deficienciaEspecificacao: data.deficienciaEspecificacao || null,
      restricoesAlimentares: parseList(data.restricoesAlimentares),
      restricoesFisicas: data.restricoesFisicas || null,
      observacoesMedicas: [],
      outraInfoSaude: data.outraInfoSaude || null,
      necessidadesEspeciais: isSim(data.deficiencia),
      necessidadesEspeciaisDescricao: data.necessidadesEspeciaisDescricao || null,
    },

    declaracao: isSim(data.declaracao),

    observacoes: data.observacoes
      ? [
          {
            id: crypto.randomUUID(),
            texto: data.observacoes,
            autor: `Importação (${filename})`,
            createdAt: new Date().toISOString(),
          },
        ]
      : [],

    historico: [
      {
        id: crypto.randomUUID(),
        campo: "criação",
        valorAnterior: null,
        valorNovo: "Participante criado via importação",
        autor,
        createdAt: new Date().toISOString(),
      },
    ],

    anexos: [],

    fontes: [filename],
    importId: null,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveParticipant(participant);
  return participant;
}
