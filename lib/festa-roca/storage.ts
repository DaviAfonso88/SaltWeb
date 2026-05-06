import { redis } from "@/lib/redis";

import { RegistrationRecord, foodItemsConfig, initialStock, MAX_MONEY_VAGAS, MONEY_CONTRIBUTION_VALUE, type FoodItemWithStock, type StockInfo } from "./types";

const REGISTRATION_KEY_PREFIX = "festa-roca:inscricao:";
const IDS_LIST_KEY = "festa-roca:inscricoes:ids";
const STOCK_KEY_PREFIX = "festa-roca:estoque:";
const VAGAS_KEY = "festa-roca:vagas-dinheiro";

export async function initStock() {
  for (const [item, qty] of Object.entries(initialStock)) {
    const current = await redis.get<number>(`${STOCK_KEY_PREFIX}${item}`);
    if (current === null) {
      await redis.set(`${STOCK_KEY_PREFIX}${item}`, qty);
    }
  }
  const vagas = await redis.get<number>(VAGAS_KEY);
  if (vagas === null) {
    await redis.set(VAGAS_KEY, MAX_MONEY_VAGAS);
  }
}

export async function getStock(itemName: string): Promise<number> {
  const stock = await redis.get<number>(`${STOCK_KEY_PREFIX}${itemName}`);
  return stock ?? 0;
}

export async function decrementStock(itemName: string): Promise<boolean> {
  const current = await getStock(itemName);
  if (current <= 0) return false;
  await redis.decr(`${STOCK_KEY_PREFIX}${itemName}`);
  return true;
}

export async function incrementStock(itemName: string): Promise<void> {
  await redis.incr(`${STOCK_KEY_PREFIX}${itemName}`);
}

export async function getMoneyVagas(): Promise<number> {
  const vagas = await redis.get<number>(VAGAS_KEY);
  return Math.max(vagas ?? MAX_MONEY_VAGAS, 0);
}

export async function decrementMoneyVagas(): Promise<boolean> {
  const vagas = await getMoneyVagas();
  if (vagas <= 0) return false;
  await redis.decr(VAGAS_KEY);
  return true;
}

export async function incrementMoneyVagas(): Promise<void> {
  const vagas = await getMoneyVagas();
  if (vagas < MAX_MONEY_VAGAS) {
    await redis.incr(VAGAS_KEY);
  }
}

export async function getStockInfo(): Promise<StockInfo> {
  const items = await Promise.all(
    foodItemsConfig.map(async (item) => ({
      ...item,
      stock: await getStock(item.name),
    }))
  );
  const moneyVagas = await getMoneyVagas();
  return { items, moneyVagas };
}

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

export async function deleteRegistration(id: string): Promise<RegistrationRecord | null> {
  const record = await getRegistrationById(id);
  if (!record) return null;
  
  await redis.del(`${REGISTRATION_KEY_PREFIX}${id}`);
  await redis.lrem(IDS_LIST_KEY, 1, id);
  
  return record;
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