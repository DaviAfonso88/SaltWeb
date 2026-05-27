import { NextResponse } from "next/server";
import { listRegistrations } from "@/lib/projeto-missionario/storage";

export async function GET() {
  try {
    const records = await listRegistrations();
    return NextResponse.json(records);
  } catch (error) {
    console.error("Erro ao listar inscrições:", error);
    return NextResponse.json(
      { message: "Não foi possível carregar as inscrições." },
      { status: 500 }
    );
  }
}
