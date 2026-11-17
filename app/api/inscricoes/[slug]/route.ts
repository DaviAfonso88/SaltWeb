import { NextResponse } from "next/server";

import { allowPublicSubmit, getClientIp } from "@/lib/auth/rate-limit";
import { submitRegistration } from "@/lib/registrations/submit";
import { describeError } from "@/lib/safe-error";

const GENERIC_ERROR = "Não foi possível enviar agora. Tente novamente em instantes.";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await allowPublicSubmit(getClientIp(request.headers)))) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto e tente de novo." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot: robôs preenchem; responde como sucesso sem gravar.
  if ((body as { website?: unknown }).website) return NextResponse.json({ ok: true });

  const { slug } = await params;
  try {
    const result = await submitRegistration(slug, body);
    if (result.ok) {
      const { numero, valorFinalCentavos, parcelas, ...resumo } = result.summary;
      return NextResponse.json({ numero, valorFinalCentavos, parcelas, resumo }, { status: 201 });
    }
    switch (result.error) {
      case "validacao":
        return NextResponse.json({ error: "Confira os campos destacados.", fieldErrors: result.fieldErrors }, { status: 400 });
      case "nao_encontrado":
        return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
      case "sem_vagas":
        return NextResponse.json(
          { error: "sem_vagas", itens: result.itens, disponibilidade: result.disponibilidade },
          { status: 409 },
        );
      default:
        return NextResponse.json({ error: result.error }, { status: 409 });
    }
  } catch (error) {
    console.error("[inscricoes] falha ao gravar", describeError(error));
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 503 });
  }
}
