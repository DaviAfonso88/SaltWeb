import { z } from "zod";

const _ingredientsList = [
  "Arroz",
  "Feijão",
  "Batata",
  "Mandioca",
  "Frango",
  "Carne",
  "Linguiça",
  "Salada",
] as const;

export const observacaoOptions = [
  { value: "normal", label: "Normal" },
  { value: "nao_consigo", label: "Não consigo levar nada e nem pagar" },
] as const;

export type Observacao = (typeof observacaoOptions)[number]["value"];

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
    ingredientes: z.array(z.enum(_ingredientsList)).optional(),
    tipoContribuicao: z.enum(["alimento", "valor"]).optional(),
    valor: z
      .number()
      .min(30, { message: "Valor mínimo é R$ 30." })
      .max(500, { message: "Valor máximo é R$ 500." })
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

export const ingredientsList = [
  "Arroz",
  "Feijão",
  "Batata",
  "Mandioca",
  "Frango",
  "Carne",
  "Linguiça",
  "Salada",
] as const;

export type Ingredient = (typeof ingredientsList)[number];

export const faixaEtariaOptions = [
  { value: "12-17", label: "12 a 17 anos (Adolescente)" },
  { value: "18-35", label: "18 a 35 anos (Jovem)" },
] as const;

export type FaixaEtaria = (typeof faixaEtariaOptions)[number]["value"];

export const tipoContribuicaoOptions = [
  { value: "alimento", label: "Levar alimento" },
  { value: "valor", label: "Valor simbólico R$ 30" },
] as const;

export type TipoContribuicao = (typeof tipoContribuicaoOptions)[number]["value"];

export const tipoParticipanteOptions = [
  { value: "membro", label: "Sou membro da PIB" },
  { value: "convidado", label: "Sou convidado" },
] as const;

export type TipoParticipante = (typeof tipoParticipanteOptions)[number]["value"];