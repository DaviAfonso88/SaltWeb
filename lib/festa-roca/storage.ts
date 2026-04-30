import { redis } from "@/lib/redis";

import { RegistrationRecord } from "./types";

const REGISTRATION_KEY_PREFIX = "festa-roca:inscricao:";
const IDS_LIST_KEY = "festa-roca:inscricoes:ids";

const normalizeStatus = (status: unknown): RegistrationRecord["status"] => {
  if (status === "confirmado" || status === "isento") {
    return "confirmado";
  }

  return "pendente";
};

const parseRecord = (raw: unknown): RegistrationRecord | null => {
  if (!raw) {
    return null;
  }

  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Partial<RegistrationRecord>;
  if (!record.id || !record.numeroInscricao || !record.nome || !record.createdAt) {
    return null;
  }

  return {
    ...record,
    ingredientes: record.ingredientes ?? [],
    tipoContribuicao: record.tipoContribuicao ?? "alimento",
    valor: record.valor ?? null,
    observacao: record.observacao ?? null,
    tipoParticipante: record.tipoParticipante ?? "membro",
    nomeConvidadoPor: record.nomeConvidadoPor ?? null,
    status: normalizeStatus(record.status),
  } as RegistrationRecord;
};

export async function saveRegistration(record: RegistrationRecord) {
  await redis.set(`${REGISTRATION_KEY_PREFIX}${record.id}`, record);
  await redis.lpush(IDS_LIST_KEY, record.id);
}

export async function getRegistrationById(id: string) {
  const raw = await redis.get(`${REGISTRATION_KEY_PREFIX}${id}`);
  return parseRecord(raw);
}

export async function updateRegistrationStatus(
  id: string,
  status: RegistrationRecord["status"]
) {
  const record = await getRegistrationById(id);
  if (!record) {
    return null;
  }

  const updated: RegistrationRecord = {
    ...record,
    status,
  };

  await redis.set(`${REGISTRATION_KEY_PREFIX}${id}`, updated);
  return updated;
}

export async function listRegistrations() {
  const ids = await redis.lrange<string>(IDS_LIST_KEY, 0, -1);

  let records: RegistrationRecord[] = [];

  if (ids.length > 0) {
    const keys = ids.map((id) => `${REGISTRATION_KEY_PREFIX}${id}`);
    const values = await redis.mget<unknown[]>(...keys);
    records = values.map(parseRecord).filter((item): item is RegistrationRecord => item !== null);
  }

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}