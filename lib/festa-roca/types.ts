import { z } from "zod";

export const MONEY_CONTRIBUTION_VALUE = 40;
export const MAX_MONEY_VAGAS = 10;

export type FoodCategory = "comida" | "bebida";
export type FoodUnit = "porção" | "unidade";

export type FoodItem = {
  name: string;
  category: FoodCategory;
  unit: FoodUnit;
};

export const foodItemsConfig: FoodItem[] = [
  { name: "Caldo de mandioca", category: "comida", unit: "porção" },
  { name: "Caldo de feijão", category: "comida", unit: "porção" },
  { name: "Pipoca salgada", category: "comida", unit: "porção" },
  { name: "Milho cozido", category: "comida", unit: "porção" },
  { name: "Pão de queijo", category: "comida", unit: "porção" },
  { name: "Cuscuz", category: "comida", unit: "porção" },
  { name: "Torresmo", category: "comida", unit: "porção" },
  { name: "Molho de cachorro quente", category: "comida", unit: "porção" },
  { name: "Pão de cachorro quente", category: "comida", unit: "porção" },
  { name: "Canjica doce", category: "comida", unit: "porção" },
  { name: "Pipoca Doce", category: "comida", unit: "porção" },
  { name: "Mingau de milho", category: "comida", unit: "porção" },
  { name: "Broa", category: "comida", unit: "porção" },
  { name: "Bolo de milho", category: "comida", unit: "porção" },
  { name: "Paçoca", category: "comida", unit: "porção" },
  { name: "Maçã do amor", category: "comida", unit: "porção" },
  { name: "Arroz doce", category: "comida", unit: "porção" },
  { name: "Pé de moleque", category: "comida", unit: "porção" },
  { name: "Pé de moça", category: "comida", unit: "porção" },
  { name: "Doce de leite", category: "comida", unit: "porção" },
  { name: "Marshmallow para fogueira", category: "comida", unit: "porção" },
];

export const initialStock: Record<string, number> = {
  "Caldo de mandioca": 1,
  "Caldo de feijão": 1,
  "Pipoca salgada": 1,
  "Milho cozido": 1,
  "Pão de queijo": 1,
  "Cuscuz": 1,
  "Torresmo": 1,
  "Molho de cachorro quente": 1,
  "Pão de cachorro quente": 1,
  "Canjica doce": 1,
  "Pipoca Doce": 1,
  "Mingau de milho": 1,
  "Broa": 1,
  "Bolo de milho": 1,
  "Paçoca": 1,
  "Maçã do amor": 1,
  "Arroz doce": 1,
  "Pé de moleque": 1,
  "Pé de moça": 1,
  "Doce de leite": 1,
  "Marshmallow para fogueira": 1,
};

export type FoodItemWithStock = FoodItem & { stock: number };

export type StockInfo = {
  items: FoodItemWithStock[];
  moneyVagas: number;
};

export const observacaoOptions = [
  { value: "normal", label: "Normal" },
  { value: "nao_consigo", label: "Não consigo levar nada e nem pagar" },
] as const;

export type Observacao = (typeof observacaoOptions)[number]["value"];

const foodNames = foodItemsConfig.map((item) => item.name) as [string, ...string[]];

export const registrationSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome é obrigatório.").max(100),
    faixaEtaria: z.enum(["12-17", "18-35"], { message: "Selecione sua faixa etária." }),
    telefone: z
      .string()
      .trim()
      .min(1, "Telefone é obrigatório.")
      .max(20, "Telefone muito longo.")
      .regex(/^[\d\s\-\(\)\+]+$/, { message: "Telefone inválido." }),
    observacao: z.enum(["normal", "nao_consigo"], { message: "Selecione uma observação." }),
    ingredientes: z.array(z.enum(foodNames)).optional(),
    tipoContribuicao: z.enum(["alimento", "valor"]).optional(),
    valor: z
      .number()
      .min(MONEY_CONTRIBUTION_VALUE, { message: `Valor mínimo é R$ ${MONEY_CONTRIBUTION_VALUE}.` })
      .max(MONEY_CONTRIBUTION_VALUE, { message: `Valor máximo é R$ ${MONEY_CONTRIBUTION_VALUE}.` })
      .optional(),
    tipoParticipante: z.enum(["membro", "convidado"], { message: "Selecione se é membro ou convidado." }),
    nomeConvidadoPor: z.string().trim().max(100).optional(),
  })
  .refine(
    (data) => {
      if (data.observacao === "normal" && !data.tipoContribuicao) {
        return false;
      }
      return true;
    },
    { message: "Selecione o tipo de contribuição.", path: ["tipoContribuicao"] }
  )
  .refine(
    (data) => {
      if (data.observacao === "normal" && data.tipoContribuicao === "valor" && !data.valor) {
        return false;
      }
      return true;
    },
    { message: "Valor é obrigatório.", path: ["valor"] }
  )
  .refine(
    (data) => {
      if (
        data.observacao === "normal" &&
        data.tipoContribuicao === "alimento" &&
        (!data.ingredientes || data.ingredientes.length === 0)
      ) {
        return false;
      }
      return true;
    },
    { message: "Selecione pelo menos 1 ingrediente.", path: ["ingredientes"] }
  )
  .refine(
    (data) => {
      if (data.tipoParticipante === "convidado" && !data.nomeConvidadoPor) {
        return false;
      }
      return true;
    },
    { message: "Nome de quem convidou é obrigatório.", path: ["nomeConvidadoPor"] }
  );

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationOutput = z.output<typeof registrationSchema>;

export type RegistrationRecord = {
  id: string;
  numeroInscricao: string;
  nome: string;
  faixaEtaria: string;
  telefone: string;
  ingredientes: string[] | null;
  tipoContribuicao: "alimento" | "valor" | null;
  valor: number | null;
  observacao: string | null;
  tipoParticipante: "membro" | "convidado";
  nomeConvidadoPor: string | null;
  status: "confirmado" | "pendente";
  createdAt: string;
};

export const faixaEtariaOptions = [
  { value: "12-17", label: "12 a 17 anos (Adolescente)" },
  { value: "18-35", label: "18 a 35 anos (Jovem)" },
] as const;

export type FaixaEtaria = (typeof faixaEtariaOptions)[number]["value"];

export const tipoContribuicaoOptions = [
  { value: "alimento", label: "Levar alimento" },
  { value: "valor", label: `Valor simbólico R$ ${MONEY_CONTRIBUTION_VALUE}` },
] as const;

export type TipoContribuicao = (typeof tipoContribuicaoOptions)[number]["value"];

export const tipoParticipanteOptions = [
  { value: "membro", label: "Sou membro da PIB" },
  { value: "convidado", label: "Sou convidado" },
] as const;

export type TipoParticipante = (typeof tipoParticipanteOptions)[number]["value"];