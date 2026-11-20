"use client";

import { CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";

import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import {
  CheckboxCards,
  ChoiceCards,
  Honeypot,
  SelectInput,
  SubmitRow,
  TextInput,
  focusFirstError,
  maskPhone,
  type Errors,
} from "@/components/forms/shared";
import { ButtonLink } from "@/components/site/ButtonLink";
import { onlyDigits } from "@/lib/text";
import { AGE_GROUPS, HOW_FOUND, INTERESTS, type AgeGroup, type HowFound, type Interest } from "@/lib/visitors/options";

type FormState = {
  nome: string;
  whatsapp: string;
  grupo: AgeGroup | undefined;
  bairro: string;
  comoConheceu: HowFound | "";
  convidadoPor: string;
  interesses: Interest[];
  consentimento: boolean;
};

const EMPTY: FormState = {
  nome: "",
  whatsapp: "",
  grupo: undefined,
  bairro: "",
  comoConheceu: "",
  convidadoPor: "",
  interesses: [],
  consentimento: false,
};

const AGE_OPTIONS = AGE_GROUPS.map((g) => ({ value: g.value, label: g.label }));
const HOW_FOUND_OPTIONS = HOW_FOUND.map((h) => ({ value: h.value, label: h.label }));
const INTEREST_OPTIONS = INTERESTS.map((i) => ({ value: i.value, label: i.label }));

const CONSENT_ERROR_ID = "consentimento-erro";

/** Ao trocar o formulário pela confirmação, leva o visitante (e o foco) até ela. */
function revealOnMount(el: HTMLDivElement | null) {
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
  el?.focus({ preventScroll: true });
}

function validate(f: FormState): Errors {
  const errors: Errors = {};
  if (!f.nome.trim()) errors.nome = ["Informe seu nome."];
  const digits = onlyDigits(f.whatsapp).length;
  if (digits < 10 || digits > 13) errors.whatsapp = ["Informe um WhatsApp com DDD."];
  if (!f.grupo) errors.grupo = ["Escolha o seu grupo."];
  if (!f.consentimento) errors.consentimento = ["Precisamos da sua autorização para falar com você."];
  return errors;
}

export function VisitanteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const local = validate(form);
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) {
      setTimeout(() => focusFirstError(formRef.current), 50);
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/visitantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          comoConheceu: form.comoConheceu || undefined,
          convidadoPor: form.comoConheceu === "amigo" ? form.convidadoPor : undefined,
          website,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSentTo(form.nome.trim().split(/\s+/)[0] ?? "");
        return;
      }
      if (data.fieldErrors) {
        setErrors(data.fieldErrors);
        setTimeout(() => focusFirstError(formRef.current), 50);
      }
      setFormError(typeof data.error === "string" ? data.error : "Não foi possível enviar agora. Tente novamente em instantes.");
    } catch {
      setFormError("Sem conexão. Verifique sua internet e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  if (sentTo !== null) {
    return (
      <div
        role="status"
        tabIndex={-1}
        ref={revealOnMount}
        className="flex scroll-mt-24 flex-col gap-5 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)] outline-none"
      >
        <CheckCircle2 className="size-9 text-success" aria-hidden />
        <div className="grid gap-2">
          <p className="font-display text-[clamp(22px,2.4vw,28px)] font-semibold leading-tight tracking-[-0.015em]">
            Que bom ter você aqui{sentTo ? `, ${sentTo}` : ""}!
          </p>
          <p className="text-text-2">Recebemos seu contato. Em breve alguém da liderança fala com você pelo WhatsApp.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/eventos" icon="next">
            Ver próximos eventos
          </ButtonLink>
          <ButtonLink href="/sobre" variant="secondary">
            Conhecer a SALT
          </ButtonLink>
        </div>
      </div>
    );
  }

  const consentError = errors.consentimento?.[0];

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      aria-label="Cadastro de visitante"
      className="relative grid gap-7 rounded-xl border border-line bg-white p-[clamp(20px,3.5vw,40px)]"
    >
      <Honeypot value={website} onChange={setWebsite} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
        <TextInput
          name="nome"
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome completo"
          required
          value={form.nome}
          onChange={(v) => set("nome", v)}
          errors={errors.nome}
        />
        <TextInput
          name="whatsapp"
          label="WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="(31) 99999-0000"
          value={form.whatsapp}
          onChange={(v) => set("whatsapp", maskPhone(v))}
          errors={errors.whatsapp}
        />
      </div>

      <ChoiceCards name="grupo" legend="Qual é o seu grupo?" value={form.grupo} onChange={(v) => set("grupo", v)} options={AGE_OPTIONS} errors={errors.grupo} />

      <CheckboxCards
        name="interesses"
        legend="O que você gostaria? (opcional)"
        hint="Marque quantas opções quiser."
        values={form.interesses}
        onChange={(v) => set("interesses", v)}
        options={INTEREST_OPTIONS}
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-start gap-[18px]">
        <TextInput
          name="bairro"
          label="Bairro e cidade (opcional)"
          autoComplete="address-level2"
          placeholder="Ex.: Jardim Imperial, Lagoa Santa"
          hint="Ajuda a indicar uma célula perto de você."
          value={form.bairro}
          onChange={(v) => set("bairro", v)}
          errors={errors.bairro}
        />
        <SelectInput
          name="comoConheceu"
          label="Como conheceu a SALT? (opcional)"
          placeholder="Escolha uma opção"
          value={form.comoConheceu}
          onChange={(v) => set("comoConheceu", v as HowFound | "")}
          options={HOW_FOUND_OPTIONS}
        />
      </div>

      {form.comoConheceu === "amigo" ? (
        <TextInput
          name="convidadoPor"
          label="Quem te convidou? (opcional)"
          placeholder="Nome de quem te chamou"
          value={form.convidadoPor}
          onChange={(v) => set("convidadoPor", v)}
          errors={errors.convidadoPor}
        />
      ) : null}

      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2.5 text-[15px]">
            <input
              type="checkbox"
              name="consentimento"
              checked={form.consentimento}
              onChange={(e) => set("consentimento", e.target.checked)}
              aria-invalid={consentError ? true : undefined}
              aria-describedby={consentError ? CONSENT_ERROR_ID : undefined}
              className="mt-[3px] size-[18px] shrink-0 accent-[var(--purple)]"
            />
            <span>Autorizo a Juventude SALT a falar comigo pelo WhatsApp.</span>
          </label>
          {consentError ? (
            <p id={CONSENT_ERROR_ID} role="alert" className="text-sm text-destructive">
              {consentError}
            </p>
          ) : null}
        </div>
        <PrivacyNotice purpose="falar com você e te ajudar a se conectar à SALT" keeper="que acompanha os visitantes" />
      </div>
      <SubmitRow pending={pending} label="Enviar meu contato" error={formError} />
    </form>
  );
}
