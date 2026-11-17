import { z } from "zod";

// Configuração editável da ficha de saúde de um acampamento (guardada em `events.form_config.ficha`).
// Módulo puro: usado pelo painel (editor), pelo formulário público e pelo servidor.

export type FichaTextKey =
  | "tipoSanguineo"
  | "alergia"
  | "alergias"
  | "reacaoAlergia"
  | "medicacaoAlergia"
  | "medicamento"
  | "medicamentos"
  | "condicao"
  | "condicoes"
  | "outrasCondicoes"
  | "detalhesCondicoes"
  | "alimentar"
  | "restricoesAlimentares"
  | "deficiencia"
  | "qualDeficiencia"
  | "detalhesDeficiencia"
  | "cuidadoEspecial"
  | "detalhesCuidadoEspecial"
  | "restricaoFisica"
  | "restricoesFisicas"
  | "outrasInformacoes";

type Default = { pergunta: string; dica?: string };

/** Textos de fábrica de cada pergunta (o evento só guarda o que for diferente daqui). */
export const FICHA_TEXTOS_PADRAO: Record<FichaTextKey, Default> = {
  tipoSanguineo: { pergunta: "Tipo sanguíneo" },
  alergia: { pergunta: "Tem alguma alergia (alimento, medicamento, picada, outra)?" },
  alergias: { pergunta: "Quais alergias?", dica: "Uma por linha." },
  reacaoAlergia: { pergunta: "Qual a reação? (opcional)" },
  medicacaoAlergia: { pergunta: "Toma ou leva algum remédio para a alergia? (opcional)" },
  medicamento: { pergunta: "Usa algum medicamento de uso contínuo?" },
  medicamentos: { pergunta: "Quais medicamentos?", dica: "Uma linha por medicamento: nome, dose, horário e motivo." },
  condicao: { pergunta: "Tem alguma condição ou doença (asma, diabetes, epilepsia, ansiedade…)?" },
  condicoes: { pergunta: "Marque as que se aplicam" },
  outrasCondicoes: { pergunta: "Outras condições (opcional)", dica: "Uma por linha." },
  detalhesCondicoes: { pergunta: "Detalhes e cuidados necessários (opcional)" },
  alimentar: { pergunta: "Tem alguma restrição alimentar?" },
  restricoesAlimentares: { pergunta: "Quais restrições?", dica: "Uma por linha (ex.: sem lactose, vegetariano, intolerância a glúten)." },
  deficiencia: { pergunta: "Tem alguma deficiência?" },
  qualDeficiencia: { pergunta: "Qual deficiência?" },
  detalhesDeficiencia: { pergunta: "Detalhes (opcional)" },
  cuidadoEspecial: { pergunta: "Precisa de algum cuidado ou atenção especial durante o acampamento?" },
  detalhesCuidadoEspecial: { pergunta: "Descreva o cuidado necessário" },
  restricaoFisica: { pergunta: "Tem alguma restrição para atividades físicas?" },
  restricoesFisicas: { pergunta: "Qual restrição?" },
  outrasInformacoes: { pergunta: "Mais alguma informação de saúde que a equipe deva saber? (opcional)" },
};

export const FICHA_AVISO_PADRAO =
  "São dados sensíveis. Ficam restritos à equipe de saúde autorizada do acampamento, servem só para cuidar de você durante o evento e não são compartilhados com terceiros.";

/** Agrupamento usado no editor do painel. */
export const FICHA_GRUPOS: { titulo: string; keys: FichaTextKey[] }[] = [
  { titulo: "Tipo sanguíneo", keys: ["tipoSanguineo"] },
  { titulo: "Alergias", keys: ["alergia", "alergias", "reacaoAlergia", "medicacaoAlergia"] },
  { titulo: "Medicamentos", keys: ["medicamento", "medicamentos"] },
  { titulo: "Condições de saúde", keys: ["condicao", "condicoes", "outrasCondicoes", "detalhesCondicoes"] },
  { titulo: "Alimentação", keys: ["alimentar", "restricoesAlimentares"] },
  { titulo: "Deficiência e cuidados", keys: ["deficiencia", "qualDeficiencia", "detalhesDeficiencia", "cuidadoEspecial", "detalhesCuidadoEspecial"] },
  { titulo: "Atividades físicas", keys: ["restricaoFisica", "restricoesFisicas"] },
  { titulo: "Para finalizar", keys: ["outrasInformacoes"] },
];

const KNOWN_KEYS: ReadonlySet<string> = new Set(Object.keys(FICHA_TEXTOS_PADRAO));

export const MAX_EXTRAS = 10;

export const extraSchema = z.object({
  /** Identificador estável da pergunta (as respostas são ligadas a ele). */
  id: z.string().regex(/^[a-z0-9]{6,16}$/, "Identificador inválido."),
  tipo: z.enum(["texto", "simnao"]),
  pergunta: z.string().trim().min(3, "Escreva a pergunta (mínimo 3 caracteres).").max(200, "Use até 200 caracteres."),
  dica: z.string().trim().max(300, "Use até 300 caracteres.").optional().default(""),
  obrigatoria: z.boolean().default(false),
});
export type FichaExtra = z.infer<typeof extraSchema>;

export const fichaConfigSchema = z.object({
  /** Vazio = aviso padrão. */
  aviso: z.string().trim().max(600, "O aviso deve ter até 600 caracteres.").default(""),
  textos: z
    .record(z.string(), z.object({ pergunta: z.string().trim().max(200).optional(), dica: z.string().trim().max(300).optional() }))
    .default({})
    .refine((textos) => Object.keys(textos).every((k) => KNOWN_KEYS.has(k)), "Pergunta desconhecida na ficha."),
  extras: z
    .array(extraSchema)
    .max(MAX_EXTRAS, `No máximo ${MAX_EXTRAS} perguntas extras.`)
    .default([])
    .refine((list) => new Set(list.map((e) => e.id)).size === list.length, "Perguntas extras com identificador repetido."),
});
export type FichaConfig = z.infer<typeof fichaConfigSchema>;

export const EMPTY_FICHA: FichaConfig = { aviso: "", textos: {}, extras: [] };

/** Resolve o texto de uma pergunta: o personalizado do evento ou o padrão. */
export function fichaTexto(ficha: FichaConfig | undefined, key: FichaTextKey): { pergunta: string; dica?: string } {
  const custom = ficha?.textos[key];
  const base = FICHA_TEXTOS_PADRAO[key];
  return { pergunta: custom?.pergunta?.trim() || base.pergunta, dica: custom?.dica?.trim() || base.dica };
}

export const fichaAviso = (ficha: FichaConfig | undefined) => ficha?.aviso?.trim() || FICHA_AVISO_PADRAO;

/** Novo identificador para uma pergunta extra. */
export function newExtraId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}
