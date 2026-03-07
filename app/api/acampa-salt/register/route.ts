import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { ACAMPA_YEAR } from "@/lib/acampa/constants";
import {
  applyDiscount,
  createCarneInstallments,
  getCurrentMonthInfo,
  resolveBasePrice,
  resolveOriginalTotal,
} from "@/lib/acampa/calc";
import { registrationSchema } from "@/lib/acampa/schema";
import { RegistrationRecord } from "@/lib/acampa/types";
import { createPixPayload, PIBLS_PIX_KEY } from "@/lib/pix";
import { redis } from "@/lib/redis";
import { saveRegistration } from "@/lib/acampa/storage";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = registrationSchema.safeParse(json);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError =
        errors.nome?.[0] ||
        errors.telefone?.[0] ||
        errors.email?.[0] ||
        errors.quantidadeConjuges?.[0] ||
        errors.formaPagamento?.[0] ||
        "Dados invalidos.";

      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const payload = parsed.data;
    const resolvedFormaPagamento =
      payload.paymentPlan === "credito"
        ? "cartao"
        : payload.paymentPlan === "avista"
          ? (payload.formaPagamento ?? null)
          : null;
    const { month, monthLabel } = getCurrentMonthInfo();
    const base = resolveBasePrice({
      loteTravado: payload.loteTravado,
      month,
    });
    const valorOriginalTotal = resolveOriginalTotal({
      valorOriginal: base.valorOriginal,
      dupla: payload.dupla,
      quantidadeConjuges: payload.quantidadeConjuges,
    });

    const valorFinal = applyDiscount({
      paymentPlan: payload.paymentPlan,
      formaPagamento: resolvedFormaPagamento,
      valorOriginal: base.valorOriginal,
      dupla: payload.dupla,
      quantidadeConjuges: payload.quantidadeConjuges,
    });

    const parcelas =
      payload.paymentPlan === "carne" ? createCarneInstallments(valorFinal) : [];

    const id = crypto.randomUUID();
    const nextNumber = await redis.incr("acampa:inscricao:contador");
    const numeroInscricao = `ACAMPA-${ACAMPA_YEAR}-${String(nextNumber).padStart(4, "0")}`;

    const record: RegistrationRecord = {
      id,
      numeroInscricao,
      nome: payload.nome,
      idade: payload.idade,
      telefone: payload.telefone,
      email: payload.email,
      cidade: payload.cidade,
      igreja: payload.igreja,
      categoria: payload.categoria,
      dupla: payload.dupla,
      quantidadeConjuges: payload.quantidadeConjuges,
      paymentPlan: payload.paymentPlan,
      formaPagamento: resolvedFormaPagamento,
      lote: base.lote,
      loteLabel: base.loteLabel,
      loteTravado: payload.loteTravado,
      valorOriginal: valorOriginalTotal,
      valorFinal,
      parcelas,
      mesInscricao: monthLabel,
      status: valorFinal === 0 ? "isento" : "pendente_pagamento",
      createdAt: new Date().toISOString(),
    };

    await saveRegistration(record);

    let pixPayload = "";
    let pixQrCode = "";
    const pixKey = process.env.ACAMPA_PIX_KEY ?? PIBLS_PIX_KEY;

    if (
      record.paymentPlan === "avista" &&
      record.formaPagamento === "pix" &&
      record.valorFinal > 0
    ) {
      pixPayload = createPixPayload({
        pixKey,
        amount: record.valorFinal,
        merchantName: "Juventude SALT",
        merchantCity: "Lagoa Santa",
        txid: record.numeroInscricao,
        description: "Acampa SALT 2026",
      });
      pixQrCode = await QRCode.toDataURL(pixPayload, { width: 280, margin: 1 });
    }

    return NextResponse.json(
      {
        registration: record,
        payment: {
          pixKey,
          pixPayload,
          pixQrCode,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao registrar inscricao:", error);
    return NextResponse.json(
      { message: "Nao foi possivel concluir a inscricao." },
      { status: 500 },
    );
  }
}
