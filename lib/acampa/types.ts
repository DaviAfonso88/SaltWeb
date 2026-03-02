import { z } from "zod";

import { registrationSchema } from "./schema";

export type RegistrationInput = z.input<typeof registrationSchema>;

export type LoteId =
  | "primeiro"
  | "segundo"
  | "terceiro"
  | "quarto"
  | "quinto"
  | "ultimo";

export type FormaPagamento = "pix" | "dinheiro" | "cartao";
export type PaymentPlan = "avista" | "carne" | "credito";
export type Categoria =
  | "participante"
  | "lideranca"
  | "voluntario"
  | "pastor_lider_ecossistema";

export type Parcela = {
  mes: string;
  valor: number;
  pago: boolean;
};

export type RegistrationRecord = {
  id: string;
  numeroInscricao: string;
  nome: string;
  idade: number;
  telefone: string;
  email: string;
  cidade: string;
  igreja: string;
  categoria: Categoria;
  dupla: "nao" | "irmao" | "conjuge";
  paymentPlan: PaymentPlan;
  formaPagamento: FormaPagamento | null;
  lote: LoteId;
  loteLabel: string;
  loteTravado: boolean;
  valorOriginal: number;
  valorFinal: number;
  parcelas: Parcela[];
  mesInscricao: string;
  status: "isento" | "pendente_pagamento";
  createdAt: string;
};
