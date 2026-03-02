import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";

// Schema de validação
const registrationSchema = z.object({
  nome: z.string().trim().min(3, "Nome muito curto").max(100),
  oficinas: z.array(z.string()).min(1).max(2),
});

// Configuração do Redis e Rate Limit
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 5 inscrições por minuto por IP
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // Rate Limit para evitar spam
    const { success } = await ratelimit.limit(`oficinas_reg:${ip}`);
    if (!success) {
      return NextResponse.json(
        { message: "Muitas tentativas. Aguarde um pouco." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const result = registrationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Dados inválidos.", errors: result.error.flatten() },
        { status: 400 },
      );
    }

    const { nome, oficinas } = result.data;

    const novaInscricao = {
      id: crypto.randomUUID(),
      nome,
      oficinas,
      data: new Date().toISOString(),
      ip, // Guardamos o IP para controle interno
    };

    // Salva em uma lista no Redis chamada 'oficinas_inscricoes'
    // RPUSH adiciona ao final da lista
    await redis.rpush("oficinas_inscricoes", JSON.stringify(novaInscricao));

    return NextResponse.json(
      { message: "Inscrição realizada com sucesso!", id: novaInscricao.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao salvar no Redis:", error);
    return NextResponse.json(
      { message: "Erro interno ao processar inscrição." },
      { status: 500 },
    );
  }
}

// Opcional: Rota GET para listar
export async function GET() {
  try {
    const data = await redis.lrange("oficinas_inscricoes", 0, -1);
    // As mensagens no Redis são strings, precisamos parsear
    const list = data.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item,
    );

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { message: "Erro ao buscar dados." },
      { status: 500 },
    );
  }
}
