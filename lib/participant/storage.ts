import { redis } from "@/lib/redis";

import {
  COUNTER_KEY,
  IDS_LIST_KEY,
  RECORD_KEY_PREFIX,
  SEARCH_INDEX_PREFIX,
} from "./constants";
import { Participant } from "./types";

const parseRecord = (raw: unknown): Participant | null => {
  if (!raw) return null;

  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") return null;

  const record = value as Partial<Participant>;
  if (!record.id || !record.nome || !record.createdAt) return null;

  return record as Participant;
};

const normalizeForSearch = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const calculateAge = (birthDate: string): number | null => {
  try {
    let dateStr = birthDate.trim()
      .normalize("NFC")
      .replace(/[\u00A0\u2000-\u200B\u202F\u2060\uFEFF]/g, " ")
      .replace(/[\u2018\u2019\u201C\u201D]/g, "'");
    const brMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      dateStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    } else {
      const ptMonthMatch = dateStr.match(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+de\s+(\d{4})$/i);
      if (ptMonthMatch) {
        const months: Record<string, string> = { jan: "01", fev: "02", mar: "03", abr: "04", mai: "05", jun: "06", jul: "07", ago: "08", set: "09", out: "10", nov: "11", dez: "12" };
        const monthNum = months[ptMonthMatch[1].toLowerCase().replace(".", "")];
        if (monthNum) dateStr = `${ptMonthMatch[2]}-${monthNum}-01`;
      }
    }
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  } catch {
    return null;
  }
};

export async function getNextNumber(): Promise<string> {
  const num = await redis.incr(COUNTER_KEY);
  return `CAMP-2026-${String(num).padStart(4, "0")}`;
}

export async function saveParticipant(participant: Participant): Promise<void> {
  const tx = redis.multi();
  tx.set(`${RECORD_KEY_PREFIX}${participant.id}`, participant);
  tx.lpush(IDS_LIST_KEY, participant.id);

  const nomeNorm = normalizeForSearch(participant.nome);
  tx.sadd(`${SEARCH_INDEX_PREFIX}nome:${nomeNorm}`, participant.id);

  if (participant.igreja) {
    const igrejaNorm = normalizeForSearch(participant.igreja);
    tx.sadd(`${SEARCH_INDEX_PREFIX}igreja:${igrejaNorm}`, participant.id);
  }

  if (participant.cidade) {
    const cidadeNorm = normalizeForSearch(participant.cidade);
    tx.sadd(`${SEARCH_INDEX_PREFIX}cidade:${cidadeNorm}`, participant.id);
  }

  await tx.exec();
}

export async function updateParticipant(participant: Participant): Promise<void> {
  await redis.set(`${RECORD_KEY_PREFIX}${participant.id}`, participant);
}

export async function deleteParticipant(id: string): Promise<boolean> {
  const participant = await getParticipantById(id);
  if (!participant) return false;

  const tx = redis.multi();
  tx.del(`${RECORD_KEY_PREFIX}${id}`);
  tx.lrem(IDS_LIST_KEY, 0, id);

  const nomeNorm = normalizeForSearch(participant.nome);
  tx.srem(`${SEARCH_INDEX_PREFIX}nome:${nomeNorm}`, id);

  if (participant.igreja) {
    const igrejaNorm = normalizeForSearch(participant.igreja);
    tx.srem(`${SEARCH_INDEX_PREFIX}igreja:${igrejaNorm}`, id);
  }

  if (participant.cidade) {
    const cidadeNorm = normalizeForSearch(participant.cidade);
    tx.srem(`${SEARCH_INDEX_PREFIX}cidade:${cidadeNorm}`, id);
  }

  await tx.exec();
  return true;
}

export async function deleteAllParticipants(): Promise<number> {
  const ids = await redis.lrange(IDS_LIST_KEY, 0, -1);
  if (ids.length === 0) return 0;

  const participants = await Promise.all(ids.map((id) => getParticipantById(id)));

  const tx = redis.multi();
  for (const id of ids) {
    tx.del(`${RECORD_KEY_PREFIX}${id}`);
  }
  tx.del(IDS_LIST_KEY);
  tx.del(COUNTER_KEY);

  for (const p of participants) {
    if (!p) continue;
    const nomeNorm = normalizeForSearch(p.nome);
    tx.del(`${SEARCH_INDEX_PREFIX}nome:${nomeNorm}`);
    if (p.igreja) {
      tx.del(`${SEARCH_INDEX_PREFIX}igreja:${normalizeForSearch(p.igreja)}`);
    }
    if (p.cidade) {
      tx.del(`${SEARCH_INDEX_PREFIX}cidade:${normalizeForSearch(p.cidade)}`);
    }
  }

  await tx.exec();
  return ids.length;
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  const raw = await redis.get(`${RECORD_KEY_PREFIX}${id}`);
  return parseRecord(raw);
}

export async function listParticipants(): Promise<Participant[]> {
  const allKeys = await redis.keys(`${RECORD_KEY_PREFIX}*`);
  const recordKeys = allKeys.filter((key) => !key.includes(":counter") && !key.includes(":idx:"));

  if (recordKeys.length === 0) return [];

  const values = await redis.mget<unknown[]>(...recordKeys);
  return values
    .map(parseRecord)
    .filter((p): p is Participant => p !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function searchParticipants(query: string): Promise<Participant[]> {
  const allParticipants = await listParticipants();
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) return allParticipants;

  return allParticipants.filter((p) => {
    const nome = normalizeForSearch(p.nome);
    const igreja = p.igreja ? normalizeForSearch(p.igreja) : "";
    const cidade = p.cidade ? normalizeForSearch(p.cidade) : "";
    const email = p.email ? normalizeForSearch(p.email) : "";
    const cpf = p.cpf ? normalizeForSearch(p.cpf) : "";

    return (
      nome.includes(normalizedQuery) ||
      igreja.includes(normalizedQuery) ||
      cidade.includes(normalizedQuery) ||
      email.includes(normalizedQuery) ||
      cpf.includes(normalizedQuery)
    );
  });
}

export async function getStats(): Promise<{
  total: number;
  totalResponsaveis: number;
  comRestricoesAlimentares: number;
  comMedicamentos: number;
  comAlergias: number;
  comNecessidadesEspeciais: number;
  porIgreja: Record<string, number>;
  porCidade: Record<string, number>;
  porCondicoes: Record<string, number>;
  porIdade: Record<string, number>;
  porSexo: Record<string, number>;
  nomesComAlergias: string[];
  nomesComMedicamentos: string[];
  nomesComRestricoesAlimentares: string[];
  nomesComCondicoes: string[];
}> {
  const participants = await listParticipants();

  const stats = {
    total: participants.length,
    totalResponsaveis: 0,
    comRestricoesAlimentares: 0,
    comMedicamentos: 0,
    comAlergias: 0,
    comNecessidadesEspeciais: 0,
    porIgreja: {} as Record<string, number>,
    porCidade: {} as Record<string, number>,
    porCondicoes: {} as Record<string, number>,
    porIdade: {} as Record<string, number>,
    porSexo: {} as Record<string, number>,
    nomesComAlergias: [] as string[],
    nomesComMedicamentos: [] as string[],
    nomesComRestricoesAlimentares: [] as string[],
    nomesComCondicoes: [] as string[],
  };

  for (const p of participants) {
    stats.totalResponsaveis += p.responsaveis.length;

    if (p.saude?.restricoesAlimentares?.length > 0) {
      stats.comRestricoesAlimentares++;
      stats.nomesComRestricoesAlimentares.push(p.nome);
    }
    if (p.saude?.medicamentos?.length > 0) {
      stats.comMedicamentos++;
      stats.nomesComMedicamentos.push(p.nome);
    }
    if (p.saude?.alergias?.length > 0) {
      stats.comAlergias++;
      stats.nomesComAlergias.push(p.nome);
    }
    if (p.saude?.necessidadesEspeciais) stats.comNecessidadesEspeciais++;

    const igreja = p.igreja || "Não informado";
    stats.porIgreja[igreja] = (stats.porIgreja[igreja] || 0) + 1;

    const cidade = p.cidade || "Não informado";
    stats.porCidade[cidade] = (stats.porCidade[cidade] || 0) + 1;

    if (p.sexo) {
      const sexoLabel = p.sexo === "M" ? "Masculino" : "Feminino";
      stats.porSexo[sexoLabel] = (stats.porSexo[sexoLabel] || 0) + 1;
    }

    if (p.saude?.condicoes) {
      for (const cond of p.saude.condicoes) {
        stats.porCondicoes[cond] = (stats.porCondicoes[cond] || 0) + 1;
      }
      if (p.saude.condicoes.length > 0) {
        stats.nomesComCondicoes.push(p.nome);
      }
    }

    if (p.idade !== null && p.idade !== undefined) {
      const faixa =
        p.idade < 12
          ? "0-11"
          : p.idade < 18
            ? "12-17"
            : p.idade < 30
              ? "18-29"
              : p.idade < 50
                ? "30-49"
                : "50+";
      stats.porIdade[faixa] = (stats.porIdade[faixa] || 0) + 1;
    }
  }

  return stats;
}

export { normalizeForSearch, calculateAge };
