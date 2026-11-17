"use client";

import { useState } from "react";

import { FormSection, Field, Honeypot, PersonFields, SubmitRow, useRegistration, type Person, type SubmitOutcome } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import { Textarea } from "@/components/ui/textarea";
import type { PublicEvent } from "@/lib/events/queries";

type Props = { event: PublicEvent; onOutcome: (outcome: SubmitOutcome, person: Person) => void };

export function SimplesForm({ event, onOutcome }: Props) {
  const reg = useRegistration(event);
  const [person, setPerson] = useState<Person>({ nome: "", telefone: "", email: "" });
  const [observacao, setObservacao] = useState("");
  const [website, setWebsite] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const outcome = await reg.submit(person, { observacao: observacao || undefined }, website);
    onOutcome(outcome, person);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-8 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <Honeypot value={website} onChange={setWebsite} />
      <FormSection title="Seus dados">
        <PersonFields person={person} onChange={setPerson} errors={reg.errors} requiresEmail />
        <Field name="observacao" label="Observação (opcional)" errors={reg.errors.observacao}>
          {(a11y) => (
            <Textarea {...a11y} name="observacao" rows={4} maxLength={500} value={observacao} onChange={(e) => setObservacao(e.target.value)} className="rounded-lg bg-white" />
          )}
        </Field>
      </FormSection>
      <PrivacyNotice />
      <SubmitRow pending={reg.pending} error={reg.formError} />
    </form>
  );
}
