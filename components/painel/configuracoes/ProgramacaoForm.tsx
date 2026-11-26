"use client";

import { useId, useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError, FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";
import { saveProgramacao } from "@/lib/programacoes/actions";
import {
  describeSchedule,
  KIND_LABELS,
  KINDS,
  NTH_OPTIONS,
  WEEKDAY_OPTIONS,
  WHOLE_WEEK,
  type Schedule,
  type ScheduleKind,
} from "@/lib/programacoes/schedule";

const SELECT = "min-h-11 w-full rounded-xl border border-input bg-card px-3 text-sm";

function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  errors,
}: {
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  errors?: string[];
}) {
  const id = `${useId()}-${name}`;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <select id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-erro`} errors={errors} />
    </div>
  );
}

export type ProgramacaoCardData = {
  slug: string;
  titulo: string;
  schedule: Schedule;
  version: number;
};

export function ProgramacaoForm({ programacao }: { programacao: ProgramacaoCardData }) {
  const { slug, titulo, version } = programacao;
  const [draft, setDraft] = useState<Schedule>(programacao.schedule);
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();
  const [noTime, setNoTime] = useState(programacao.schedule.kind !== "personalizada" && !programacao.schedule.time);
  const noTimeId = useId();
  const set = <K extends keyof Schedule>(key: K, value: Schedule[K]) => setDraft((d) => ({ ...d, [key]: value }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await saveProgramacao(undefined, formData);
      setResult(r);
      if (r.ok) toast.success(r.message ?? "Salvo.");
    });
  }

  const errors = result && !result.ok ? result.fieldErrors : undefined;
  const preview = describeSchedule(noTime ? { ...draft, time: null } : draft);
  const headingId = `prog-${slug}`;

  return (
    <section aria-labelledby={headingId} className="rounded-2xl border border-border bg-card p-5">
      <h3 id={headingId} className="mb-4 text-lg font-semibold">
        {titulo}
      </h3>

      {/* `key` remonta o formulário quando a versão muda, mantendo o estado local em sincronia com o servidor. */}
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="version" value={version} />

        <SelectField
          name="kind"
          label="Frequência"
          value={draft.kind}
          onChange={(v) => set("kind", v as ScheduleKind)}
          options={KINDS.map((k) => ({ value: k, label: KIND_LABELS[k] }))}
          errors={errors?.kind}
        />

        {draft.kind === "personalizada" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              name="customDay"
              label="Dia (como aparece no site)"
              value={draft.customDay}
              onChange={(e) => set("customDay", e.target.value)}
              maxLength={80}
              placeholder="A combinar"
              errors={errors?.customDay}
            />
            <TextField
              name="customTime"
              label="Horário (opcional)"
              value={draft.customTime}
              onChange={(e) => set("customTime", e.target.value)}
              maxLength={60}
              placeholder="Horário flexível"
              errors={errors?.customTime}
            />
          </div>
        ) : (
          <div className="grid gap-3">
            <div className={`grid gap-4 ${draft.kind === "mensal" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {draft.kind === "mensal" ? (
                <SelectField
                  name="nth"
                  label="Semana do mês"
                  value={draft.nth}
                  onChange={(v) => set("nth", Number(v))}
                  options={NTH_OPTIONS}
                  errors={errors?.nth}
                />
              ) : null}
              <SelectField
                name="weekday"
                label="Dia da semana"
                value={draft.weekday}
                onChange={(v) => set("weekday", Number(v))}
                options={WEEKDAY_OPTIONS}
                errors={errors?.weekday}
              />
              <TextField
                name="time"
                label="Horário"
                type="time"
                value={noTime ? "" : (draft.time ?? "")}
                onChange={(e) => set("time", e.target.value)}
                disabled={noTime}
                required={!noTime}
                errors={noTime ? undefined : errors?.time}
              />
            </div>
            {draft.kind === "mensal" && draft.weekday === WHOLE_WEEK ? (
              <p className="text-xs text-text-3">
                Semana inteira vai de domingo a sábado: é a semana da sexta-feira escolhida em “Semana do mês”.
              </p>
            ) : null}
            <div className="flex min-h-11 items-center gap-3">
              <Checkbox id={noTimeId} name="noTime" checked={noTime} onCheckedChange={(checked) => setNoTime(checked === true)} />
              <Label htmlFor={noTimeId} className="flex min-h-11 flex-1 items-center text-sm font-normal">
                Não definir horário (o site mostra só o dia)
              </Label>
            </div>
          </div>
        )}

        <p className="rounded-xl bg-muted px-3 py-2.5 text-sm text-text-2" aria-live="polite">
          <span className="font-semibold text-foreground">No site: </span>
          {preview.long || "—"}
        </p>

        <FormError message={result && !result.ok && !result.fieldErrors ? result.error : undefined} />
        <SubmitButton disabled={pending} pendingLabel="Salvando…" className="rounded-full sm:w-fit">
          Salvar {titulo}
        </SubmitButton>
      </form>
    </section>
  );
}
