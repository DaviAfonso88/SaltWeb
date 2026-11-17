import { z } from "zod";

import { defineModel } from "./types";

export const simplesModel = defineModel({
  id: "simples",
  label: "Simples",
  description: "Nome, telefone, e-mail e uma observação opcional.",
  requiresEmail: true,
  configSchema: z.object({}),
  defaultConfig: () => ({}),
  answersSchema: () => z.object({ observacao: z.string().trim().max(500).optional() }),
  price: () => null,
  columns: () => [{ key: "obs", header: "Observação", value: (a) => String(a.observacao ?? "") }],
});
