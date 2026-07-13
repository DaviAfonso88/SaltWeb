import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { deleteAllParticipants, listParticipants, searchParticipants } from "@/lib/participant/storage";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const igreja = searchParams.get("igreja");
    const cidade = searchParams.get("cidade");
    const sexo = searchParams.get("sexo");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let participants;

    if (query) {
      participants = await searchParticipants(query);
    } else {
      participants = await listParticipants();
    }

    if (igreja) {
      participants = participants.filter(
        (p) => p.igreja?.toLowerCase() === igreja.toLowerCase()
      );
    }

    if (cidade) {
      participants = participants.filter(
        (p) => p.cidade?.toLowerCase() === cidade.toLowerCase()
      );
    }

    if (sexo) {
      participants = participants.filter((p) => p.sexo === sexo);
    }

    const total = participants.length;
    const offset = (page - 1) * limit;
    const paginatedParticipants = participants.slice(offset, offset + limit);

    return NextResponse.json({
      participants: paginatedParticipants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const count = await deleteAllParticipants();
    return NextResponse.json({ deleted: count });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
