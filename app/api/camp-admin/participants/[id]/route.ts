import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import {
  calculateAge,
  deleteParticipant,
  getParticipantById,
  normalizeForSearch,
  updateParticipant,
} from "@/lib/participant/storage";
import { Participant } from "@/lib/participant/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const participant = await getParticipantById(id);

    if (!participant) {
      return NextResponse.json(
        { error: "Participante não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(participant);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

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
      ...body,
      id: existing.id,
      numero: existing.numero,
      nomeNormalizado: normalizeForSearch(body.nome || existing.nome),
      idade:
        body.dataNascimento
          ? calculateAge(body.dataNascimento)
          : body.idade !== undefined
            ? body.idade
            : existing.idade,
      responsaveis: body.responsaveis || existing.responsaveis,
      saude: body.saude || existing.saude,
      observacoes: body.observacoes || existing.observacoes,
      historico: [
        ...existing.historico,
        {
          id: crypto.randomUUID(),
          campo: "edição manual",
          valorAnterior: null,
          valorNovo: "Dados atualizados",
          autor: session.displayName,
          createdAt: new Date().toISOString(),
        },
      ],
      fontes: existing.fontes,
      importId: existing.importId,
      createdAt: existing.createdAt,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteParticipant(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Participante não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
