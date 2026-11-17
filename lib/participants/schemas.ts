import { z } from "zod";

import { onlyDigits } from "@/lib/text";

/** Texto opcional: vazio vira null. */
const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, `Use até ${max} caracteres.`)
    .nullish()
    .transform((v) => (v ? v : null));

const requiredText = (label: string, max = 200) =>
  z.string().trim().min(1, `Informe ${label}.`).max(max, `Use até ${max} caracteres.`);

const optionalPhone = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || (onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13), "Telefone inválido (use DDD + número).");

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido.");

const optionalCpf = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? onlyDigits(v) : null))
  .refine((v) => v === null || v.length === 11, "CPF deve ter 11 dígitos.");

const optionalDate = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => {
    if (v === null) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(v) && v >= "1900-01-01" && d.getTime() <= Date.now();
  }, "Data de nascimento inválida.");

/** Lista de textos curtos, sem vazios nem repetidos. */
const stringList = (max = 200) =>
  z
    .array(z.string().trim().min(1).max(max))
    .max(50)
    .default([])
    .transform((list) => [...new Set(list)]);

export const participantSchema = z.object({
  name: requiredText("o nome", 160),
  sex: z.enum(["M", "F"]).nullish().transform((v) => v ?? null),
  birthDate: optionalDate,
  cpf: optionalCpf,
  rg: optionalText(30),
  church: optionalText(160),
  city: optionalText(120),
  address: optionalText(300),
  mobile: optionalPhone,
  whatsapp: optionalPhone,
  email: optionalEmail,
  authorizationDeclared: z.boolean().default(false),
});
export type ParticipantInput = z.infer<typeof participantSchema>;

export const guardianSchema = z.object({
  name: requiredText("o nome do responsável", 160),
  relationship: requiredText("o grau de parentesco", 60),
  phone: z
    .string()
    .trim()
    .min(1, "Informe o telefone do responsável.")
    .refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13, "Telefone inválido (use DDD + número)."),
  whatsapp: optionalPhone,
  email: optionalEmail,
  address: optionalText(300),
  notes: optionalText(500),
});
export type GuardianInput = z.infer<typeof guardianSchema>;

export const guardiansSchema = z.array(guardianSchema).max(6, "No máximo 6 responsáveis.");

/** Mesmo formato guardado em `participants.emergency_contact` (EmergencyContact). */
export const emergencyContactSchema = z
  .object({
    nome: requiredText("o nome do contato", 160),
    parentesco: optionalText(60),
    telefone: z
      .string()
      .trim()
      .min(1, "Informe o telefone do contato.")
      .refine((v) => onlyDigits(v).length >= 10 && onlyDigits(v).length <= 13, "Telefone inválido (use DDD + número)."),
  })
  .nullable();
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;

export const healthSchema = z.object({
  bloodType: optionalText(5),
  allergies: stringList(),
  allergyReaction: optionalText(500),
  allergyMedication: optionalText(300),
  medications: stringList(300),
  conditions: stringList(80),
  conditionDetails: optionalText(1000),
  disability: optionalText(200),
  disabilityDetails: optionalText(1000),
  dietaryRestrictions: stringList(),
  physicalRestrictions: optionalText(500),
  medicalNotes: stringList(500),
  otherHealthInfo: optionalText(1000),
  specialNeeds: z.boolean().default(false),
  specialNeedsDetails: optionalText(1000),
  /** Perguntas extras configuradas no evento (a pergunta é copiada no momento da resposta). */
  extraAnswers: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40),
        pergunta: z.string().trim().min(1).max(300),
        tipo: z.enum(["texto", "simnao"]),
        resposta: z.string().trim().max(1000),
      }),
    )
    .max(10)
    .default([]),
});
export type HealthInput = z.infer<typeof healthSchema>;

export const noteSchema = z.object({ body: z.string().trim().min(1, "Escreva a observação.").max(2000, "Use até 2000 caracteres.") });

/** Rótulos legíveis dos campos, usados no histórico de alterações. */
export const PARTICIPANT_FIELD_LABELS: Record<keyof ParticipantInput, string> = {
  name: "Nome",
  sex: "Sexo",
  birthDate: "Data de nascimento",
  cpf: "CPF",
  rg: "RG",
  church: "Igreja",
  city: "Cidade",
  address: "Endereço",
  mobile: "Celular",
  whatsapp: "WhatsApp",
  email: "E-mail",
  authorizationDeclared: "Declaração de autorização",
};

export const HEALTH_FIELD_LABELS: Record<keyof HealthInput, string> = {
  bloodType: "Tipo sanguíneo",
  allergies: "Alergias",
  allergyReaction: "Reação às alergias",
  allergyMedication: "Medicação para alergia",
  medications: "Medicamentos",
  conditions: "Condições de saúde",
  conditionDetails: "Detalhes das condições",
  disability: "Deficiência",
  disabilityDetails: "Detalhes da deficiência",
  dietaryRestrictions: "Restrições alimentares",
  physicalRestrictions: "Restrições físicas",
  medicalNotes: "Observações médicas",
  otherHealthInfo: "Outras informações de saúde",
  specialNeeds: "Necessidades especiais",
  specialNeedsDetails: "Detalhes das necessidades especiais",
  extraAnswers: "Perguntas adicionais",
};

/** Idade em anos completos numa data de referência (hoje por padrão). */
export function ageFromBirthDate(birthDate: string | null | undefined, ref = new Date()): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  let age = ref.getUTCFullYear() - y;
  if (ref.getUTCMonth() + 1 < m || (ref.getUTCMonth() + 1 === m && ref.getUTCDate() < d)) age--;
  return age >= 0 ? age : null;
}
