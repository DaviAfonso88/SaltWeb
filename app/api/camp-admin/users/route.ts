import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { createUser, deleteUser, listUsers } from "@/lib/auth/session";
type Role = "admin" | "saude" | "lider" | "recepcao";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const users = await listUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, role, displayName } = body;

    if (!username || !password || !role || !displayName) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    const validRoles: Role[] = ["admin", "saude", "lider", "recepcao"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Perfil inválido" },
        { status: 400 }
      );
    }

    const user = await createUser(username, password, role, displayName);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário já existe" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Nome de usuário é obrigatório" },
        { status: 400 }
      );
    }

    if (username === session.username) {
      return NextResponse.json(
        { error: "Não é possível excluir seu próprio usuário" },
        { status: 400 }
      );
    }

    const deleted = await deleteUser(username);
    if (!deleted) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
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
