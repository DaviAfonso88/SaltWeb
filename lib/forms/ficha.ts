import { z } from "zod";

import type { ExtraAnswer } from "@/lib/db/schema";
import type { FichaExtra } from "@/lib/forms/ficha-config";
import { HEALTH_CONDITIONS } from "@/lib/participants/import/aliases";
import { guardiansSchema, healthSchema, type GuardianInput, type HealthInput } from "@/lib/participants/schemas";

// Ficha de saúde e responsáveis da inscrição em acampamento.
// Módulo puro (sem diretiva): o navegador valida com ele para responder rápido e o servidor revalida tudo.

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export const NOT_KNOWN = "nao_sei";

const CONDITION_LABELS: ReadonlySet<string> = new Set(HEALTH_CONDITIONS.map((c) => c.label));

const answer = z.enum(["sim", "nao"], { error: "Responda sim ou não." });
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use até ${max} caracteres.`)
    .optional()
    .default("");

/** Um item por linha (também aceita `;`), sem vazios nem repetidos. */
export const toLines = (value: string): string[] => [...new Set(value.split(/[\n;]+/).map((s) => s.trim()).filter(Boolean))];

/** Campos do formulário público (cada pergunta sim/não precisa ser respondida de forma explícita). */
export const publicHealthSchema = z
  .object({
    tipoSanguineo: z.enum([...BLOOD_TYPES, NOT_KNOWN], { error: "Selecione o tipo sanguíneo (ou “Não sei”)." }),
    alergia: answer,
    alergias: text(600),
    reacaoAlergia: text(500),
    medicacaoAlergia: text(300),
    medicamento: answer,
    medicamentos: text(1500),
    condicao: answer,
    condicoes: z.array(z.string().max(80)).max(30).optional().default([]),
    outrasCondicoes: text(600),
    detalhesCondicoes: text(1000),
    alimentar: answer,
    restricoesAlimentares: text(600),
    deficiencia: answer,
    qualDeficiencia: text(200),
    detalhesDeficiencia: text(1000),
    cuidadoEspecial: answer,
    detalhesCuidadoEspecial: text(1000),
    restricaoFisica: answer,
    restricoesFisicas: text(500),
    outrasInformacoes: text(1000),
  })
  .superRefine((d, ctx) => {
    const need = (cond: boolean, path: string, message: string) => cond && ctx.addIssue({ code: "custom", path: [path], message });
    const tooLong = (path: string, value: string, max: number) =>
      need(toLines(value).some((l) => l.length > max), path, `Cada item deve ter até ${max} caracteres.`);

    need(d.alergia === "sim" && toLines(d.alergias).length === 0, "alergias", "Informe a(s) alergia(s).");
    need(d.medicamento === "sim" && toLines(d.medicamentos).length === 0, "medicamentos", "Informe o medicamento, a dose e o horário.");
    need(
      d.condicao === "sim" && d.condicoes.length === 0 && toLines(d.outrasCondicoes).length === 0,
      "condicoes",
      "Marque ao menos uma condição ou descreva em “Outras condições”.",
    );
    need(d.condicoes.some((c) => !CONDITION_LABELS.has(c)), "condicoes", "Condição inválida.");
    need(d.alimentar === "sim" && toLines(d.restricoesAlimentares).length === 0, "restricoesAlimentares", "Informe a restrição alimentar.");
    need(d.deficiencia === "sim" && !d.qualDeficiencia, "qualDeficiencia", "Informe qual deficiência.");
    need(d.cuidadoEspecial === "sim" && !d.detalhesCuidadoEspecial, "detalhesCuidadoEspecial", "Descreva o cuidado necessário.");
    need(d.restricaoFisica === "sim" && !d.restricoesFisicas, "restricoesFisicas", "Informe a restrição.");

    tooLong("alergias", d.alergias, 200);
    tooLong("medicamentos", d.medicamentos, 300);
    tooLong("outrasCondicoes", d.outrasCondicoes, 80);
    tooLong("restricoesAlimentares", d.restricoesAlimentares, 200);
  })
  .transform((d) => {
    const yes = (flag: "sim" | "nao") => flag === "sim";
    const raw = {
      bloodType: d.tipoSanguineo === NOT_KNOWN ? null : d.tipoSanguineo,
      allergies: yes(d.alergia) ? toLines(d.alergias) : [],
      allergyReaction: yes(d.alergia) ? d.reacaoAlergia : null,
      allergyMedication: yes(d.alergia) ? d.medicacaoAlergia : null,
      medications: yes(d.medicamento) ? toLines(d.medicamentos) : [],
      conditions: yes(d.condicao) ? [...new Set([...d.condicoes, ...toLines(d.outrasCondicoes)])] : [],
      conditionDetails: yes(d.condicao) ? d.detalhesCondicoes : null,
      disability: yes(d.deficiencia) ? d.qualDeficiencia : null,
      disabilityDetails: yes(d.deficiencia) ? d.detalhesDeficiencia : null,
      dietaryRestrictions: yes(d.alimentar) ? toLines(d.restricoesAlimentares) : [],
      physicalRestrictions: yes(d.restricaoFisica) ? d.restricoesFisicas : null,
      medicalNotes: [],
      otherHealthInfo: d.outrasInformacoes,
      specialNeeds: yes(d.cuidadoEspecial),
      specialNeedsDetails: yes(d.cuidadoEspecial) ? d.detalhesCuidadoEspecial : null,
    };
    // Passa pelo mesmo schema do painel, então o que entra aqui tem o formato que o painel edita.
    return healthSchema.parse(raw);
  });

export type PublicHealthInput = z.input<typeof publicHealthSchema>;

export type Ficha = { saude: HealthInput; responsaveis: GuardianInput[] };

/**
 * Respostas às perguntas extras do evento. O servidor usa o texto da pergunta da configuração do evento
 * (nunca o que veio do navegador) e guarda uma cópia dele junto da resposta.
 */
const extrasSchema = (extras: FichaExtra[]) =>
  z
    .preprocess((v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {}), z.record(z.string(), z.unknown()))
    .superRefine((raw, ctx) => {
      for (const e of extras) {
        const value = String(raw[e.id] ?? "").trim();
        const fail = (message: string) => ctx.addIssue({ code: "custom", path: [e.id], message });
        if (e.tipo === "simnao") {
          if (value !== "" && value !== "sim" && value !== "nao") fail("Responda sim ou não.");
          else if (e.obrigatoria && value === "") fail("Responda sim ou não.");
        } else {
          if (e.obrigatoria && value === "") fail("Responda esta pergunta.");
          if (value.length > 1000) fail("Use até 1000 caracteres.");
        }
      }
    })
    .transform((raw): ExtraAnswer[] =>
      extras
        .map((e) => ({ id: e.id, pergunta: e.pergunta, tipo: e.tipo, resposta: String(raw[e.id] ?? "").trim() }))
        .filter((a) => a.resposta !== ""),
    );

const fichaSchema = (minor: boolean, extras: FichaExtra[]) =>
  z
    .object({
      // Ausente vira vazio, para a resposta sair como erro de campo em português.
      saude: z.preprocess((v) => v ?? {}, publicHealthSchema),
      extras: extrasSchema(extras),
      // Menor de 18 anos precisa de ao menos um responsável; para maiores o campo é ignorado.
      responsaveis: minor ? z.preprocess((v) => v ?? [], guardiansSchema.min(1, "Cadastre ao menos um responsável.")) : z.unknown().transform(() => [] as GuardianInput[]),
    })
    .transform((d) => ({ saude: { ...d.saude, extraAnswers: d.extras }, responsaveis: d.responsaveis })) as unknown as z.ZodType<Ficha>;

export const MAJORITY_AGE = 18;

export const isMinor = (age: number) => age < MAJORITY_AGE;

/** Valida ficha de saúde, perguntas extras do evento e responsáveis. `minor` define se o responsável é obrigatório. */
export function parseFicha(input: { saude: unknown; responsaveis: unknown; extras?: unknown }, minor: boolean, extras: FichaExtra[] = []) {
  return fichaSchema(minor, extras).safeParse(input);
}
