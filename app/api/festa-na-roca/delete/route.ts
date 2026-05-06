import { NextRequest, NextResponse } from "next/server";

import { deleteRegistration as deleteRegistrationFromStorage, incrementStock, incrementMoneyVagas } from "@/lib/festa-roca/storage";

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

    if (deletedRecord.observacao === "normal") {
      if (deletedRecord.tipoContribuicao === "alimento" && deletedRecord.ingredientes) {
        for (const ingredient of deletedRecord.ingredientes) {
          await incrementStock(ingredient);
        }
      }

      if (deletedRecord.tipoContribuicao === "valor") {
        await incrementMoneyVagas();
      }
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