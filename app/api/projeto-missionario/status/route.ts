import { NextRequest, NextResponse } from "next/server";
import { updateRegistrationStatus } from "@/lib/projeto-missionario/storage";

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json();
    const { id, status } = json;

    if (!id || !status) {
      return NextResponse.json(
        { message: "ID e status são obrigatórios." },
        { status: 400 }
      );
    }

    if (status !== "confirmado" && status !== "pendente") {
      return NextResponse.json(
        { message: "Status inválido." },
        { status: 400 }
      );
    }

    const updated = await updateRegistrationStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { message: "Inscrição não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { message: "Não foi possível atualizar o status." },
      { status: 500 }
    );
  }
}
