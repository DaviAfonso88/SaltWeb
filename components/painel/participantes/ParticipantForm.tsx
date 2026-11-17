"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { Field, SelectField } from "@/components/painel/participantes/Field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";
import { createParticipant, updateParticipant } from "@/lib/participants/actions";

export type ParticipantValues = {
  name: string;
  sex: "M" | "F" | null;
  birthDate: string | null;
  cpf: string | null;
  rg: string | null;
  church: string | null;
  city: string | null;
  address: string | null;
  mobile: string | null;
  whatsapp: string | null;
  email: string | null;
  authorizationDeclared: boolean;
};

const EMPTY: ParticipantValues = {
  name: "",
  sex: null,
  birthDate: null,
  cpf: null,
  rg: null,
  church: null,
  city: null,
  address: null,
  mobile: null,
  whatsapp: null,
  email: null,
  authorizationDeclared: false,
};

type Props =
  | { mode: "create"; eventId: string }
  | { mode: "edit"; id: string; version: number; values: ParticipantValues; readOnly?: boolean };

export function ParticipantForm(props: Props) {
  const router = useRouter();
  const readOnly = props.mode === "edit" && Boolean(props.readOnly);
  const [values, setValues] = useState<ParticipantValues>(props.mode === "edit" ? props.values : EMPTY);
  const [result, setResult] = useState<ActionResult<{ id: string }> | undefined>();
  const [pending, startTransition] = useTransition();
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  const set = <K extends keyof ParticipantValues>(key: K, value: ParticipantValues[K]) => setValues((v) => ({ ...v, [key]: value }));
  const text = (key: Exclude<keyof ParticipantValues, "sex" | "authorizationDeclared" | "name">) => ({
    value: values[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(key, e.target.value),
    disabled: readOnly,
    error: errors?.[key],
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = props.mode === "create" ? await createParticipant(props.eventId, values) : await updateParticipant(props.id, props.version, values);
      setResult(r as ActionResult<{ id: string }>);
      if (!r.ok) return;
      toast.success(r.message ?? "Salvo.");
      if (props.mode === "create") router.push(`/painel/participantes/${(r as { data?: { id: string } }).data?.id ?? ""}`);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="p-name" label="Nome completo" required value={values.name} onChange={(e) => set("name", e.target.value)} disabled={readOnly} error={errors?.name} maxLength={160} className="sm:col-span-2" autoComplete="off" />
        <SelectField id="p-sex" label="Sexo" value={values.sex ?? ""} onChange={(e) => set("sex", e.target.value === "M" || e.target.value === "F" ? e.target.value : null)} disabled={readOnly} error={errors?.sex}>
          <option value="">Não informado</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </SelectField>
        <Field id="p-birth" label="Data de nascimento" type="date" {...text("birthDate")} />
        <Field id="p-cpf" label="CPF" inputMode="numeric" hint="Só números ou com pontuação." {...text("cpf")} />
        <Field id="p-rg" label="RG" {...text("rg")} />
        <Field id="p-church" label="Igreja" {...text("church")} />
        <Field id="p-city" label="Cidade" {...text("city")} />
        <Field id="p-address" label="Endereço" className="sm:col-span-2" {...text("address")} />
        <Field id="p-mobile" label="Celular" type="tel" inputMode="tel" {...text("mobile")} />
        <Field id="p-whatsapp" label="WhatsApp" type="tel" inputMode="tel" {...text("whatsapp")} />
        <Field id="p-email" label="E-mail" type="email" className="sm:col-span-2" {...text("email")} />
      </div>

      <div className="flex min-h-11 items-center gap-3">
        <Checkbox id="p-auth" checked={values.authorizationDeclared} onCheckedChange={(c) => set("authorizationDeclared", c === true)} disabled={readOnly} />
        <Label htmlFor="p-auth" className="cursor-pointer text-sm">
          Declaração de autorização assinada
        </Label>
      </div>

      <FormError message={result && !result.ok ? result.error : undefined} />

      {!readOnly ? (
        <div>
          <Button type="submit" disabled={pending} className="min-h-11 rounded-full">
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Salvando…
              </>
            ) : props.mode === "create" ? (
              "Criar participante"
            ) : (
              "Salvar dados"
            )}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
