import { z } from "zod";

import { formatCurrency } from "@/lib/format";
import { normalizeKey } from "@/lib/text";

import { defineModel, type Answers } from "./types";

export const FESTA_CATEGORIES = [
  { id: "comida", label: "Comida", plural: "Comidas" },
  { id: "bebida", label: "Bebida", plural: "Bebidas" },
  { id: "outros", label: "Outros (carvão, descartáveis…)", plural: "Outros" },
] as const;

export type FestaCategoria = (typeof FESTA_CATEGORIES)[number]["id"];

export const AGE_BANDS = [
  { id: "0-11", label: "Até 11 anos (Criança)" },
  { id: "12-17", label: "12 a 17 anos (Adolescente)" },
  { id: "18-35", label: "18 a 35 anos (Jovem)" },
  { id: "36+", label: "36 anos ou mais (Adulto)" },
] as const;

export type AgeBand = (typeof AGE_BANDS)[number]["id"];

const AGE_BAND_IDS = AGE_BANDS.map((b) => b.id) as [AgeBand, ...AgeBand[]];
/** Faixas que o formulário aceitava antes de serem configuráveis: valem para eventos antigos. */
const DEFAULT_AGE_BANDS: AgeBand[] = ["12-17", "18-35"];

export const MAX_COMPANIONS = 10;
export const MAX_UNITS = 999;

const festaFields = z.object({
  /** Mostra no formulário a opção de contribuir com pagamento. */
  aceitaValor: z.boolean().default(true),
  valorContribuicaoCentavos: z.number().int().min(0),
  vagasContribuicao: z.number().int().min(0),
  /** Cobra o valor de cada pessoa (titular e acompanhantes), e não por inscrição. */
  valorPorPessoa: z.boolean().default(false),
  faixasEtarias: z.array(z.enum(AGE_BAND_IDS)).min(1, "Marque ao menos uma faixa etária.").default(DEFAULT_AGE_BANDS),
  /** Total de pessoas no evento, contando acompanhantes; 0 = sem limite. */
  limiteParticipantes: z.number().int().min(0).max(10000).default(0),
  /** Acompanhantes por inscrição; 0 = cada pessoa faz a própria. */
  maxAcompanhantes: z.number().int().min(0).max(MAX_COMPANIONS, `No máximo ${MAX_COMPANIONS} acompanhantes.`).default(0),
  itens: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Informe o nome do item.").max(60),
        categoria: z.enum(["comida", "bebida", "outros"]),
        quantidade: z.number().int().min(0),
      }),
    )
    .max(60)
    .refine((itens) => new Set(itens.map((i) => i.nome.toLowerCase())).size === itens.length, "Há itens com o mesmo nome."),
});

// Sem pagamento e sem itens não haveria como contribuir.
export const festaConfigSchema = festaFields.refine((c) => c.aceitaValor || c.itens.length > 0, {
  message: "Cadastre ao menos um item ou mostre a opção de contribuir com pagamento.",
});

export type FestaConfig = z.infer<typeof festaConfigSchema>;

export const ITEM_PREFIX = "item:";
export const SLOT_KEY = "vaga";
export const SLOT_LABEL = "Contribuição em valor";
export const CAPACITY_LABEL = "Vagas do evento";

export type FestaAvailability = {
  itens: { nome: string; categoria: FestaCategoria; restante: number }[];
  vagasContribuicao: number;
  /** Pessoas que ainda cabem no evento; null = sem limite. */
  vagasParticipantes: number | null;
};

// ── Leitura das respostas gravadas (inclui inscrições antigas, sem quantidade nem acompanhantes) ──

export type ChosenItem = { nome: string; quantidade: number };
export type Companion = { nome: string; faixaEtaria: string };

export const wantsItems = (a: Answers) =>
  a.observacao === "normal" && (a.tipoContribuicao === "alimento" || a.tipoContribuicao === "ambos");

export const wantsValue = (a: Answers) =>
  a.observacao === "normal" && (a.tipoContribuicao === "valor" || a.tipoContribuicao === "ambos");

export function chosenItems(a: Answers): ChosenItem[] {
  if (!wantsItems(a) || !Array.isArray(a.itens)) return [];
  const quantities = (a.quantidades ?? {}) as Record<string, unknown>;
  return a.itens.map((item) => {
    const nome = String(item);
    const quantidade = Number(quantities[nome] ?? 1);
    return { nome, quantidade: Number.isInteger(quantidade) && quantidade > 0 ? quantidade : 1 };
  });
}

export const formatItem = ({ nome, quantidade }: ChosenItem) => (quantidade > 1 ? `${quantidade}× ${nome}` : nome);

export function companionsOf(a: Answers): Companion[] {
  if (!Array.isArray(a.acompanhantes)) return [];
  return (a.acompanhantes as Partial<Companion>[]).map((c) => ({ nome: String(c.nome ?? ""), faixaEtaria: String(c.faixaEtaria ?? "") }));
}

export const peopleCount = (a: Answers) => 1 + companionsOf(a).length;

/**
 * O que não cabe mais no evento para estas respostas. `held` são as respostas que a inscrição já
 * tinha (edição no painel): manter o que já era dela nunca conta como falta.
 */
export function festaShortages(availability: FestaAvailability, answers: Answers, held?: Answers): string[] {
  const missing: string[] = [];

  const people = peopleCount(answers);
  if (availability.vagasParticipantes !== null && people > availability.vagasParticipantes && people > (held ? peopleCount(held) : 0)) {
    missing.push(CAPACITY_LABEL);
  }
  if (wantsValue(answers) && availability.vagasContribuicao <= 0 && !(held && wantsValue(held))) missing.push(SLOT_LABEL);

  const before = new Map((held ? chosenItems(held) : []).map((i) => [i.nome, i.quantidade]));
  for (const { nome, quantidade } of chosenItems(answers)) {
    const restante = availability.itens.find((i) => i.nome === nome)?.restante ?? 0;
    if (quantidade > restante && quantidade > (before.get(nome) ?? 0)) missing.push(nome);
  }
  return missing;
}

const buildAnswersSchema = (config: FestaConfig) => {
  const names = new Set(config.itens.map((i) => i.nome));
  const ageBand = z.enum(config.faixasEtarias as [AgeBand, ...AgeBand[]], { message: "Selecione a faixa etária." });

  return z
    .object({
      faixaEtaria: ageBand,
      tipoParticipante: z.enum(["membro", "convidado"], { message: "Selecione se é membro ou convidado." }),
      convidadoPor: z.string().trim().max(100).optional(),
      observacao: z.enum(["normal", "nao_consigo"], { message: "Selecione uma observação." }),
      tipoContribuicao: z.enum(["alimento", "valor", "ambos"]).optional(),
      itens: z.array(z.string()).max(60).optional(),
      /** Unidades de cada item escolhido; sem entrada, vale 1. */
      quantidades: z.record(z.string(), z.number().int().min(1, "Informe a quantidade.").max(MAX_UNITS)).optional(),
      acompanhantes: z
        .array(
          z.object({
            nome: z.string().trim().min(2, "Informe o nome do acompanhante.").max(100, "Nome muito longo."),
            faixaEtaria: ageBand,
          }),
        )
        .max(config.maxAcompanhantes, config.maxAcompanhantes ? `No máximo ${config.maxAcompanhantes} acompanhante(s).` : "Este evento não aceita acompanhantes.")
        .optional(),
    })
    .superRefine((d, ctx) => {
      const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
      if (d.tipoParticipante === "convidado" && !d.convidadoPor) issue("convidadoPor", "Informe quem convidou.");
      const companions = d.acompanhantes ?? [];
      if (new Set(companions.map((c) => normalizeKey(c.nome))).size !== companions.length) {
        issue("acompanhantes", "Há acompanhantes com o mesmo nome. Use o nome completo.");
      }
      if (d.observacao === "normal") {
        if (!d.tipoContribuicao) issue("tipoContribuicao", "Selecione o tipo de contribuição.");
        else if (!config.aceitaValor && d.tipoContribuicao !== "alimento") {
          issue("tipoContribuicao", "Este evento não recebe contribuição com pagamento.");
        }
        if (d.tipoContribuicao === "alimento" || d.tipoContribuicao === "ambos") {
          if (!d.itens?.length) issue("itens", "Selecione pelo menos 1 item.");
          else if (d.itens.some((i) => !names.has(i))) issue("itens", "Item desconhecido.");
        }
      }
    })
    .transform((d) => {
      const tipo = d.observacao === "normal" ? d.tipoContribuicao : undefined;
      const itens = tipo === "alimento" || tipo === "ambos" ? [...new Set(d.itens)] : undefined;
      return {
        ...d,
        tipoContribuicao: tipo,
        itens,
        quantidades: itens ? Object.fromEntries(itens.map((nome) => [nome, d.quantidades?.[nome] ?? 1])) : undefined,
        acompanhantes: d.acompanhantes?.length ? d.acompanhantes : undefined,
      };
    });
};

export const festaModel = defineModel({
  id: "festa",
  label: "Confraternização",
  description: "Contribuição em itens (com quantidade limitada), em valor ou os dois, com acompanhantes e limite de vagas.",
  requiresEmail: false,
  configSchema: festaConfigSchema,
  defaultConfig: (): FestaConfig => ({
    aceitaValor: true,
    valorContribuicaoCentavos: 4000,
    vagasContribuicao: 10,
    valorPorPessoa: false,
    faixasEtarias: DEFAULT_AGE_BANDS,
    limiteParticipantes: 0,
    maxAcompanhantes: 0,
    itens: [],
  }),
  answersSchema: buildAnswersSchema,
  price: (config, a) => {
    if (!wantsValue(a)) return null;
    const total = config.valorContribuicaoCentavos * (config.valorPorPessoa ? peopleCount(a) : 1);
    return { valorOriginalCentavos: total, valorFinalCentavos: total, parcelas: [] };
  },
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
      value: (a, p) => {
        if (a.observacao === "nao_consigo") return "Não consegue contribuir";
        const items = chosenItems(a);
        const value = p?.valorFinalCentavos != null ? formatCurrency(p.valorFinalCentavos) : "";
        return [
          items.length ? `Itens: ${items.map(formatItem).join(", ")}` : "",
          wantsValue(a) ? `Valor ${value}`.trim() : "",
        ]
          .filter(Boolean)
          .join(" + ");
      },
    },
    {
      key: "acompanhantes",
      header: "Acompanhantes",
      value: (a) =>
        companionsOf(a)
          .map((c) => `${c.nome} (${c.faixaEtaria})`)
          .join(", "),
    },
  ],
  // Cada unidade escolhida consome uma chave: quem leva 2 de um item consome 2.
  consumes: (_config, a) => [
    ...(wantsValue(a) ? [SLOT_KEY] : []),
    ...chosenItems(a).flatMap((i) => Array<string>(i.quantidade).fill(`${ITEM_PREFIX}${i.nome}`)),
  ],
});
