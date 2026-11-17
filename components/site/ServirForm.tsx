"use client";

import { Check, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Honeypot, SubmitRow, TextInput, maskPhone, type Errors } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import { onlyDigits } from "@/lib/text";
import { cn } from "@/lib/utils";

const MINISTRIES = ["Louvor", "Multimídia", "Sonoplastia", "Acolhimento", "Infantil", "Transmissão"];

export function ServirForm() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ministerio, setMinisterio] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const local: Errors = {};
    if (!nome.trim()) local.nome = ["Informe seu nome completo."];
    const digits = onlyDigits(whatsapp).length;
    if (digits < 10 || digits > 13) local.whatsapp = ["Informe um telefone com DDD."];
    if (!ministerio) local.ministerio = ["Escolha um ministério."];
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) return;

    setPending(true);
    try {
      const response = await fetch("/api/servir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, whatsapp, ministerio, website }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSent(true);
        return;
      }
      if (data.fieldErrors) setErrors(data.fieldErrors);
      setFormError(typeof data.error === "string" ? data.error : "Não foi possível enviar agora. Tente novamente em instantes.");
    } catch {
      setFormError("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div role="status" className="flex items-start gap-4 rounded-xl border border-line bg-white p-6">
        <CheckCircle2 className="size-8 shrink-0 text-success" aria-hidden />
        <div>
          <p className="font-display text-xl font-semibold">Recebemos seu interesse!</p>
          <p className="mt-1 text-text-2">Em breve a equipe entra em contato pelo WhatsApp.</p>
        </div>
      </div>
    );
  }

  const ministryErrId = "ministerio-erro";
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative grid gap-5 rounded-xl border border-line bg-white p-[clamp(20px,3vw,32px)]"
    >
      <Honeypot value={website} onChange={setWebsite} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[18px]">
        <TextInput name="nome" label="Nome" autoComplete="name" placeholder="Seu nome completo" required value={nome} onChange={setNome} errors={errors.nome} />
        <TextInput
          name="whatsapp"
          label="WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="(DD) 9XXXX-XXXX"
          value={whatsapp}
          onChange={(v) => setWhatsapp(maskPhone(v))}
          errors={errors.whatsapp}
        />
      </div>
      <fieldset className="grid gap-2.5 border-0 p-0" aria-describedby={errors.ministerio?.length ? ministryErrId : undefined}>
        <legend className="mb-2.5 p-0 text-sm font-semibold">Ministério de interesse</legend>
        <div className="flex flex-wrap gap-2">
          {MINISTRIES.map((m) => {
            const selected = ministerio === m;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={selected}
                onClick={() => setMinisterio(m)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3.5 text-sm transition-colors",
                  selected
                    ? "border-primary bg-purple-tint font-semibold text-[#6e2468]"
                    : "border-line-strong bg-white font-medium text-foreground hover:bg-sand",
                )}
              >
                {selected ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : null}
                {m}
              </button>
            );
          })}
        </div>
        {errors.ministerio?.length ? (
          <p id={ministryErrId} role="alert" className="text-sm text-destructive">
            {errors.ministerio[0]}
          </p>
        ) : null}
      </fieldset>
      <PrivacyNotice />
      <SubmitRow pending={pending} label="Quero servir" error={formError} inline />
    </form>
  );
}
