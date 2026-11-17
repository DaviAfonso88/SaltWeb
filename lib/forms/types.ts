import { z } from "zod";

export type FormModelId = "acampamento" | "festa" | "missao" | "simples";

export type Installment = { rotulo: string; valorCentavos: number; pago: boolean; pagoEm?: string };

export type PriceResult = {
  valorOriginalCentavos: number;
  valorFinalCentavos: number;
  lote?: string;
  plano?: string;
  forma?: string;
  parcelas: Installment[];
};

export type Answers = Record<string, unknown>;

export type ExportColumn = {
  key: string;
  header: string;
  value: (answers: Answers, payment: { parcelas?: Installment[]; valorFinalCentavos?: number; lote?: string } | null) => string;
};

export type SafeResult<T> = { success: true; data: T } | { success: false; error: z.ZodError };

/** Definição de um modelo de formulário, sem genéricos para poder viver em um registro único. */
export type FormModel = {
  id: FormModelId;
  label: string;
  description: string;
  requiresEmail: boolean;
  defaultConfig: () => Record<string, unknown>;
  parseConfig: (input: unknown) => SafeResult<Record<string, unknown>>;
  parseAnswers: (config: unknown, input: unknown) => SafeResult<Answers>;
  /** `today` em YYYY-MM-DD (Brasília); `now` serve para rotular parcelas. */
  price: (config: unknown, answers: Answers, today: string) => PriceResult | null;
  columns: (config: unknown) => ExportColumn[];
  /** Chaves de itens/vagas consumidos por uma inscrição (ex.: `item:Torresmo`, `vaga`). */
  consumes: (config: unknown, answers: Answers) => string[];
};

/**
 * Cria um FormModel tipado a partir de schemas Zod. Os genéricos ficam restritos a este helper;
 * `config` e `answers` chegam como `unknown` e são sempre revalidados antes do uso.
 */
export function defineModel<C extends Record<string, unknown>, A extends Answers>(def: {
  id: FormModelId;
  label: string;
  description: string;
  requiresEmail: boolean;
  configSchema: z.ZodType<C>;
  defaultConfig: () => C;
  answersSchema: (config: C) => z.ZodType<A>;
  price: (config: C, answers: A, today: string) => PriceResult | null;
  columns: (config: C) => ExportColumn[];
  consumes?: (config: C, answers: A) => string[];
}): FormModel {
  const config = (value: unknown): C => def.configSchema.parse(value);
  return {
    id: def.id,
    label: def.label,
    description: def.description,
    requiresEmail: def.requiresEmail,
    defaultConfig: def.defaultConfig,
    parseConfig: (input) => def.configSchema.safeParse(input),
    parseAnswers: (cfg, input) => def.answersSchema(config(cfg)).safeParse(input),
    price: (cfg, answers, today) => def.price(config(cfg), answers as A, today),
    columns: (cfg) => def.columns(config(cfg)),
    consumes: (cfg, answers) => def.consumes?.(config(cfg), answers as A) ?? [],
  };
}
