"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { AreaField, Field, SelectField } from "@/components/painel/participantes/Field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";
import { updateParticipantHealth } from "@/lib/participants/actions";
import { HEALTH_CONDITIONS } from "@/lib/participants/import/aliases";

export type HealthValues = {
  bloodType: string | null;
  allergies: string[];
  allergyReaction: string | null;
  allergyMedication: string | null;
  medications: string[];
  conditions: string[];
  conditionDetails: string | null;
  disability: string | null;
  disabilityDetails: string | null;
  dietaryRestrictions: string[];
  physicalRestrictions: string | null;
  medicalNotes: string[];
  otherHealthInfo: string | null;
  specialNeeds: boolean;
  specialNeedsDetails: string | null;
};

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const KNOWN = new Set<string>(HEALTH_CONDITIONS.map((c) => c.label));

const toLines = (list: string[]) => list.join("\n");
const fromLines = (text: string) => text.split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);

export function HealthForm({ participantId, initial, readOnly }: { participantId: string; initial: HealthValues; readOnly?: boolean }) {
  const router = useRouter();
  const [v, setV] = useState({
    ...initial,
    allergies: toLines(initial.allergies),
    medications: toLines(initial.medications),
    dietaryRestrictions: toLines(initial.dietaryRestrictions),
    medicalNotes: toLines(initial.medicalNotes),
    checked: initial.conditions.filter((c) => KNOWN.has(c)),
    otherConditions: toLines(initial.conditions.filter((c) => !KNOWN.has(c))),
  });
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  const text = (key: "bloodType" | "allergyReaction" | "allergyMedication" | "conditionDetails" | "disability" | "disabilityDetails" | "physicalRestrictions" | "otherHealthInfo" | "specialNeedsDetails") => ({
    value: v[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [key]: e.target.value })),
    disabled: readOnly,
    error: errors?.[key],
  });
  const lines = (key: "allergies" | "medications" | "dietaryRestrictions" | "medicalNotes" | "otherConditions") => ({
    value: v[key],
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setV((s) => ({ ...s, [key]: e.target.value })),
    disabled: readOnly,
  });

  function save() {
    const payload: HealthValues = {
      bloodType: v.bloodType,
      allergies: fromLines(v.allergies),
      allergyReaction: v.allergyReaction,
      allergyMedication: v.allergyMedication,
      medications: fromLines(v.medications),
      conditions: [...v.checked, ...fromLines(v.otherConditions)],
      conditionDetails: v.conditionDetails,
      disability: v.disability,
      disabilityDetails: v.disabilityDetails,
      dietaryRestrictions: fromLines(v.dietaryRestrictions),
      physicalRestrictions: v.physicalRestrictions,
      medicalNotes: fromLines(v.medicalNotes),
      otherHealthInfo: v.otherHealthInfo,
      specialNeeds: v.specialNeeds,
      specialNeedsDetails: v.specialNeedsDetails,
    };
    startTransition(async () => {
      const r = await updateParticipantHealth(participantId, payload);
      setResult(r);
      if (r.ok) {
        toast.success(r.message ?? "Salvo.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField id="h-blood" label="Tipo sanguíneo" value={v.bloodType ?? ""} onChange={(e) => setV((s) => ({ ...s, bloodType: e.target.value || null }))} disabled={readOnly} error={errors?.bloodType}>
          <option value="">Não informado</option>
          {BLOOD_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </SelectField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AreaField id="h-allergies" label="Alergias" hint="Uma por linha." {...lines("allergies")} />
        <div className="grid content-start gap-4">
          <Field id="h-allergy-reaction" label="Reação às alergias" {...text("allergyReaction")} />
          <Field id="h-allergy-med" label="Medicação para alergia" {...text("allergyMedication")} />
        </div>
      </div>

      <AreaField id="h-meds" label="Medicamentos de uso contínuo" hint="Uma linha por medicamento: nome, dose, horário e motivo." {...lines("medications")} />

      <fieldset className="grid gap-3">
        <legend className="text-sm font-semibold">Condições de saúde</legend>
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
          {HEALTH_CONDITIONS.map((c) => (
            <div key={c.value} className="flex min-h-11 items-center gap-3">
              <Checkbox
                id={`h-c-${c.value}`}
                checked={v.checked.includes(c.label)}
                disabled={readOnly}
                onCheckedChange={(on) => setV((s) => ({ ...s, checked: on === true ? [...s.checked, c.label] : s.checked.filter((x) => x !== c.label) }))}
              />
              <Label htmlFor={`h-c-${c.value}`} className="cursor-pointer text-sm">
                {c.label}
              </Label>
            </div>
          ))}
        </div>
        <AreaField id="h-other-conditions" label="Outras condições" hint="Uma por linha." {...lines("otherConditions")} className="max-w-xl" />
        <AreaField id="h-cond-details" label="Detalhes das condições" {...text("conditionDetails")} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="h-disability" label="Deficiência" {...text("disability")} />
        <Field id="h-disability-details" label="Detalhes da deficiência" {...text("disabilityDetails")} />
        <AreaField id="h-diet" label="Restrições alimentares" hint="Uma por linha." {...lines("dietaryRestrictions")} />
        <AreaField id="h-physical" label="Restrições físicas" {...text("physicalRestrictions")} />
      </div>

      <div className="grid gap-3">
        <div className="flex min-h-11 items-center gap-3">
          <Checkbox id="h-special" checked={v.specialNeeds} disabled={readOnly} onCheckedChange={(on) => setV((s) => ({ ...s, specialNeeds: on === true }))} />
          <Label htmlFor="h-special" className="cursor-pointer text-sm font-semibold">
            Tem necessidades especiais
          </Label>
        </div>
        {v.specialNeeds ? <AreaField id="h-special-details" label="Descreva as necessidades especiais" {...text("specialNeedsDetails")} /> : null}
      </div>

      <AreaField id="h-notes" label="Observações médicas" hint="Uma por linha." {...lines("medicalNotes")} />
      <AreaField id="h-other" label="Outras informações de saúde" {...text("otherHealthInfo")} />

      <FormError message={result && !result.ok ? result.error : undefined} />

      {!readOnly ? (
        <div>
          <Button type="button" className="min-h-11 rounded-full" onClick={save} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Salvando…
              </>
            ) : (
              "Salvar ficha de saúde"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
