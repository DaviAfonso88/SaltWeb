import { NextRequest, NextResponse } from "next/server";
import { deleteRegistration as deleteRegistrationFromStorage } from "@/lib/projeto-missionario/storage";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID é obrigatório." },
        { status: 400 }
      );
    }

    const deletedRecord = await deleteRegistrationFromStorage(id);

    if (!deletedRecord) {
      return NextResponse.json(
        { message: "Inscrição não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir inscrição:", error);
    return NextResponse.json(
      { message: "Não foi possível excluir a inscrição." },
      { status: 500 }
    );
  }
}
