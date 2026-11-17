"use client";

import { Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicEvent } from "@/lib/events/queries";
import type { FestaAvailability } from "@/lib/forms/availability";
import { getFormModel } from "@/lib/forms/registry";
import type { Installment } from "@/lib/forms/types";
import { onlyDigits } from "@/lib/text";
import { cn } from "@/lib/utils";

export type Errors = Record<string, string[]>;

export type SubmitSummary = {
  numero: number;
  valorFinalCentavos: number;
  parcelas: Installment[];
  resumo: { valorOriginalCentavos?: number; lote?: string; plano?: string; forma?: string };
};

export type Person = { nome: string; telefone: string; email: string };

/** Máscara simples de telefone BR: (31) 99999-0000. */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validatePerson(person: Person, requiresEmail: boolean): Errors {
  const errors: Errors = {};
  if (person.nome.trim().length < 3) errors.nome = ["Informe seu nome completo."];
  const digits = onlyDigits(person.telefone).length;
  if (digits < 10 || digits > 13) errors.telefone = ["Informe um telefone com DDD."];
  if (requiresEmail && !person.email.trim()) errors.email = ["Informe seu e-mail."];
  else if (person.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim())) {
    errors.email = ["Informe um e-mail válido."];
  }
  return errors;
}

export type SubmitOutcome =
  | { kind: "ok"; summary: SubmitSummary }
  | { kind: "invalid" }
  | { kind: "duplicada" | "encerrada" | "erro" }
  | { kind: "sem_vagas"; itens: string[]; disponibilidade: FestaAvailability };

/**
 * Valida no cliente (mesmos schemas do servidor, para resposta rápida) e envia para a API.
 * O servidor continua sendo a autoridade: ele revalida tudo e recalcula o valor.
 */
export function useRegistration(event: PublicEvent) {
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [summary, setSummary] = useState<SubmitSummary | null>(null);
  const model = getFormModel(event.formModel);

  async function submit(person: Person, answers: unknown, website: string): Promise<SubmitOutcome> {
    if (!model) return { kind: "encerrada" };
    setFormError(null);

    const local = validatePerson(person, model.requiresEmail);
    const parsed = model.parseAnswers(event.formConfig, answers);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "_";
        (local[key] ??= []).push(issue.message);
      }
    }
    setErrors(local);
    if (Object.keys(local).length) return { kind: "invalid" };

    setPending(true);
    try {
      const response = await fetch(`/api/inscricoes/${encodeURIComponent(event.slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: person.nome,
          telefone: person.telefone,
          email: person.email || undefined,
          respostas: answers,
          website,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        setSummary(data as SubmitSummary);
        return { kind: "ok", summary: data as SubmitSummary };
      }
      if (response.status === 400 && data.fieldErrors) {
        const mapped: Errors = {};
        for (const [key, messages] of Object.entries<string[]>(data.fieldErrors)) {
          mapped[key.replace(/^respostas\./, "")] = messages;
        }
        setErrors(mapped);
        return { kind: "invalid" };
      }
      if (response.status === 409) {
        if (data.error === "sem_vagas") {
          return { kind: "sem_vagas", itens: data.itens ?? [], disponibilidade: data.disponibilidade };
        }
        if (data.error === "duplicada" || data.error === "encerrada") return { kind: data.error };
      }
      setFormError(data.error && typeof data.error === "string" && data.error.length > 20 ? data.error : "Não foi possível enviar agora. Tente novamente em instantes.");
      return { kind: "erro" };
    } catch {
      setFormError("Sem conexão. Verifique sua internet e tente novamente.");
      return { kind: "erro" };
    } finally {
      setPending(false);
    }
  }

  return { errors, setErrors, formError, setFormError, pending, summary, submit };
}

export function FormSection({ step, title, description, children }: { step?: number; title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-4 border-0 border-t border-[#eeebe6] p-0 pt-9 first-of-type:border-t-0 first-of-type:pt-0">
      <legend className="mb-1 flex w-full items-center gap-3 p-0">
        {step ? (
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-ink text-[13px] font-semibold text-white" aria-hidden>
            {step}
          </span>
        ) : null}
        <span className="font-display text-[19px] font-semibold tracking-[-0.01em]">{title}</span>
      </legend>
      {description ? <p className="text-[15px] text-text-2">{description}</p> : null}
      {children}
    </fieldset>
  );
}

export function Field({
  name,
  label,
  errors,
  hint,
  children,
}: {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId();
  const errId = `${id}-erro`;
  const hintId = `${id}-dica`;
  const describedBy = [errors?.length ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="grid gap-1.5" data-field={name}>
      <Label htmlFor={id} className="text-sm font-semibold leading-normal">
        {label}
      </Label>
      {children({ id, "aria-invalid": errors?.length ? true : undefined, "aria-describedby": describedBy })}
      {hint ? (
        <p id={hintId} className="text-xs text-text-3">
          {hint}
        </p>
      ) : null}
      {errors?.length ? (
        <p id={errId} role="alert" className="text-sm text-destructive">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  name,
  label,
  value,
  onChange,
  errors,
  hint,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "name"> & {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  hint?: string;
}) {
  return (
    <Field name={name} label={label} errors={errors} hint={hint}>
      {(a11y) => (
        <Input
          {...a11y}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-12 rounded-lg bg-white px-3.5 text-[15px] placeholder:text-[#77737e]"
          {...props}
        />
      )}
    </Field>
  );
}

export function PersonFields({
  person,
  onChange,
  errors,
  requiresEmail,
}: {
  person: Person;
  onChange: (next: Person) => void;
  errors: Errors;
  requiresEmail: boolean;
}) {
  return (
    <>
      <TextInput name="nome" label="Nome completo" autoComplete="name" required value={person.nome} onChange={(v) => onChange({ ...person, nome: v })} errors={errors.nome} />
      <TextInput
        name="telefone"
        label="Telefone (WhatsApp)"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        placeholder="(31) 99999-0000"
        value={person.telefone}
        onChange={(v) => onChange({ ...person, telefone: maskPhone(v) })}
        errors={errors.telefone}
      />
      <TextInput
        name="email"
        label={requiresEmail ? "E-mail" : "E-mail (opcional)"}
        type="email"
        autoComplete="email"
        required={requiresEmail}
        value={person.email}
        onChange={(v) => onChange({ ...person, email: v })}
        errors={errors.email}
      />
    </>
  );
}

export type Choice<T extends string> = { value: T; label: string; hint?: string; tag?: string; disabled?: boolean };

/** Grupo de opções em cartões (radio nativo estilizado: teclado e leitor de tela funcionam sem código extra). */
export function ChoiceCards<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
  errors,
  columns = 2,
}: {
  name: string;
  legend: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: Choice<T>[];
  errors?: string[];
  columns?: 1 | 2 | 3;
}) {
  const groupId = useId();
  return (
    <fieldset className="grid gap-2 border-0 p-0" aria-describedby={errors?.length ? `${groupId}-erro` : undefined}>
      <legend className="mb-1 p-0 text-sm font-semibold">{legend}</legend>
      <div className={cn("grid gap-2.5", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-3")}>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border p-4 text-[15px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              value === o.value ? "border-primary bg-[#fbf7fa] shadow-[inset_0_0_0_1px_var(--purple)]" : "border-line-strong bg-white hover:bg-sand",
              o.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              className="mt-[3px] size-[18px] accent-[var(--purple)]"
            />
            <span className="grid gap-0.5">
              <span className={value === o.value ? "font-semibold" : "font-medium"}>
                {o.label}
                {o.tag ? <span className="ml-2 rounded-md bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">{o.tag}</span> : null}
              </span>
              {o.hint ? <span className="text-sm text-text-2">{o.hint}</span> : null}
            </span>
          </label>
        ))}
      </div>
      {errors?.length ? (
        <p id={`${groupId}-erro`} role="alert" className="text-sm text-destructive">
          {errors[0]}
        </p>
      ) : null}
    </fieldset>
  );
}

export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Não preencha este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}

export function SubmitRow({
  pending,
  label = "Confirmar inscrição",
  error,
  inline = false,
}: {
  pending: boolean;
  label?: string;
  error?: string | null;
  /** Botão com largura do conteúdo, alinhado à esquerda (formulários curtos do site). */
  inline?: boolean;
}) {
  return (
    <div className="grid gap-3">
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className={cn(
          "rounded-lg bg-primary font-semibold shadow-none hover:bg-purple-dark",
          inline ? "min-h-12 justify-self-start px-[22px] text-[15px]" : "min-h-[52px] text-base",
        )}
      >
        {pending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden /> Enviando…
          </>
        ) : (
          label
        )}
      </Button>
    </div>
  );
}

/** Cartão branco do formulário, como no design: borda fina, 12 px de raio. */
export function FormCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]", className)} {...props} />;
}
