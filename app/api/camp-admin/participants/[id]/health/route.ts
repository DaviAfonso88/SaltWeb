import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getParticipantById, updateParticipant } from "@/lib/participant/storage";
import { Participant } from "@/lib/participant/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getParticipantById(id);

    if (!existing) {
      return NextResponse.json(
        { error: "Participante não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updated: Participant = {
      ...existing,
      saude: {
        ...existing.saude,
        ...body,
      },
      historico: [
        ...existing.historico,
        {
          id: crypto.randomUUID(),
          campo: "informações de saúde",
          valorAnterior: JSON.stringify(existing.saude),
          valorNovo: JSON.stringify({ ...existing.saude, ...body }),
          autor: session.displayName,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    await updateParticipant(updated);

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
