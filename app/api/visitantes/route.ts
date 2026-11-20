import { after, NextResponse } from "next/server";
import { z } from "zod";

import { allowContactSubmit, getClientIp } from "@/lib/auth/rate-limit";
import { sendVisitorEmail } from "@/lib/messages/email";
import { describeError } from "@/lib/safe-error";
import { onlyDigits } from "@/lib/text";
import {
  AGE_GROUP_VALUES,
  ageGroupLabel,
  HOW_FOUND_VALUES,
  howFoundLabel,
  INTEREST_VALUES,
  interestLabels,
} from "@/lib/visitors/options";
import { markVisitorEmailResult, saveVisitor } from "@/lib/visitors/save";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome.").max(100),
  whatsapp: z
    .string()
    .trim()
    .max(20)
    .refine((v) => {
      const digits = onlyDigits(v).length;
      return digits >= 10 && digits <= 13;
    }, "Informe um WhatsApp com DDD."),
  grupo: z.enum(AGE_GROUP_VALUES, { message: "Escolha o seu grupo." }),
  bairro: optionalText(100),
  comoConheceu: z.enum(HOW_FOUND_VALUES).optional().catch(undefined),
  convidadoPor: optionalText(100),
  interesses: z.array(z.enum(INTEREST_VALUES)).max(INTEREST_VALUES.length).default([]),
  consentimento: z.literal(true, { message: "Precisamos da sua autorização para falar com você." }),
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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { website, nome, whatsapp, grupo, bairro, comoConheceu, convidadoPor, interesses } = parsed.data;
  if (website) return NextResponse.json({ ok: true });

  const visitor = {
    nome,
    whatsapp,
    grupo,
    bairro,
    comoConheceu,
    // "Quem convidou" só faz sentido para quem veio por convite.
    convidadoPor: comoConheceu === "amigo" ? convidadoPor : undefined,
    interesses: [...new Set(interesses)],
  };

  try {
    const id = await saveVisitor(visitor);
    // O cadastro já está salvo: o aviso por e-mail sai depois da resposta, sem fazer o visitante esperar o SMTP.
    after(async () => {
      const result = await sendVisitorEmail({
        nome: visitor.nome,
        whatsapp: visitor.whatsapp,
        grupo: ageGroupLabel(visitor.grupo),
        bairro: visitor.bairro,
        comoConheceu: visitor.comoConheceu ? howFoundLabel(visitor.comoConheceu) : undefined,
        convidadoPor: visitor.convidadoPor,
        interesses: interestLabels(visitor.interesses),
      });
      await markVisitorEmailResult(id, result);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[visitantes] falha ao gravar", describeError(error));
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente em instantes." }, { status: 503 });
  }
}
