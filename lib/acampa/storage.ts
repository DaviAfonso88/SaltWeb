import { redis } from "@/lib/redis";

import { Parcela, RegistrationRecord } from "./types";

const REGISTRATION_KEY_PREFIX = "acampa:inscricao:";
const IDS_LIST_KEY = "acampa:inscricoes:ids";

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
    categoria: "participante",
    quantidadeConjuges: record.quantidadeConjuges ?? 0,
    nomeDupla: record.nomeDupla ?? null,
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

export async function updateRegistrationInstallments(id: string, parcelas: Parcela[]) {
  const record = await getRegistrationById(id);
  if (!record) {
    return null;
  }

  const updated: RegistrationRecord = {
    ...record,
    parcelas,
  };

  await redis.set(`${REGISTRATION_KEY_PREFIX}${id}`, updated);
  return updated;
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
  } else {
    // Fallback para dados antigos sem indice.
    const legacyKeys = await redis.keys(`${REGISTRATION_KEY_PREFIX}*`);
    const filteredKeys = legacyKeys.filter((key) => key !== `${REGISTRATION_KEY_PREFIX}contador`);
    if (filteredKeys.length > 0) {
      const values = await redis.mget<unknown[]>(...filteredKeys);
      records = values.map(parseRecord).filter((item): item is RegistrationRecord => item !== null);
    }
  }

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
