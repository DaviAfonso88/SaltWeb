import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { getParticipantById, updateParticipant } from "@/lib/participant/storage";
import { Participant } from "@/lib/participant/types";

export async function POST(
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
    const { texto } = body;

    if (!texto || !texto.trim()) {
      return NextResponse.json(
        { error: "Texto da observação é obrigatório" },
        { status: 400 }
      );
    }

    const newObservation = {
      id: crypto.randomUUID(),
      texto: texto.trim(),
      autor: session.displayName,
      createdAt: new Date().toISOString(),
    };

    const updated: Participant = {
      ...existing,
      observacoes: [...existing.observacoes, newObservation],
      updatedAt: new Date().toISOString(),
    };

    await updateParticipant(updated);

    return NextResponse.json(newObservation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
