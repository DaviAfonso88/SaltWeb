import { NextResponse } from "next/server";
import { z } from "zod";

import { getRegistrationById, updateRegistrationInstallments, updateRegistrationCredito } from "@/lib/acampa/storage";

const updateCarneSchema = z.object({
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

const updateCreditoSchema = z.object({
  id: z.string().uuid("ID invalido."),
  valorPagoCredito: z.number().min(0),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const carneParsed = updateCarneSchema.safeParse(body);
    const creditoParsed = updateCreditoSchema.safeParse(body);

    if (carneParsed.success) {
      const registration = await getRegistrationById(carneParsed.data.id);
      if (!registration) {
        return NextResponse.json({ message: "Inscricao nao encontrada." }, { status: 404 });
      }

      if (registration.paymentPlan !== "carne") {
        return NextResponse.json(
          { message: "Somente inscricoes no Carne SALT permitem validacao de parcelas." },
          { status: 400 }
        );
      }

      const byMonth = new Map(carneParsed.data.parcelas.map((item) => [item.mes, item.pago]));
      const nextInstallments = registration.parcelas.map((parcela) => ({
        ...parcela,
        pago: byMonth.get(parcela.mes) ?? parcela.pago,
      }));

      const updated = await updateRegistrationInstallments(carneParsed.data.id, nextInstallments);
      if (!updated) {
        return NextResponse.json({ message: "Falha ao atualizar parcelas." }, { status: 500 });
      }

      return NextResponse.json(updated);
    }

    if (creditoParsed.success) {
      const registration = await getRegistrationById(creditoParsed.data.id);
      if (!registration) {
        return NextResponse.json({ message: "Inscricao nao encontrada." }, { status: 404 });
      }

      if (registration.paymentPlan !== "credito") {
        return NextResponse.json(
          { message: "Somente inscricoes no Cartao de Credito permitem registro de pagamento." },
          { status: 400 }
        );
      }

      const updated = await updateRegistrationCredito(creditoParsed.data.id, creditoParsed.data.valorPagoCredito);
      if (!updated) {
        return NextResponse.json({ message: "Falha ao atualizar pagamento." }, { status: 500 });
      }

      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Dados invalidos para atualizar." }, { status: 400 });
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error);
    return NextResponse.json({ message: "Erro ao atualizar pagamento." }, { status: 500 });
  }
}
