"use client";

import { useMemo, useState } from "react";

import { FormSection, Honeypot, PersonFields, SubmitRow, useRegistration, type Person, type SubmitOutcome } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PublicEvent } from "@/lib/events/queries";
import { missaoConfigSchema } from "@/lib/forms/missao";

type Props = { event: PublicEvent; onOutcome: (outcome: SubmitOutcome, person: Person) => void };

export function MissaoForm({ event, onOutcome }: Props) {
  const config = useMemo(() => missaoConfigSchema.parse(event.formConfig), [event.formConfig]);
  const reg = useRegistration(event);
  const [person, setPerson] = useState<Person>({ nome: "", telefone: "", email: "" });
  const [integral, setIntegral] = useState(false);
  const [periodos, setPeriodos] = useState<string[]>([]);
  const [website, setWebsite] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const outcome = await reg.submit(person, { tempoIntegral: integral, periodos: integral ? [] : periodos }, website);
    onOutcome(outcome, person);
  }

  const err = reg.errors;
  const summary =
    integral ? "Participação em tempo integral." : periodos.length === 0 ? "Selecione ao menos um período." : periodos.length === 1 ? "1 período selecionado." : `${periodos.length} períodos selecionados.`;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-8 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <Honeypot value={website} onChange={setWebsite} />

      <FormSection step={1} title="Seus dados">
        <PersonFields person={person} onChange={setPerson} errors={err} requiresEmail={false} />
      </FormSection>

      <FormSection step={2} title="Participação">
        {config.permitirTempoIntegral ? (
          <div className="flex min-h-12 items-start gap-3 rounded-lg border border-line-strong bg-white p-3">
            <Switch id="integral" checked={integral} onCheckedChange={setIntegral} className="mt-0.5" />
            <Label htmlFor="integral" className="grid cursor-pointer gap-0.5 text-sm font-normal">
              <span className="font-medium">Tempo integral</span>
              <span className="text-xs text-text-3">Participação completa, do começo ao fim.</span>
            </Label>
          </div>
        ) : null}

        {!integral ? (
          <fieldset className="grid gap-2 border-0 p-0">
            <legend className="mb-1 p-0 text-sm font-semibold">{config.permitirTempoIntegral ? "Ou escolha os períodos" : "Escolha os períodos"}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {config.periodos.map((p) => {
                const id = `periodo-${p.id}`;
                return (
                  <div key={p.id} className="flex min-h-12 items-center gap-3 rounded-lg border border-line-strong bg-white px-3">
                    <Checkbox
                      id={id}
                      checked={periodos.includes(p.id)}
                      onCheckedChange={(checked) => setPeriodos((cur) => (checked ? [...cur, p.id] : cur.filter((x) => x !== p.id)))}
                    />
                    <Label htmlFor={id} className="flex-1 cursor-pointer text-sm font-normal">
                      {p.rotulo}
                    </Label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <p role="status" aria-live="polite" className="text-sm text-text-2">
          {summary}
        </p>
        {err.tempoIntegral || err.periodos ? (
          <p role="alert" className="text-sm text-destructive">
            {(err.tempoIntegral ?? err.periodos)[0]}
          </p>
        ) : null}
      </FormSection>

      <PrivacyNotice />
      <SubmitRow pending={reg.pending} error={reg.formError} />
    </form>
  );
}
