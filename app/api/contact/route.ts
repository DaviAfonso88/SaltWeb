import { NextResponse } from "next/server";
import { z } from "zod";

import { allowContactSubmit, getClientIp } from "@/lib/auth/rate-limit";
import { sendContactEmail } from "@/lib/messages/email";
import { markEmailResult, saveMessage } from "@/lib/messages/save";
import { describeError } from "@/lib/safe-error";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome.").max(100),
  email: z.string().trim().email("Informe um e-mail válido.").max(150),
  mensagem: z.string().trim().min(1, "Escreva sua mensagem.").max(2000, "Mensagem muito longa."),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  if (!(await allowContactSubmit(getClientIp(request.headers)))) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto e tente de novo." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  // Honeypot: robôs preenchem; responde como sucesso sem gravar.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  try {
    const id = await saveMessage({ kind: "contato", nome: parsed.data.nome, email: parsed.data.email, mensagem: parsed.data.mensagem });
    // A mensagem já está salva: falha de e-mail não vira erro para a pessoa.
    await markEmailResult(id, await sendContactEmail(parsed.data));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contato] falha ao gravar", describeError(error));
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente em instantes." }, { status: 503 });
  }
}
