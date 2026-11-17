import { and, eq, ne } from "drizzle-orm";

import { getDb, type Db, type Tx } from "@/lib/db";
import { registrations } from "@/lib/db/schema";

import { ITEM_PREFIX, SLOT_KEY, festaModel, festaConfigSchema, type FestaConfig } from "./festa";

export type FestaAvailability = {
  itens: { nome: string; categoria: "comida" | "bebida"; restante: number }[];
  vagasContribuicao: number;
};

/** Itens/vagas restantes = configurado − consumido por inscrições pendentes ou confirmadas. */
export async function getFestaAvailability(
  eventId: string,
  configInput: unknown,
  db: Db | Tx = getDb(),
): Promise<FestaAvailability> {
  const config: FestaConfig = festaConfigSchema.parse(configInput);
  const rows = await db
    .select({ answers: registrations.answers })
    .from(registrations)
    .where(and(eq(registrations.eventId, eventId), ne(registrations.status, "cancelled")));

  const used = new Map<string, number>();
  for (const row of rows) {
    for (const key of festaModel.consumes(config, row.answers)) {
      used.set(key, (used.get(key) ?? 0) + 1);
    }
  }

  return {
    itens: config.itens.map((i) => ({
      nome: i.nome,
      categoria: i.categoria,
      restante: Math.max(0, i.quantidade - (used.get(`${ITEM_PREFIX}${i.nome}`) ?? 0)),
    })),
    vagasContribuicao: Math.max(0, config.vagasContribuicao - (used.get(SLOT_KEY) ?? 0)),
  };
}
