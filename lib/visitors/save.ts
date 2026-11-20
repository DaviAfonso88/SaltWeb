import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { visitors } from "@/lib/db/schema";
import type { EmailResult } from "@/lib/messages/email";
import { describeError } from "@/lib/safe-error";

import type { AgeGroup, HowFound, Interest } from "./options";

export type NewVisitor = {
  nome: string;
  whatsapp: string;
  grupo: AgeGroup;
  bairro?: string;
  comoConheceu?: HowFound;
  convidadoPor?: string;
  interesses: Interest[];
};

/** Grava o visitante antes de qualquer tentativa de e-mail: o banco é a fonte de verdade. */
export async function saveVisitor(data: NewVisitor): Promise<string> {
  const [row] = await getDb()
    .insert(visitors)
    .values({
      name: data.nome,
      whatsapp: data.whatsapp,
      ageGroup: data.grupo,
      neighborhood: data.bairro || null,
      howFound: data.comoConheceu ?? null,
      invitedBy: data.convidadoPor || null,
      interests: data.interesses,
      contactConsent: true,
    })
    .returning({ id: visitors.id });
  return row.id;
}

export async function markVisitorEmailResult(id: string, result: EmailResult): Promise<void> {
  try {
    await getDb()
      .update(visitors)
      .set(result.ok ? { emailSentAt: new Date(), emailError: null } : { emailError: result.error })
      .where(eq(visitors.id, id));
  } catch (error) {
    console.error("[visitantes] não foi possível registrar o resultado do e-mail", describeError(error));
  }
}
