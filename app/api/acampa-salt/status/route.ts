import { NextResponse } from "next/server";
import { z } from "zod";

import { getRegistrationById, updateRegistrationStatus } from "@/lib/acampa/storage";

const statusSchema = z.object({
  id: z.string().uuid("ID invalido."),
  status: z.enum(["isento"]),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Dados invalidos para atualizar status." }, { status: 400 });
    }

    const registration = await getRegistrationById(parsed.data.id);
    if (!registration) {
      return NextResponse.json({ message: "Inscricao nao encontrada." }, { status: 404 });
    }

    if (registration.status !== "pendente_pagamento") {
      return NextResponse.json(
        { message: "Somente inscricoes pendentes podem ser marcadas como isentas." },
        { status: 400 }
      );
    }

    const updated = await updateRegistrationStatus(parsed.data.id, parsed.data.status);
    if (!updated) {
      return NextResponse.json({ message: "Falha ao atualizar status." }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar status da inscricao:", error);
    return NextResponse.json({ message: "Erro ao atualizar status." }, { status: 500 });
  }
}
