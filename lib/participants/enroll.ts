import { eq, sql } from "drizzle-orm";

import type { Tx } from "@/lib/db";
import { participantGuardians, participantHealth, participants } from "@/lib/db/schema";

import type { GuardianInput, HealthInput } from "./schemas";

// Módulo sem diretiva: usado dentro de transações (inscrição pública e ações do painel).

/** Próximo número sequencial do acampamento; serializa criações concorrentes no mesmo evento. */
export async function nextParticipantNumber(tx: Tx, eventId: string): Promise<number> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`participants:${eventId}`}))`);
  const [row] = await tx
    .select({ max: sql<number>`coalesce(max(${participants.number}), 0)::int` })
    .from(participants)
    .where(eq(participants.eventId, eventId));
  return (row?.max ?? 0) + 1;
}

export type EnrollInput = {
  eventId: string;
  registrationId: string;
  name: string;
  nameKey: string;
  phone: string;
  email: string | null;
  church: string | null;
  city: string | null;
  /** YYYY-MM-DD */
  birthDate: string;
  health: HealthInput;
  guardians: GuardianInput[];
};

/**
 * Cria, junto com a inscrição, o participante com a ficha de saúde e os responsáveis respondidos
 * no formulário público. Só grava (não lê) `participant_health`; a leitura continua restrita a health.ts.
 */
export async function createParticipantFromRegistration(tx: Tx, input: EnrollInput): Promise<{ id: string; number: number }> {
  const number = await nextParticipantNumber(tx, input.eventId);
  const [row] = await tx
    .insert(participants)
    .values({
      eventId: input.eventId,
      number,
      registrationId: input.registrationId,
      name: input.name,
      nameKey: input.nameKey,
      mobile: input.phone,
      email: input.email,
      church: input.church,
      city: input.city,
      birthDate: input.birthDate,
      source: "registration",
    })
    .returning({ id: participants.id });

  await tx.insert(participantHealth).values({ participantId: row.id, ...input.health });
  if (input.guardians.length) {
    await tx.insert(participantGuardians).values(input.guardians.map((g, position) => ({ ...g, participantId: row.id, position })));
  }
  return { id: row.id, number };
}
