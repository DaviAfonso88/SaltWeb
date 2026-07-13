import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getStats } from "@/lib/participant/storage";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const stats = await getStats();
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
