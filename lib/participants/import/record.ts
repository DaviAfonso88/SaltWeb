import {
  emergencyContactSchema,
  guardianSchema,
  healthSchema,
  PARTICIPANT_FIELD_LABELS,
  participantSchema,
  type EmergencyContactInput,
  type GuardianInput,
  type HealthInput,
  type ParticipantInput,
} from "../schemas";
import { parseBirthDate, parseList, parseSex, parseYesNo } from "./parse";

export type ImportRecord = {
  participant: ParticipantInput;
  guardian: GuardianInput | null;
  emergencyContact: Exclude<EmergencyContactInput, null> | null;
  health: HealthInput | null;
  note: string | null;
  warnings: string[];
};

export type BuildResult = { ok: true; record: ImportRecord } | { ok: false; reason: string; name?: string };

const GENERIC_YES = /^(sim|s|yes)$/i;

/** Lista a partir de um campo "tem?" + "quais?". "Não" em qualquer um dos dois zera a lista. */
function listFrom(flag: string | undefined, value: string | undefined): string[] {
  if (flag !== undefined && !parseYesNo(flag)) return [];
  if (value === undefined || !parseYesNo(value)) return [];
  return parseList(value).filter((item) => !GENERIC_YES.test(item));
}

const textFrom = (flag: string | undefined, value: string | undefined): string | null => {
  if (flag !== undefined && !parseYesNo(flag)) return null;
  if (value === undefined || !parseYesNo(value)) return null;
  return GENERIC_YES.test(value) ? null : value;
};

function buildHealth(d: Record<string, string>): Record<string, unknown> | null {
  const conditions = listFrom(undefined, d.condicaoSaude);
  const disability = textFrom(undefined, d.deficiencia);
  const special = d.necessidadesEspeciaisDescricao && parseYesNo(d.necessidadesEspeciaisDescricao) ? d.necessidadesEspeciaisDescricao : null;

  const raw = {
    bloodType: d.tipoSanguineo ?? null,
    allergies: listFrom(d.possuiAlergias, d.alergias),
    allergyReaction: d.alergiaReacao ?? null,
    allergyMedication: d.alergiaMedicacao ?? null,
    medications: listFrom(d.utilizaMedicamentosContinuos, d.medicamentos),
    conditions,
    conditionDetails: d.condicaoEspecificacao ?? null,
    disability,
    disabilityDetails: d.deficienciaEspecificacao ?? null,
    dietaryRestrictions: listFrom(d.possuiRestricoesAlimentares, d.restricoesAlimentares),
    physicalRestrictions: textFrom(d.possuiRestricoesFisicas, d.restricoesFisicas),
    medicalNotes: [] as string[],
    otherHealthInfo: d.outraInfoSaude && parseYesNo(d.outraInfoSaude) ? d.outraInfoSaude : null,
    specialNeeds: Boolean(special),
    specialNeedsDetails: special && !GENERIC_YES.test(special) ? special : null,
  };

  const hasAny =
    raw.bloodType ||
    raw.allergies.length ||
    raw.allergyReaction ||
    raw.allergyMedication ||
    raw.medications.length ||
    raw.conditions.length ||
    raw.conditionDetails ||
    raw.disability ||
    raw.disabilityDetails ||
    raw.dietaryRestrictions.length ||
    raw.physicalRestrictions ||
    raw.otherHealthInfo ||
    raw.specialNeeds;
  return hasAny ? raw : null;
}

/** Valida os campos do participante; campo opcional inválido é descartado com aviso, nome inválido rejeita a linha. */
function parseLenient(raw: Record<string, unknown>, warnings: string[]): ParticipantInput | null {
  const work = { ...raw };
  for (let attempt = 0; attempt < 12; attempt++) {
    const result = participantSchema.safeParse(work);
    if (result.success) return result.data;
    let progressed = false;
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (key === "name") return null;
      if (work[key] !== null && work[key] !== undefined) {
        warnings.push(`${PARTICIPANT_FIELD_LABELS[key as keyof ParticipantInput] ?? key}: ${issue.message} (campo ignorado)`);
        work[key] = null;
        progressed = true;
      }
    }
    if (!progressed) return null;
  }
  return null;
}

/** Converte uma linha já mapeada (campo de destino → texto) num registro pronto para gravar. */
export function buildRecord(d: Record<string, string>, options: { canImportHealth: boolean }): BuildResult {
  const name = d.nome?.trim();
  if (!name) return { ok: false, reason: "Linha sem nome." };

  const warnings: string[] = [];
  const participant = parseLenient(
    {
      name,
      sex: parseSex(d.sexo),
      birthDate: parseBirthDate(d.dataNascimento),
      cpf: d.cpf ?? null,
      rg: d.rg ?? null,
      church: d.igreja ?? null,
      city: d.cidade ?? null,
      address: d.endereco ?? null,
      mobile: d.celular ?? null,
      whatsapp: d.whatsapp ?? null,
      email: d.email ?? null,
      authorizationDeclared: d.declaracao ? parseYesNo(d.declaracao) : false,
    },
    warnings,
  );
  if (!participant) return { ok: false, reason: "Nome inválido.", name };

  if (d.dataNascimento && !participant.birthDate) warnings.push("Data de nascimento não reconhecida (campo ignorado).");

  let guardian: GuardianInput | null = null;
  if (d.responsavelNome) {
    const parsed = guardianSchema.safeParse({
      name: d.responsavelNome,
      relationship: d.responsavelParentesco ?? "Não informado",
      phone: d.responsavelTelefone ?? "",
      email: d.responsavelEmail ?? null,
    });
    if (parsed.success) guardian = parsed.data;
    else warnings.push("Responsável ignorado: confira nome e telefone.");
  }

  let emergencyContact: ImportRecord["emergencyContact"] = null;
  if (d.contatoEmergenciaNome || d.contatoEmergenciaTelefone) {
    const parsed = emergencyContactSchema.safeParse({
      nome: d.contatoEmergenciaNome ?? "",
      parentesco: d.contatoEmergenciaParentesco ?? null,
      telefone: d.contatoEmergenciaTelefone ?? "",
    });
    if (parsed.success && parsed.data) emergencyContact = parsed.data;
    else warnings.push("Contato de emergência ignorado: confira nome e telefone.");
  }

  let health: HealthInput | null = null;
  const rawHealth = buildHealth(d);
  if (rawHealth) {
    if (!options.canImportHealth) warnings.push("Dados de saúde ignorados: seu perfil não pode editar fichas de saúde.");
    else {
      const parsed = healthSchema.safeParse(rawHealth);
      if (parsed.success) health = parsed.data;
      else warnings.push("Dados de saúde ignorados: algum texto está longo demais.");
    }
  }

  return { ok: true, record: { participant, guardian, emergencyContact, health, note: d.observacoes?.slice(0, 2000) ?? null, warnings } };
}
