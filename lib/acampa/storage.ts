import { redis } from "@/lib/redis";

import { Parcela, RegistrationRecord } from "./types";

const REGISTRATION_KEY_PREFIX = "acampa:inscricao:";
const IDS_LIST_KEY = "acampa:inscricoes:ids";

const normalizeStatus = (status: unknown): RegistrationRecord["status"] => {
  if (status === "pagamento_completo" || status === "isento") {
    return "pagamento_completo";
  }

  return "pendente_pagamento";
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
    categoria: "participante",
    quantidadeConjuges: record.quantidadeConjuges ?? 0,
    nomeDupla: record.nomeDupla ?? null,
    status: normalizeStatus(record.status),
  } as RegistrationRecord;
};

export async function saveRegistration(record: RegistrationRecord) {
  const tx = redis.multi();
  tx.set(`${REGISTRATION_KEY_PREFIX}${record.id}`, record);
  tx.lpush(IDS_LIST_KEY, record.id);
  await tx.exec();
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

  const allPaid = parcelas.length > 0 && parcelas.every((parcela) => parcela.pago);

  const updated: RegistrationRecord = {
    ...record,
    parcelas,
    status: allPaid ? "pagamento_completo" : "pendente_pagamento",
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
    parcelas:
      status === "pagamento_completo"
        ? record.parcelas.map((parcela) => ({ ...parcela, pago: true }))
        : record.parcelas,
  };

  await redis.set(`${REGISTRATION_KEY_PREFIX}${id}`, updated);
  return updated;
}

export async function updateRegistrationCredito(id: string, valorPagoCredito: number) {
  const record = await getRegistrationById(id);
  if (!record) {
    return null;
  }

  const isComplete = valorPagoCredito >= (record.valorFinal ?? 0);

  const updated: RegistrationRecord = {
    ...record,
    valorPagoCredito,
    status: isComplete ? "pagamento_completo" : "pendente_pagamento",
  };

  await redis.set(`${REGISTRATION_KEY_PREFIX}${id}`, updated);
  return updated;
}

export async function listRegistrations() {
  // Usa KEYS como fonte primaria para evitar IDs fantasmas na lista de indice
  const allKeys = await redis.keys(`${REGISTRATION_KEY_PREFIX}*`);
  const recordKeys = allKeys.filter((key) => key !== `${REGISTRATION_KEY_PREFIX}contador`);

  let records: RegistrationRecord[] = [];

  if (recordKeys.length > 0) {
    const values = await redis.mget<unknown[]>(...recordKeys);
    records = values.map(parseRecord).filter((item): item is RegistrationRecord => item !== null);
  }

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
