import { z } from "zod";

export const EVENT_FULL_DATE = "12 a 14 de Junho de 2026";

export const parcialOptions = [
  { value: "sextaNoite", label: "Sexta à noite (12/06)" },
  { value: "sabadoManha", label: "Sábado manhã (13/06)" },
  { value: "sabadoTarde", label: "Sábado tarde (13/06)" },
  { value: "sabadoNoite", label: "Sábado noite (13/06)" },
  { value: "domingoTarde", label: "Domingo tarde (14/06)" },
] as const;

export type ParcialPeriod = (typeof parcialOptions)[number]["value"];

export const participationSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório.")
      .max(100, "Máximo de 100 caracteres."),
    telefone: z
      .string()
      .trim()
      .min(1, "Telefone é obrigatório.")
      .max(20, "Telefone muito longo.")
      .regex(/^[\d\s\-\(\)\+]+$/, { message: "Telefone inválido." }),
    tempoIntegral: z.boolean().default(false),
    parcial: z.object({
      sextaNoite: z.boolean().default(false),
      sabadoManha: z.boolean().default(false),
      sabadoTarde: z.boolean().default(false),
      sabadoNoite: z.boolean().default(false),
      domingoTarde: z.boolean().default(false),
    }),
  })
  .refine(
    (data) => {
      const hasParcial = Object.values(data.parcial).some(Boolean);
      return data.tempoIntegral || hasParcial;
    },
    {
      message: "Selecione pelo menos um período de participação.",
      path: ["tempoIntegral"],
    },
  );

export type ParticipationInput = z.input<typeof participationSchema>;
export type ParticipationOutput = z.output<typeof participationSchema>;

export type ParticipationRecord = {
  id: string;
  numeroInscricao: string;
  nome: string;
  telefone: string;
  tempoIntegral: boolean;
  parcial: {
    sextaNoite: boolean;
    sabadoManha: boolean;
    sabadoTarde: boolean;
    sabadoNoite: boolean;
    domingoTarde: boolean;
  };
  interesseCamisa: boolean;
  tamanhoCamisa?: string;
  formaPagamentoCamisa?: string;
  status: "confirmado" | "pendente";
  createdAt: string;
};
