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

const getFirstSaturdayOfMonth = (year: number, month: number): Date => {
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = firstDay.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const firstSaturday = new Date(year, month - 1, 1 + daysUntilSaturday);
  firstSaturday.setHours(0, 0, 0, 0);
  return firstSaturday;
};

const resolveLotByMonth = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const currentDate = new Date(year, date.getMonth(), date.getDate());
  currentDate.setHours(0, 0, 0, 0);

  const firstSaturday = getFirstSaturdayOfMonth(year, currentMonth);
  
  if (currentDate < firstSaturday) {
    const lotIndex = Math.max(0, currentMonth - 3);
    return LOTS[lotIndex];
  }

  const lotIndex = Math.min(currentMonth - 1, LOTS.length - 1);
  return LOTS[lotIndex];
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
}: {
  loteTravado: boolean;
}) => {
  if (loteTravado) {
    return {
      lote: "primeiro" as const,
      loteLabel: LOTS[0].lotLabel,
      valorOriginal: LOTS[0].price,
    };
  }

  const lot = resolveLotByMonth();
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
