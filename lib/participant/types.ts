import { z } from "zod";

const responsibleSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Nome é obrigatório"),
  grauParentesco: z.string().min(1, "Grau de parentesco é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  whatsapp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

const contatoEmergenciaSchema = z.object({
  nome: z.string(),
  parentesco: z.string().nullable().optional(),
  telefone: z.string(),
});

const healthInfoSchema = z.object({
  tipoSanguineo: z.string().nullable().optional(),
  alergias: z.array(z.string()),
  alergiaReacao: z.string().nullable().optional(),
  alergiaMedicacao: z.string().nullable().optional(),
  medicamentos: z.array(z.string()),
  condicoes: z.array(z.string()),
  condicaoEspecificacao: z.string().nullable().optional(),
  deficiencia: z.string().nullable().optional(),
  deficienciaEspecificacao: z.string().nullable().optional(),
  restricoesAlimentares: z.array(z.string()),
  restricoesFisicas: z.string().nullable().optional(),
  observacoesMedicas: z.array(z.string()),
  outraInfoSaude: z.string().nullable().optional(),
  necessidadesEspeciais: z.boolean(),
  necessidadesEspeciaisDescricao: z.string().nullable().optional(),
});

const observationSchema = z.object({
  id: z.string(),
  texto: z.string(),
  autor: z.string(),
  createdAt: z.string(),
});

const historyEntrySchema = z.object({
  id: z.string(),
  campo: z.string(),
  valorAnterior: z.string().nullable().optional(),
  valorNovo: z.string().nullable().optional(),
  autor: z.string(),
  createdAt: z.string(),
});

const attachmentSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.string(),
  tamanho: z.number(),
  url: z.string(),
  createdAt: z.string(),
});

export const participantSchema = z.object({
  id: z.string(),
  numero: z.string(),

  nome: z.string().min(1, "Nome é obrigatório"),
  nomeNormalizado: z.string(),
  sexo: z.enum(["M", "F"]).nullable().optional(),
  dataNascimento: z.string().nullable().optional(),
  idade: z.number().nullable().optional(),
  cpf: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  igreja: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),

  celular: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),

  responsaveis: z.array(responsibleSchema),

  contatoEmergencia: contatoEmergenciaSchema.optional().nullable(),

  saude: healthInfoSchema,

  declaracao: z.boolean().optional(),

  observacoes: z.array(observationSchema),

  historico: z.array(historyEntrySchema),

  anexos: z.array(attachmentSchema),

  fontes: z.array(z.string()),
  importId: z.string().nullable().optional(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Responsible = z.infer<typeof responsibleSchema>;
export type ContatoEmergencia = z.infer<typeof contatoEmergenciaSchema>;
export type HealthInfo = z.infer<typeof healthInfoSchema>;
export type Observation = z.infer<typeof observationSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type Participant = z.infer<typeof participantSchema>;

export const createParticipantInputSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  sexo: z.enum(["M", "F"]).nullable().optional(),
  dataNascimento: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  igreja: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  foto: z.string().nullable().optional(),
  celular: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  responsaveis: z.array(
    z.object({
      nome: z.string().min(1),
      grauParentesco: z.string().min(1),
      telefone: z.string().min(1),
      whatsapp: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      endereco: z.string().nullable().optional(),
      observacoes: z.string().nullable().optional(),
    })
  ),
  contatoEmergencia: z
    .object({
      nome: z.string(),
      parentesco: z.string().nullable().optional(),
      telefone: z.string(),
    })
    .optional()
    .nullable(),
  saude: healthInfoSchema,
  declaracao: z.boolean().optional(),
});

export type CreateParticipantInput = z.infer<typeof createParticipantInputSchema>;

export const updateParticipantInputSchema = createParticipantInputSchema.partial();

export type UpdateParticipantInput = z.infer<typeof updateParticipantInputSchema>;

export const importRowSchema = z.record(z.string(), z.string().nullable().optional());

export type ImportRow = z.infer<typeof importRowSchema>;
