import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import { registrationSchema } from "@/lib/festa-roca/types";
import { RegistrationRecord } from "@/lib/festa-roca/types";
import { saveRegistration } from "@/lib/festa-roca/storage";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    const rl = await ratelimit.limit(`festa-roca:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { message: "Muitas tentativas. Aguarde um pouco e tente novamente." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = registrationSchema.safeParse(json);

if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError =
        errors.nome?.[0] ||
        errors.faixaEtaria?.[0] ||
        errors.telefone?.[0] ||
        errors.observacao?.[0] ||
        errors.ingredientes?.[0] ||
        errors.tipoContribuicao?.[0] ||
        errors.valor?.[0] ||
        errors.tipoParticipante?.[0] ||
        errors.nomeConvidadoPor?.[0] ||
        "Dados invalidos.";

      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const payload = parsed.data;
    const id = crypto.randomUUID();
    const nextNumber = await redis.incr("festa-roca:inscricao:contador");
    const numeroInscricao = `FESTA-${String(nextNumber).padStart(4, "0")}`;

    const contribuicaoEmDinheiro =
      payload.observacao === "normal" && payload.tipoContribuicao === "valor";
    const statusInicial = contribuicaoEmDinheiro ? "pendente" : "confirmado";

    const record: RegistrationRecord = {
      id,
      numeroInscricao,
      nome: payload.nome,
      faixaEtaria: payload.faixaEtaria,
      telefone: payload.telefone,
      observacao: payload.observacao,
      ingredientes: payload.observacao === "normal" ? payload.ingredientes ?? [] : null,
      tipoContribuicao: payload.observacao === "normal" ? payload.tipoContribuicao ?? null : null,
      valor:
        payload.observacao === "normal" && payload.tipoContribuicao === "valor"
          ? payload.valor ?? 30
          : null,
      tipoParticipante: payload.tipoParticipante,
      nomeConvidadoPor:
        payload.tipoParticipante === "convidado"
          ? payload.nomeConvidadoPor?.trim() ?? null
          : null,
      status: statusInicial,
      createdAt: new Date().toISOString(),
    };

    await saveRegistration(record);

    return NextResponse.json(
      { registration: record },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar inscrição:", error);
    return NextResponse.json(
      { message: "Não foi possível concluir a inscrição." },
      { status: 500 }
    );
  }
}