import { NextResponse } from "next/server";
import { z } from "zod";

import { allowContactSubmit, getClientIp } from "@/lib/auth/rate-limit";
import { onlyDigits } from "@/lib/text";
import { sendServirEmail } from "@/lib/messages/email";
import { markEmailResult, saveMessage } from "@/lib/messages/save";
import { describeError } from "@/lib/safe-error";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome.").max(100),
  whatsapp: z
    .string()
    .trim()
    .max(20)
    .refine((v) => {
      const digits = onlyDigits(v).length;
      return digits >= 10 && digits <= 13;
    }, "Informe um telefone com DDD."),
  ministerio: z.string().trim().min(1, "Escolha um ministério.").max(100),
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
  if (parsed.data.website) return NextResponse.json({ ok: true });

  try {
    const id = await saveMessage({ kind: "servir", nome: parsed.data.nome, whatsapp: parsed.data.whatsapp, ministerio: parsed.data.ministerio });
    await markEmailResult(id, await sendServirEmail(parsed.data));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[servir] falha ao gravar", describeError(error));
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente em instantes." }, { status: 503 });
  }
}
