import { redis } from "@/lib/redis";
import { ParticipationRecord } from "./types";

const REGISTRATION_KEY_PREFIX = "projeto-missionario:inscricao:";
const IDS_LIST_KEY = "projeto-missionario:inscricoes:ids";

const normalizeStatus = (status: unknown): ParticipationRecord["status"] => {
  if (status === "confirmado") return "confirmado";
  return "pendente";
};

const parseRecord = (raw: unknown): ParticipationRecord | null => {
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

  const record = value as Partial<ParticipationRecord>;
  if (!record.id || !record.numeroInscricao || !record.nome || !record.createdAt) return null;

  return {
    ...record,
    tempoIntegral: record.tempoIntegral ?? false,
    parcial: record.parcial ?? {
      sextaNoite: false,
      sabadoManha: false,
      sabadoTarde: false,
      sabadoNoite: false,
      domingoTarde: false,
    },
    interesseCamisa: record.interesseCamisa ?? false,
    tamanhoCamisa: record.tamanhoCamisa ?? undefined,
    formaPagamentoCamisa: record.formaPagamentoCamisa ?? undefined,
    status: normalizeStatus(record.status),
  } as ParticipationRecord;
};

export async function saveRegistration(record: ParticipationRecord) {
  await redis.set(`${REGISTRATION_KEY_PREFIX}${record.id}`, record);
  await redis.lpush(IDS_LIST_KEY, record.id);
}

export async function getRegistrationById(id: string) {
  const raw = await redis.get(`${REGISTRATION_KEY_PREFIX}${id}`);
  return parseRecord(raw);
}

export async function deleteRegistration(id: string): Promise<ParticipationRecord | null> {
  const record = await getRegistrationById(id);
  if (!record) return null;

  await redis.del(`${REGISTRATION_KEY_PREFIX}${id}`);
  await redis.lrem(IDS_LIST_KEY, 1, id);

  return record;
}

export async function updateRegistrationStatus(id: string, status: ParticipationRecord["status"]) {
  const record = await getRegistrationById(id);
  if (!record) return null;

  const updated: ParticipationRecord = {
    ...record,
    status,
  };

  await redis.set(`${REGISTRATION_KEY_PREFIX}${id}`, updated);
  return updated;
}

export async function listRegistrations() {
  const ids = await redis.lrange<string>(IDS_LIST_KEY, 0, -1);

  let records: ParticipationRecord[] = [];

  if (ids.length > 0) {
    const keys = ids.map((id) => `${REGISTRATION_KEY_PREFIX}${id}`);
    const values = await redis.mget<unknown[]>(...keys);
    records = values.map(parseRecord).filter((item): item is ParticipationRecord => item !== null);
  }

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
