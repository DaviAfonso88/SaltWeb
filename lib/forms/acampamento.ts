import { z } from "zod";

import { calculateAge, formatCurrency, todayInSaoPaulo } from "@/lib/format";

import { EMPTY_FICHA, fichaConfigSchema } from "./ficha-config";
import { defineModel, type Installment } from "./types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const acampamentoConfigSchema = z.object({
  lotes: z
    .array(
      z.object({
        rotulo: z.string().trim().min(1, "Informe o nome do lote.").max(40),
        valorCentavos: z.number().int().positive("O valor deve ser maior que zero."),
        validoAte: z.string().regex(DATE, "Data inválida."),
      }),
    )
    .min(1, "Cadastre ao menos um lote.")
    .max(12)
    .refine(
      (lotes) => lotes.every((l, i) => i === 0 || l.validoAte > lotes[i - 1].validoAte),
      "As datas limite dos lotes devem ser crescentes.",
    ),
  descontoDuplaPct: z.number().min(0).max(100),
  descontoPixPct: z.number().min(0).max(100),
  descontoDinheiroPct: z.number().min(0).max(100),
  parcelasCarne: z.number().int().min(0).max(12),
  permitirCredito: z.boolean(),
  /** Parcelas no cartão (1 = à vista no cartão). Eventos antigos, sem o campo, usam 1. */
  parcelasCredito: z.number().int().min(1).max(12).default(1),
  // Ficha de saúde editável por evento; eventos antigos (sem `ficha`) usam os textos padrão.
  ficha: fichaConfigSchema.prefault({}),
});

export type AcampamentoConfig = z.infer<typeof acampamentoConfigSchema>;

/** Idade mínima aceita na inscrição. */
const MIN_AGE = 10;

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function currentLot(config: AcampamentoConfig, today: string) {
  return config.lotes.find((l) => l.validoAte >= today) ?? config.lotes[config.lotes.length - 1];
}

export function buildInstallments(total: number, count: number, today: string): Installment[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const [year, month] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const m = (month - 1 + i) % 12;
    const y = year + Math.floor((month - 1 + i) / 12);
    return {
      rotulo: `${MONTHS[m]}/${y}`,
      valorCentavos: i === count - 1 ? total - base * (count - 1) : base,
      pago: false,
    };
  });
}

/** Parcelas do cartão de crédito, para o painel dar baixa: "cartão de crédito" (1x) ou "cartão 1/3", "cartão 2/3"… */
export function buildCreditInstallments(total: number, count: number): Installment[] {
  const n = Math.max(1, count);
  const base = Math.floor(total / n);
  return Array.from({ length: n }, (_, i) => ({
    rotulo: n === 1 ? "cartão de crédito" : `cartão ${i + 1}/${n}`,
    valorCentavos: i === n - 1 ? total - base * (n - 1) : base,
    pago: false,
  }));
}

const buildAnswersSchema = (config: AcampamentoConfig) =>
  z
    .object({
      // A idade é calculada no servidor a partir da data de nascimento (que não fica nas respostas).
      dataNascimento: z.string().regex(DATE, "Informe a data de nascimento."),
      igreja: z.string().trim().min(2, "Informe a igreja.").max(100),
      cidade: z.string().trim().min(2, "Informe a cidade.").max(100),
      dupla: z.enum(["nao", "irmao", "conjuge"]),
      nomeDupla: z.string().trim().max(100).optional(),
      quantidadePessoas: z.number().int().min(1).max(20),
      plano: z.enum(["avista", "carne", "credito"]),
      formaPagamento: z.enum(["pix", "dinheiro", "cartao"]).optional(),
    })
    .superRefine((data, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

      const born = new Date(`${data.dataNascimento}T00:00:00Z`);
      if (Number.isNaN(born.getTime()) || born.toISOString().slice(0, 10) !== data.dataNascimento || data.dataNascimento > todayInSaoPaulo()) {
        issue("dataNascimento", "Data de nascimento inválida.");
      } else {
        const age = calculateAge(data.dataNascimento);
        if (age < MIN_AGE || age > 99) issue("dataNascimento", age < MIN_AGE ? `A idade mínima é ${MIN_AGE} anos.` : "Data de nascimento inválida.");
      }

      if (data.dupla === "nao") {
        if (data.quantidadePessoas !== 1) issue("quantidadePessoas", "Inscrição individual é para 1 pessoa.");
        if (data.nomeDupla) issue("nomeDupla", "Nome da dupla só pode ser informado com dupla.");
      } else {
        if (data.quantidadePessoas < 2) issue("quantidadePessoas", "Inscrição em dupla exige no mínimo 2 pessoas.");
        if (!data.nomeDupla) issue("nomeDupla", `Informe o nome do ${data.dupla === "irmao" ? "irmão" : "cônjuge"}.`);
      }

      if (data.plano === "avista" && !(data.formaPagamento === "pix" || data.formaPagamento === "dinheiro")) {
        issue("formaPagamento", "Selecione Pix ou dinheiro para pagamento à vista.");
      }
      if (data.plano === "credito") {
        if (!config.permitirCredito) issue("plano", "Pagamento no crédito não está disponível.");
        if (data.formaPagamento !== "cartao") issue("formaPagamento", "No crédito, a forma de pagamento é cartão.");
      }
      if (data.plano === "carne") {
        if (config.parcelasCarne <= 0) issue("plano", "Carnê não está disponível.");
        if (data.formaPagamento) issue("formaPagamento", "Carnê não tem forma de pagamento à vista.");
      }
    })
    .transform((data) => ({ ...data, idade: calculateAge(data.dataNascimento) }));

export const acampamentoModel = defineModel({
  id: "acampamento",
  label: "Acampamento",
  description: "Lotes por data, inscrição em dupla, descontos e pagamento à vista, carnê ou crédito.",
  requiresEmail: true,
  configSchema: acampamentoConfigSchema,
  defaultConfig: () => ({
    lotes: [{ rotulo: "Primeiro Lote", valorCentavos: 30000, validoAte: "2026-12-31" }],
    descontoDuplaPct: 15,
    descontoPixPct: 5,
    descontoDinheiroPct: 10,
    parcelasCarne: 6,
    permitirCredito: true,
    parcelasCredito: 1,
    ficha: EMPTY_FICHA,
  }),
  answersSchema: buildAnswersSchema,
  price: (config, a, today) => {
    const lot = currentLot(config, today);
    const original = lot.valorCentavos * a.quantidadePessoas;

    let discountPct = 0;
    if (a.dupla !== "nao") discountPct = config.descontoDuplaPct;
    else if (a.plano === "avista" && a.formaPagamento === "dinheiro") discountPct = config.descontoDinheiroPct;
    else if (a.plano === "avista" && a.formaPagamento === "pix") discountPct = config.descontoPixPct;

    const final = Math.round(original * (1 - discountPct / 100));
    return {
      lote: lot.rotulo,
      valorOriginalCentavos: original,
      valorFinalCentavos: final,
      plano: a.plano,
      forma: a.formaPagamento,
      parcelas:
        a.plano === "carne"
          ? buildInstallments(final, config.parcelasCarne, today)
          : a.plano === "credito"
            ? buildCreditInstallments(final, config.parcelasCredito)
            : [],
    };
  },
  columns: () => [
    { key: "idade", header: "Idade", value: (a) => String(a.idade ?? "") },
    { key: "igreja", header: "Igreja", value: (a) => String(a.igreja ?? "") },
    { key: "cidade", header: "Cidade", value: (a) => String(a.cidade ?? "") },
    { key: "dupla", header: "Dupla", value: (a) => (a.dupla === "nao" ? "Não" : `${a.dupla === "irmao" ? "Irmão" : "Cônjuge"}: ${a.nomeDupla ?? ""}`) },
    { key: "pessoas", header: "Pessoas", value: (a) => String(a.quantidadePessoas ?? 1) },
    { key: "plano", header: "Plano", value: (a) => `${a.plano ?? ""}${a.formaPagamento ? ` (${a.formaPagamento})` : ""}` },
    { key: "lote", header: "Lote", value: (_a, p) => p?.lote ?? "" },
    { key: "valor", header: "Valor", value: (_a, p) => (p?.valorFinalCentavos != null ? formatCurrency(p.valorFinalCentavos) : "") },
    {
      key: "parcelas",
      header: "Parcelas pagas",
      value: (_a, p) => (p?.parcelas?.length ? `${p.parcelas.filter((i) => i.pago).length}/${p.parcelas.length}` : ""),
    },
  ],
});
