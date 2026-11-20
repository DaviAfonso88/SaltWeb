import type { Registration, RegistrationPayment } from "@/lib/db/schema";

export type Installment = RegistrationPayment["parcelas"][number];

export type PaymentKind = "pix" | "dinheiro" | "avista" | "carne" | "credito" | "unico";

export const PAYMENT_KIND_LABEL: Record<PaymentKind, string> = {
  pix: "À vista no Pix",
  dinheiro: "À vista em dinheiro",
  avista: "À vista",
  carne: "Carnê",
  credito: "Cartão de crédito",
  unico: "Valor único",
};

const KIND_ORDER: PaymentKind[] = ["pix", "dinheiro", "avista", "carne", "credito", "unico"];

export function paymentKind(payment: RegistrationPayment): PaymentKind {
  if (payment.plano === "carne") return "carne";
  if (payment.plano === "credito") return "credito";
  if (payment.plano === "avista") return payment.forma === "pix" ? "pix" : payment.forma === "dinheiro" ? "dinheiro" : "avista";
  // Festa (contribuição em valor) não tem plano.
  return "unico";
}

/**
 * Parcelas para dar baixa. Carnê e cartão gravam as parcelas na inscrição; pagamento à vista e
 * contribuição em valor não gravam nenhuma, então viram uma parcela única (gravada na primeira baixa).
 */
export function paymentInstallments(payment: RegistrationPayment | null | undefined): Installment[] {
  if (!payment || payment.valorFinalCentavos <= 0) return [];
  if (payment.parcelas.length) return payment.parcelas;
  return [{ rotulo: PAYMENT_KIND_LABEL[paymentKind(payment)].toLowerCase(), valorCentavos: payment.valorFinalCentavos, pago: false }];
}

/** `true` quando o pagamento não tem parcelas gravadas (à vista ou valor único). */
export const isSinglePayment = (payment: RegistrationPayment) => payment.parcelas.length === 0;

export type PaymentProgress = { totalCents: number; paidCents: number; installments: number; paidInstallments: number };

export function paymentProgress(payment: RegistrationPayment | null | undefined): PaymentProgress {
  const items = paymentInstallments(payment);
  let paidCents = 0;
  let paidInstallments = 0;
  for (const item of items) {
    if (!item.pago) continue;
    paidCents += item.valorCentavos;
    paidInstallments += 1;
  }
  const totalCents = items.length ? (payment?.valorFinalCentavos ?? 0) : 0;
  return { totalCents, paidCents: Math.min(paidCents, totalCents), installments: items.length, paidInstallments };
}

/** Texto curto para a lista de inscrições: "Carnê 2/6", "À vista no Pix · pago". */
export function paymentStatusLabel(payment: RegistrationPayment | null | undefined): string | null {
  const progress = paymentProgress(payment);
  if (!payment || !progress.installments) return null;
  const kind = PAYMENT_KIND_LABEL[paymentKind(payment)];
  if (progress.installments > 1) return `${kind} ${progress.paidInstallments}/${progress.installments}`;
  return `${kind} · ${progress.paidInstallments ? "pago" : "em aberto"}`;
}

export type PaymentKindTotals = {
  kind: PaymentKind;
  label: string;
  registrations: number;
  expectedCents: number;
  receivedCents: number;
};

export type EventPaymentSummary = {
  /** Soma dos valores das inscrições não canceladas. */
  expectedCents: number;
  /** Soma das parcelas marcadas como pagas nas inscrições não canceladas. */
  receivedCents: number;
  pendingCents: number;
  /** Inscrições não canceladas que têm valor a pagar. */
  registrations: number;
  settled: number;
  byKind: PaymentKindTotals[];
  /** Já pago em inscrições que depois foram canceladas (fica fora dos totais: pode ter havido reembolso). */
  cancelledPaidCents: number;
  cancelledPaidRegistrations: number;
};

export function summarizePayments(rows: Pick<Registration, "status" | "payment">[]): EventPaymentSummary {
  const summary: EventPaymentSummary = {
    expectedCents: 0,
    receivedCents: 0,
    pendingCents: 0,
    registrations: 0,
    settled: 0,
    byKind: [],
    cancelledPaidCents: 0,
    cancelledPaidRegistrations: 0,
  };
  const byKind = new Map<PaymentKind, PaymentKindTotals>();

  for (const row of rows) {
    if (!row.payment) continue;
    const progress = paymentProgress(row.payment);
    if (!progress.totalCents) continue;

    if (row.status === "cancelled") {
      if (progress.paidCents) {
        summary.cancelledPaidCents += progress.paidCents;
        summary.cancelledPaidRegistrations += 1;
      }
      continue;
    }

    summary.expectedCents += progress.totalCents;
    summary.receivedCents += progress.paidCents;
    summary.registrations += 1;
    if (progress.paidCents >= progress.totalCents) summary.settled += 1;

    const kind = paymentKind(row.payment);
    const totals = byKind.get(kind) ?? { kind, label: PAYMENT_KIND_LABEL[kind], registrations: 0, expectedCents: 0, receivedCents: 0 };
    totals.registrations += 1;
    totals.expectedCents += progress.totalCents;
    totals.receivedCents += progress.paidCents;
    byKind.set(kind, totals);
  }

  summary.pendingCents = summary.expectedCents - summary.receivedCents;
  summary.byKind = KIND_ORDER.flatMap((k) => byKind.get(k) ?? []);
  return summary;
}
