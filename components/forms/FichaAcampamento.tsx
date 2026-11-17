"use client";

import { HeartPulse, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useId } from "react";

import { ChoiceCards, FormSection, maskPhone, SelectInput, TextArea, TextInput, type Errors } from "@/components/forms/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BLOOD_TYPES, NOT_KNOWN, type PublicHealthInput } from "@/lib/forms/ficha";
import { fichaAviso, fichaTexto, type FichaConfig, type FichaTextKey } from "@/lib/forms/ficha-config";
import { HEALTH_CONDITIONS } from "@/lib/participants/import/aliases";

type YesNo = "" | "sim" | "nao";

/** Estado do formulário da ficha de saúde: as perguntas sim/não começam sem resposta de propósito. */
export type HealthState = Omit<PublicHealthInput, "tipoSanguineo" | "alergia" | "medicamento" | "condicao" | "alimentar" | "deficiencia" | "cuidadoEspecial" | "restricaoFisica" | "condicoes"> & {
  tipoSanguineo: string;
  alergia: YesNo;
  medicamento: YesNo;
  condicao: YesNo;
  alimentar: YesNo;
  deficiencia: YesNo;
  cuidadoEspecial: YesNo;
  restricaoFisica: YesNo;
  condicoes: string[];
  /** Respostas às perguntas extras do evento, por identificador. */
  extras: Record<string, string>;
};

export const emptyHealth = (): HealthState => ({
  tipoSanguineo: "",
  alergia: "",
  alergias: "",
  reacaoAlergia: "",
  medicacaoAlergia: "",
  medicamento: "",
  medicamentos: "",
  condicao: "",
  condicoes: [],
  outrasCondicoes: "",
  detalhesCondicoes: "",
  alimentar: "",
  restricoesAlimentares: "",
  deficiencia: "",
  qualDeficiencia: "",
  detalhesDeficiencia: "",
  cuidadoEspecial: "",
  detalhesCuidadoEspecial: "",
  restricaoFisica: "",
  restricoesFisicas: "",
  outrasInformacoes: "",
  extras: {},
});

export type GuardianState = {
  name: string;
  relationship: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  notes: string;
};

export const emptyGuardian = (): GuardianState => ({ name: "", relationship: "", phone: "", whatsapp: "", email: "", address: "", notes: "" });

const YES_NO = [
  { value: "sim" as const, label: "Sim" },
  { value: "nao" as const, label: "Não" },
];

function Question({
  name,
  legend,
  value,
  onChange,
  errors,
  children,
}: {
  name: string;
  legend: string;
  value: YesNo;
  onChange: (value: "sim" | "nao") => void;
  errors?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4">
      <ChoiceCards<"sim" | "nao"> name={name} legend={legend} value={value || undefined} onChange={onChange} options={YES_NO} errors={errors} columns={2} />
      {value === "sim" ? <div className="grid gap-4 rounded-lg border border-line bg-sand p-4 sm:p-5">{children}</div> : null}
    </div>
  );
}

/** Ficha de saúde (dado sensível): a inscrição só é concluída com todas as perguntas respondidas. */
export function HealthSection({
  step,
  value,
  onChange,
  errors,
  ficha,
}: {
  step: number;
  value: HealthState;
  onChange: (next: HealthState) => void;
  errors: Errors;
  /** Textos e perguntas extras configurados no evento. */
  ficha: FichaConfig;
}) {
  const set = <K extends keyof HealthState>(key: K, v: HealthState[K]) => onChange({ ...value, [key]: v });
  const err = (key: string) => errors[`saude.${key}`];
  const conditionsId = useId();
  const q = (key: FichaTextKey) => fichaTexto(ficha, key).pergunta;
  const hint = (key: FichaTextKey) => fichaTexto(ficha, key).dica;

  return (
    <FormSection step={step} title="Ficha de saúde" description="Obrigatória para concluir a inscrição. Responda todas as perguntas: se não houver nada a informar, marque “Não”.">
      <div className="flex gap-3 rounded-[10px] bg-sand p-4 text-sm text-text-2">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-purple" aria-hidden />
        <p>{fichaAviso(ficha)}</p>
      </div>

      <SelectInput
        name="saude.tipoSanguineo"
        label={q("tipoSanguineo")}
        value={value.tipoSanguineo}
        onChange={(v) => set("tipoSanguineo", v)}
        placeholder="Selecione"
        options={[...BLOOD_TYPES.map((t) => ({ value: t, label: t })), { value: NOT_KNOWN, label: "Não sei" }]}
        errors={err("tipoSanguineo")}
      />

      <Question name="saude.alergia" legend={q("alergia")} value={value.alergia} onChange={(v) => set("alergia", v)} errors={err("alergia")}>
        <TextArea name="saude.alergias" label={q("alergias")} hint={hint("alergias")} value={value.alergias ?? ""} onChange={(v) => set("alergias", v)} errors={err("alergias")} />
        <TextInput name="saude.reacaoAlergia" label={q("reacaoAlergia")} hint={hint("reacaoAlergia")} value={value.reacaoAlergia ?? ""} onChange={(v) => set("reacaoAlergia", v)} errors={err("reacaoAlergia")} />
        <TextInput
          name="saude.medicacaoAlergia"
          label={q("medicacaoAlergia")}
          hint={hint("medicacaoAlergia")}
          value={value.medicacaoAlergia ?? ""}
          onChange={(v) => set("medicacaoAlergia", v)}
          errors={err("medicacaoAlergia")}
        />
      </Question>

      <Question name="saude.medicamento" legend={q("medicamento")} value={value.medicamento} onChange={(v) => set("medicamento", v)} errors={err("medicamento")}>
        <TextArea
          name="saude.medicamentos"
          label={q("medicamentos")}
          hint={hint("medicamentos")}
          value={value.medicamentos ?? ""}
          onChange={(v) => set("medicamentos", v)}
          errors={err("medicamentos")}
        />
      </Question>

      <Question name="saude.condicao" legend={q("condicao")} value={value.condicao} onChange={(v) => set("condicao", v)} errors={err("condicao")}>
        <fieldset className="grid gap-2 border-0 p-0" data-invalid={err("condicoes")?.length ? "true" : undefined} aria-describedby={err("condicoes")?.length ? `${conditionsId}-erro` : undefined}>
          <legend className="mb-1 p-0 text-sm font-semibold">{q("condicoes")}</legend>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            {HEALTH_CONDITIONS.map((c) => {
              const id = `${conditionsId}-${c.value}`;
              const checked = value.condicoes.includes(c.label);
              return (
                <Label key={c.value} htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] font-normal">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(on) => set("condicoes", on === true ? [...value.condicoes, c.label] : value.condicoes.filter((x) => x !== c.label))}
                  />
                  {c.label}
                </Label>
              );
            })}
          </div>
          {err("condicoes")?.length ? (
            <p id={`${conditionsId}-erro`} role="alert" className="text-sm text-destructive">
              {err("condicoes")[0]}
            </p>
          ) : null}
        </fieldset>
        <TextArea name="saude.outrasCondicoes" label={q("outrasCondicoes")} hint={hint("outrasCondicoes")} value={value.outrasCondicoes ?? ""} onChange={(v) => set("outrasCondicoes", v)} errors={err("outrasCondicoes")} />
        <TextArea name="saude.detalhesCondicoes" label={q("detalhesCondicoes")} hint={hint("detalhesCondicoes")} value={value.detalhesCondicoes ?? ""} onChange={(v) => set("detalhesCondicoes", v)} errors={err("detalhesCondicoes")} />
      </Question>

      <Question name="saude.alimentar" legend={q("alimentar")} value={value.alimentar} onChange={(v) => set("alimentar", v)} errors={err("alimentar")}>
        <TextArea
          name="saude.restricoesAlimentares"
          label={q("restricoesAlimentares")}
          hint={hint("restricoesAlimentares")}
          value={value.restricoesAlimentares ?? ""}
          onChange={(v) => set("restricoesAlimentares", v)}
          errors={err("restricoesAlimentares")}
        />
      </Question>

      <Question name="saude.deficiencia" legend={q("deficiencia")} value={value.deficiencia} onChange={(v) => set("deficiencia", v)} errors={err("deficiencia")}>
        <TextInput name="saude.qualDeficiencia" label={q("qualDeficiencia")} hint={hint("qualDeficiencia")} value={value.qualDeficiencia ?? ""} onChange={(v) => set("qualDeficiencia", v)} errors={err("qualDeficiencia")} />
        <TextArea name="saude.detalhesDeficiencia" label={q("detalhesDeficiencia")} hint={hint("detalhesDeficiencia")} value={value.detalhesDeficiencia ?? ""} onChange={(v) => set("detalhesDeficiencia", v)} errors={err("detalhesDeficiencia")} />
      </Question>

      <Question name="saude.cuidadoEspecial" legend={q("cuidadoEspecial")} value={value.cuidadoEspecial} onChange={(v) => set("cuidadoEspecial", v)} errors={err("cuidadoEspecial")}>
        <TextArea
          name="saude.detalhesCuidadoEspecial"
          label={q("detalhesCuidadoEspecial")}
          hint={hint("detalhesCuidadoEspecial")}
          value={value.detalhesCuidadoEspecial ?? ""}
          onChange={(v) => set("detalhesCuidadoEspecial", v)}
          errors={err("detalhesCuidadoEspecial")}
        />
      </Question>

      <Question name="saude.restricaoFisica" legend={q("restricaoFisica")} value={value.restricaoFisica} onChange={(v) => set("restricaoFisica", v)} errors={err("restricaoFisica")}>
        <TextArea name="saude.restricoesFisicas" label={q("restricoesFisicas")} hint={hint("restricoesFisicas")} value={value.restricoesFisicas ?? ""} onChange={(v) => set("restricoesFisicas", v)} errors={err("restricoesFisicas")} />
      </Question>

      {ficha.extras.map((extra) => {
        const setExtra = (resposta: string) => set("extras", { ...value.extras, [extra.id]: resposta });
        const errors_ = errors[`extras.${extra.id}`];
        const label = extra.obrigatoria ? extra.pergunta : `${extra.pergunta} (opcional)`;
        return extra.tipo === "simnao" ? (
          <div key={extra.id} className="grid gap-2">
            <ChoiceCards<"sim" | "nao"> name={`extras.${extra.id}`} legend={label} value={(value.extras[extra.id] as "sim" | "nao" | undefined) || undefined} onChange={setExtra} options={YES_NO} errors={errors_} columns={2} />
            {extra.dica ? <p className="text-xs text-text-3">{extra.dica}</p> : null}
          </div>
        ) : (
          <TextArea key={extra.id} name={`extras.${extra.id}`} label={label} hint={extra.dica || undefined} value={value.extras[extra.id] ?? ""} onChange={setExtra} errors={errors_} />
        );
      })}

      <TextArea
        name="saude.outrasInformacoes"
        label={q("outrasInformacoes")}
        hint={hint("outrasInformacoes")}
        value={value.outrasInformacoes ?? ""}
        onChange={(v) => set("outrasInformacoes", v)}
        errors={err("outrasInformacoes")}
      />
    </FormSection>
  );
}

const MAX_GUARDIANS = 6;

/** Responsáveis: aparece só para menores de 18 anos, com os mesmos dados do cadastro do participante no painel. */
export function GuardiansSection({ step, value, onChange, errors }: { step: number; value: GuardianState[]; onChange: (next: GuardianState[]) => void; errors: Errors }) {
  const update = (i: number, patch: Partial<GuardianState>) => onChange(value.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  const rootError = errors.responsaveis;

  return (
    <FormSection step={step} title="Responsável" description="Como você tem menos de 18 anos, precisamos dos dados de um responsável. Cadastre pelo menos um.">
      {rootError?.length ? (
        <p role="alert" data-invalid="true" className="text-sm text-destructive">
          {rootError[0]}
        </p>
      ) : null}

      {value.map((g, i) => {
        const e = (field: string) => errors[`responsaveis.${i}.${field}`];
        return (
          <fieldset key={i} className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2 sm:p-5">
            <legend className="px-1 text-sm font-semibold">Responsável {i + 1}</legend>
            <TextInput name={`responsaveis.${i}.name`} label="Nome completo" autoComplete="off" required value={g.name} onChange={(v) => update(i, { name: v })} errors={e("name")} />
            <TextInput
              name={`responsaveis.${i}.relationship`}
              label="Parentesco"
              required
              placeholder="Mãe, pai, avó…"
              value={g.relationship}
              onChange={(v) => update(i, { relationship: v })}
              errors={e("relationship")}
            />
            <TextInput
              name={`responsaveis.${i}.phone`}
              label="Telefone"
              type="tel"
              inputMode="tel"
              required
              placeholder="(31) 99999-0000"
              value={g.phone}
              onChange={(v) => update(i, { phone: maskPhone(v) })}
              errors={e("phone")}
            />
            <TextInput
              name={`responsaveis.${i}.whatsapp`}
              label="WhatsApp (opcional)"
              type="tel"
              inputMode="tel"
              value={g.whatsapp}
              onChange={(v) => update(i, { whatsapp: maskPhone(v) })}
              errors={e("whatsapp")}
            />
            <TextInput name={`responsaveis.${i}.email`} label="E-mail (opcional)" type="email" value={g.email} onChange={(v) => update(i, { email: v })} errors={e("email")} />
            <TextInput name={`responsaveis.${i}.address`} label="Endereço (opcional)" value={g.address} onChange={(v) => update(i, { address: v })} errors={e("address")} />
            <div className="sm:col-span-2">
              <TextInput name={`responsaveis.${i}.notes`} label="Observações (opcional)" value={g.notes} onChange={(v) => update(i, { notes: v })} errors={e("notes")} />
            </div>
            {value.length > 1 ? (
              <div className="sm:col-span-2">
                <Button type="button" variant="ghost" className="min-h-11 text-destructive hover:text-destructive" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                  <Trash2 aria-hidden /> Remover responsável {i + 1}
                </Button>
              </div>
            ) : null}
          </fieldset>
        );
      })}

      {value.length < MAX_GUARDIANS ? (
        <div>
          <Button type="button" variant="outline" className="min-h-11 rounded-lg" onClick={() => onChange([...value, emptyGuardian()])}>
            <Plus aria-hidden /> Adicionar outro responsável
          </Button>
        </div>
      ) : null}
    </FormSection>
  );
}

/** Selo curto usado no resumo lateral. */
export function FichaNotice() {
  return (
    <p className="flex items-start gap-2 text-[13px] text-text-3">
      <HeartPulse className="mt-0.5 size-4 shrink-0" aria-hidden />A inscrição só é concluída com a ficha de saúde preenchida.
    </p>
  );
}
