import {
  CARNE_INSTALLMENT_VALUE,
  CARNE_MONTHS,
  CARNE_TOTAL,
  CASH_DISCOUNT,
  LOTS,
  PIX_DISCOUNT,
  SPECIAL_PRICES,
} from "./constants";
import { Categoria, FormaPagamento, Parcela, PaymentPlan } from "./types";

const round = (value: number) => Math.round(value * 100) / 100;

const MONTHS_BR = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const resolveLotByMonth = (month: number) => {
  if (month <= 2) {
    return LOTS[0];
  }

  if (month === 3) {
    return LOTS[1];
  }

  if (month === 4) {
    return LOTS[2];
  }

  if (month === 5) {
    return LOTS[3];
  }

  if (month === 6) {
    return LOTS[4];
  }

  return LOTS[5];
};

export const createCarneInstallments = (): Parcela[] =>
  CARNE_MONTHS.map((mes) => ({
    mes,
    valor: CARNE_INSTALLMENT_VALUE,
    pago: false,
  }));

export const getCurrentMonthInfo = (date = new Date()) => {
  const month = date.getMonth() + 1;
  return {
    month,
    monthLabel: MONTHS_BR[month - 1] ?? "julho",
  };
};

export const resolveBasePrice = ({
  categoria,
  loteTravado,
  month,
  paymentPlan,
}: {
  categoria: Categoria;
  loteTravado: boolean;
  month: number;
  paymentPlan: PaymentPlan;
}) => {
  if (paymentPlan === "carne") {
    return {
      lote: "primeiro" as const,
      loteLabel: LOTS[0].lotLabel,
      valorOriginal: CARNE_TOTAL,
    };
  }

  if (categoria in SPECIAL_PRICES) {
    return {
      lote: "primeiro" as const,
      loteLabel: "Valor especial",
      valorOriginal: SPECIAL_PRICES[categoria as keyof typeof SPECIAL_PRICES],
    };
  }

  if (loteTravado) {
    return {
      lote: "primeiro" as const,
      loteLabel: LOTS[0].lotLabel,
      valorOriginal: LOTS[0].price,
    };
  }

  const lot = resolveLotByMonth(month);
  return {
    lote: lot.id,
    loteLabel: lot.lotLabel,
    valorOriginal: lot.price,
  };
};

export const applyDiscount = ({
  paymentPlan,
  formaPagamento,
  valorOriginal,
}: {
  paymentPlan: PaymentPlan;
  formaPagamento: FormaPagamento | null;
  valorOriginal: number;
}) => {
  if (paymentPlan === "carne") {
    return CARNE_TOTAL;
  }

  if (paymentPlan === "credito") {
    return round(valorOriginal);
  }

  if (formaPagamento === "dinheiro") {
    return round(valorOriginal * (1 - CASH_DISCOUNT));
  }

  if (formaPagamento === "pix") {
    return round(valorOriginal * (1 - PIX_DISCOUNT));
  }

  return round(valorOriginal);
};
