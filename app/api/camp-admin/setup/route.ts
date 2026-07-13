import { NextRequest, NextResponse } from "next/server";

import { createUser, listUsers } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const existingUsers = await listUsers();
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Já existem usuários cadastrados. Use a rota de usuários para gerenciar." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password, displayName } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    const user = await createUser(username, password, "admin", displayName || username);
    if (!user) {
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuário admin criado! Agora faça login em /login",
      user: {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
