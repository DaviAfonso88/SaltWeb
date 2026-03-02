export const ACAMPA_YEAR = 2026;

export const SPECIAL_PRICES = {
  pastor_lider_ecossistema: 0,
  lideranca: 70,
  voluntario: 100,
} as const;

export const LOTS = [
  { id: "primeiro", month: 2, monthLabel: "fevereiro", lotLabel: "Primeiro Lote", price: 285 },
  { id: "segundo", month: 3, monthLabel: "marco", lotLabel: "Segundo Lote", price: 295 },
  { id: "terceiro", month: 4, monthLabel: "abril", lotLabel: "Terceiro Lote", price: 305 },
  { id: "quarto", month: 5, monthLabel: "maio", lotLabel: "Quarto Lote", price: 315 },
  { id: "quinto", month: 6, monthLabel: "junho", lotLabel: "Quinto Lote", price: 325 },
  { id: "ultimo", month: 7, monthLabel: "julho", lotLabel: "Ultimo Lote", price: 335 },
] as const;

export const CASH_DISCOUNT = 0.1;
export const PIX_DISCOUNT = 0.05;

export const CARNE_TOTAL = 285;
export const CARNE_INSTALLMENT_VALUE = 48;
export const CARNE_MONTHS = ["fevereiro", "marco", "abril", "maio", "junho", "julho"] as const;
