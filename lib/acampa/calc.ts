import {
  CARNE_MONTHS,
  CASH_DISCOUNT,
  LOTS,
  PIX_DISCOUNT,
  SPOUSE_DISCOUNT,
} from "./constants";
import { FormaPagamento, Parcela, PaymentPlan } from "./types";

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

export const createCarneInstallments = (total: number): Parcela[] => {
  const months = CARNE_MONTHS.length;
  const installmentValue = round(total / months);
  const lastValue = round(total - installmentValue * (months - 1));

  return CARNE_MONTHS.map((mes, index) => ({
    mes,
    valor: index === months - 1 ? lastValue : installmentValue,
    pago: false,
  }));
};

export const getCurrentMonthInfo = (date = new Date()) => {
  const month = date.getMonth() + 1;
  return {
    month,
    monthLabel: MONTHS_BR[month - 1] ?? "julho",
  };
};

export const resolveBasePrice = ({
  loteTravado,
  month,
}: {
  loteTravado: boolean;
  month: number;
}) => {
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

export const resolveOriginalTotal = ({
  valorOriginal,
  dupla,
  quantidadeConjuges,
}: {
  valorOriginal: number;
  dupla: "nao" | "irmao" | "conjuge";
  quantidadeConjuges: number;
}) => {
  if (dupla === "nao") {
    return round(valorOriginal);
  }

  return round(valorOriginal * quantidadeConjuges);
};

export const applyDiscount = ({
  paymentPlan,
  formaPagamento,
  valorOriginal,
  dupla,
  quantidadeConjuges,
}: {
  paymentPlan: PaymentPlan;
  formaPagamento: FormaPagamento | null;
  valorOriginal: number;
  dupla: "nao" | "irmao" | "conjuge";
  quantidadeConjuges: number;
}) => {
  const total = resolveOriginalTotal({ valorOriginal, dupla, quantidadeConjuges });

  if ((dupla === "conjuge" || dupla === "irmao") && quantidadeConjuges > 0) {
    return round(total * (1 - SPOUSE_DISCOUNT));
  }

  if (paymentPlan === "carne") {
    return total;
  }

  if (paymentPlan === "credito") {
    return total;
  }

  if (formaPagamento === "dinheiro") {
    return round(total * (1 - CASH_DISCOUNT));
  }

  if (formaPagamento === "pix") {
    return round(total * (1 - PIX_DISCOUNT));
  }

  return total;
};
