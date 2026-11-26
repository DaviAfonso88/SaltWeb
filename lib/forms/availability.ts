import { and, eq, ne } from "drizzle-orm";

import { getDb, type Db, type Tx } from "@/lib/db";
import { registrations } from "@/lib/db/schema";

import { ITEM_PREFIX, SLOT_KEY, festaModel, festaConfigSchema, peopleCount, type FestaAvailability, type FestaConfig } from "./festa";

export type { FestaAvailability };

/**
 * Itens/vagas restantes = configurado − consumido por inscrições pendentes ou confirmadas.
 * `excludeId` deixa de fora a inscrição que está sendo editada.
 */
export async function getFestaAvailability(
  eventId: string,
  configInput: unknown,
  db: Db | Tx = getDb(),
  excludeId?: string,
): Promise<FestaAvailability> {
  const config: FestaConfig = festaConfigSchema.parse(configInput);
  const rows = await db
    .select({ answers: registrations.answers })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        ne(registrations.status, "cancelled"),
        excludeId ? ne(registrations.id, excludeId) : undefined,
      ),
    );

  const used = new Map<string, number>();
  let people = 0;
  for (const row of rows) {
    people += peopleCount(row.answers);
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
    vagasParticipantes: config.limiteParticipantes ? Math.max(0, config.limiteParticipantes - people) : null,
  };
}
