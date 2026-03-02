import { NextRequest, NextResponse } from "next/server";

import { listRegistrations } from "@/lib/acampa/storage";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const lote = params.get("lote");
    const categoria = params.get("categoria");
    const status = params.get("status");

    const all = await listRegistrations();
    const filtered = all.filter((item) => {
      if (lote && item.lote !== lote) {
        return false;
      }
      if (categoria && item.categoria !== categoria) {
        return false;
      }
      if (status && item.status !== status) {
        return false;
      }
      return true;
    });

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Erro ao listar inscricoes do Acampa:", error);
    return NextResponse.json(
      { message: "Nao foi possivel carregar as inscricoes." },
      { status: 500 }
    );
  }
}
