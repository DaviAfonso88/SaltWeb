import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { participationSchema, ParticipationRecord } from "@/lib/projeto-missionario/types";
import { saveRegistration } from "@/lib/projeto-missionario/storage";

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

    const rl = await ratelimit.limit(`projeto-missionario:${ip}`);
    if (!rl.success) {
      return NextResponse.json(
        { message: "Muitas tentativas. Aguarde um pouco e tente novamente." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = participationSchema.safeParse(json);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError =
        errors.nome?.[0] ||
        errors.telefone?.[0] ||
        errors.interesseCamisa?.[0] ||
        errors.tempoIntegral?.[0] ||
        "Dados inválidos.";

      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const payload = parsed.data;

    const id = crypto.randomUUID();
    const nextNumber = await redis.incr("projeto-missionario:inscricao:contador");
    const numeroInscricao = `MISS-${String(nextNumber).padStart(4, "0")}`;

    const record: ParticipationRecord = {
      id,
      numeroInscricao,
      nome: payload.nome,
      telefone: payload.telefone,
      tempoIntegral: payload.tempoIntegral,
      parcial: { ...payload.parcial },
      interesseCamisa: payload.interesseCamisa,
      tamanhoCamisa: payload.interesseCamisa ? payload.tamanhoCamisa : undefined,
      formaPagamentoCamisa: payload.interesseCamisa ? payload.formaPagamentoCamisa : undefined,
      status: "confirmado",
      createdAt: new Date().toISOString(),
    };

    await saveRegistration(record);

    return NextResponse.json({ registration: record }, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar inscrição:", error);
    return NextResponse.json(
      { message: "Não foi possível concluir a inscrição." },
      { status: 500 }
    );
  }
}
