import { NextResponse } from "next/server";
import { z } from "zod";

import { getRegistrationById, updateRegistrationInstallments } from "@/lib/acampa/storage";

const updateInstallmentsSchema = z.object({
  id: z.string().uuid("ID invalido."),
  parcelas: z
    .array(
      z.object({
        mes: z.string().min(1),
        pago: z.boolean(),
      })
    )
    .min(1),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateInstallmentsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Dados invalidos para atualizar parcelas." }, { status: 400 });
    }

    const registration = await getRegistrationById(parsed.data.id);
    if (!registration) {
      return NextResponse.json({ message: "Inscricao nao encontrada." }, { status: 404 });
    }

    if (registration.paymentPlan !== "carne") {
      return NextResponse.json(
        { message: "Somente inscricoes no Carne SALT permitem validacao de parcelas." },
        { status: 400 }
      );
    }

    const byMonth = new Map(parsed.data.parcelas.map((item) => [item.mes, item.pago]));
    const nextInstallments = registration.parcelas.map((parcela) => ({
      ...parcela,
      pago: byMonth.get(parcela.mes) ?? parcela.pago,
    }));

    const updated = await updateRegistrationInstallments(parsed.data.id, nextInstallments);
    if (!updated) {
      return NextResponse.json({ message: "Falha ao atualizar parcelas." }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao validar parcelas do carne:", error);
    return NextResponse.json({ message: "Erro ao atualizar parcelas." }, { status: 500 });
  }
}
