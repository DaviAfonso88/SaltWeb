import { z } from "zod";

import { defineModel } from "./types";

export const missaoConfigSchema = z.object({
  permitirTempoIntegral: z.boolean(),
  periodos: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40).regex(/^[a-z0-9_-]+$/i, "Use só letras, números, - ou _."),
        rotulo: z.string().trim().min(1, "Informe o rótulo do período.").max(80),
      }),
    )
    .max(20)
    .refine((list) => new Set(list.map((p) => p.id)).size === list.length, "Há períodos com o mesmo identificador."),
});

export type MissaoConfig = z.infer<typeof missaoConfigSchema>;

const buildAnswersSchema = (config: MissaoConfig) => {
  const ids = new Set(config.periodos.map((p) => p.id));
  return z
    .object({
      tempoIntegral: z.boolean(),
      periodos: z.array(z.string()).max(20),
    })
    .superRefine((d, ctx) => {
      if (d.tempoIntegral && !config.permitirTempoIntegral) {
        ctx.addIssue({ code: "custom", path: ["tempoIntegral"], message: "Tempo integral não está disponível." });
      }
      if (d.periodos.some((p) => !ids.has(p))) {
        ctx.addIssue({ code: "custom", path: ["periodos"], message: "Período desconhecido." });
      }
      if (!d.tempoIntegral && d.periodos.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["tempoIntegral"],
          message: "Selecione pelo menos um período de participação.",
        });
      }
    });
};

export const missaoModel = defineModel({
  id: "missao",
  label: "Missão",
  description: "Participação em tempo integral ou em períodos escolhidos.",
  requiresEmail: false,
  configSchema: missaoConfigSchema,
  defaultConfig: () => ({ permitirTempoIntegral: true, periodos: [] }),
  answersSchema: buildAnswersSchema,
  price: () => null,
  columns: (config) => [
    {
      key: "participacao",
      header: "Participação",
      value: (a) => {
        if (a.tempoIntegral) return "Tempo integral";
        const labels = new Map(config.periodos.map((p) => [p.id, p.rotulo]));
        return (Array.isArray(a.periodos) ? a.periodos : []).map((id) => labels.get(String(id)) ?? String(id)).join(", ");
      },
    },
  ],
});
