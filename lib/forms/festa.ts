import { z } from "zod";

import { formatCurrency } from "@/lib/format";

import { defineModel } from "./types";

export const festaConfigSchema = z.object({
  valorContribuicaoCentavos: z.number().int().min(0),
  vagasContribuicao: z.number().int().min(0),
  itens: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Informe o nome do item.").max(60),
        categoria: z.enum(["comida", "bebida"]),
        quantidade: z.number().int().min(0),
      }),
    )
    .max(60)
    .refine((itens) => new Set(itens.map((i) => i.nome.toLowerCase())).size === itens.length, "Há itens com o mesmo nome."),
});

export type FestaConfig = z.infer<typeof festaConfigSchema>;

export const ITEM_PREFIX = "item:";
export const SLOT_KEY = "vaga";

const buildAnswersSchema = (config: FestaConfig) => {
  const names = new Set(config.itens.map((i) => i.nome));
  return z
    .object({
      faixaEtaria: z.enum(["12-17", "18-35"], { message: "Selecione sua faixa etária." }),
      tipoParticipante: z.enum(["membro", "convidado"], { message: "Selecione se é membro ou convidado." }),
      convidadoPor: z.string().trim().max(100).optional(),
      observacao: z.enum(["normal", "nao_consigo"], { message: "Selecione uma observação." }),
      tipoContribuicao: z.enum(["alimento", "valor"]).optional(),
      itens: z.array(z.string()).max(20).optional(),
    })
    .superRefine((d, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
      if (d.tipoParticipante === "convidado" && !d.convidadoPor) issue("convidadoPor", "Informe quem convidou.");
      if (d.observacao === "normal") {
        if (!d.tipoContribuicao) issue("tipoContribuicao", "Selecione o tipo de contribuição.");
        if (d.tipoContribuicao === "alimento") {
          if (!d.itens?.length) issue("itens", "Selecione pelo menos 1 item.");
          else if (d.itens.some((i) => !names.has(i))) issue("itens", "Item desconhecido.");
        }
      }
    })
    .transform((d) =>
      d.observacao === "nao_consigo"
        ? { ...d, tipoContribuicao: undefined, itens: undefined }
        : d.tipoContribuicao === "valor"
          ? { ...d, itens: undefined }
          : d,
    );
};

export const festaModel = defineModel({
  id: "festa",
  label: "Festa",
  description: "Contribuição em alimento (com quantidade limitada por item) ou em valor fixo (com vagas).",
  requiresEmail: false,
  configSchema: festaConfigSchema,
  defaultConfig: () => ({ valorContribuicaoCentavos: 4000, vagasContribuicao: 10, itens: [] }),
  answersSchema: buildAnswersSchema,
  price: (config, a) =>
    a.observacao === "normal" && a.tipoContribuicao === "valor"
      ? {
          valorOriginalCentavos: config.valorContribuicaoCentavos,
          valorFinalCentavos: config.valorContribuicaoCentavos,
          parcelas: [],
        }
      : null,
  columns: () => [
    { key: "faixa", header: "Faixa etária", value: (a) => String(a.faixaEtaria ?? "") },
    {
      key: "tipo",
      header: "Participante",
      value: (a) => (a.tipoParticipante === "convidado" ? `Convidado de ${a.convidadoPor ?? ""}` : "Membro"),
    },
    {
      key: "contribuicao",
      header: "Contribuição",
      value: (a, p) =>
        a.observacao === "nao_consigo"
          ? "Não consegue contribuir"
          : a.tipoContribuicao === "valor"
            ? `Valor ${p?.valorFinalCentavos != null ? formatCurrency(p.valorFinalCentavos) : ""}`.trim()
            : `Alimento: ${Array.isArray(a.itens) ? a.itens.join(", ") : ""}`,
    },
  ],
  consumes: (_config, a) => {
    if (a.observacao !== "normal") return [];
    if (a.tipoContribuicao === "valor") return [SLOT_KEY];
    return (a.itens ?? []).map((i) => `${ITEM_PREFIX}${i}`);
  },
});
