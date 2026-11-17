import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { messages } from "@/lib/db/schema";

import type { EmailResult } from "./email";
import { describeError } from "@/lib/safe-error";

type NewMessage =
  | { kind: "contato"; nome: string; email: string; mensagem: string }
  | { kind: "servir"; nome: string; whatsapp: string; ministerio: string };

/** Grava a mensagem antes de qualquer tentativa de e-mail: o banco é a fonte de verdade. */
export async function saveMessage(data: NewMessage): Promise<string> {
  const values =
    data.kind === "contato"
      ? { kind: "contato" as const, name: data.nome, email: data.email, body: data.mensagem }
      : { kind: "servir" as const, name: data.nome, whatsapp: data.whatsapp, ministry: data.ministerio };
  const [row] = await getDb().insert(messages).values(values).returning({ id: messages.id });
  return row.id;
}

export async function markEmailResult(id: string, result: EmailResult): Promise<void> {
  try {
    await getDb()
      .update(messages)
      .set(result.ok ? { emailSentAt: new Date(), emailError: null } : { emailError: result.error })
      .where(eq(messages.id, id));
  } catch (error) {
    console.error("[mensagens] não foi possível registrar o resultado do e-mail", describeError(error));
  }
}
