"use client";

import { useMemo, useRef, useState } from "react";

import { emptyGuardian, emptyHealth, FichaNotice, GuardiansSection, HealthSection, type GuardianState, type HealthState } from "@/components/forms/FichaAcampamento";
import { Honeypot, ChoiceCards, FormSection, PersonFields, SubmitRow, TextInput, focusFirstError, useRegistration, type Errors, type Person, type SubmitOutcome } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import type { PublicEvent } from "@/lib/events/queries";
import { calculateAge, formatCurrency, formatDate, todayInSaoPaulo } from "@/lib/format";
import { acampamentoConfigSchema, acampamentoModel, currentLot } from "@/lib/forms/acampamento";
import { isMinor, parseFicha } from "@/lib/forms/ficha";

type Props = { event: PublicEvent; onOutcome: (outcome: SubmitOutcome, person: Person) => void };

type Dupla = "nao" | "irmao" | "conjuge";
type Plano = "avista" | "carne" | "credito";

export function AcampamentoForm({ event, onOutcome }: Props) {
  const config = useMemo(() => acampamentoConfigSchema.parse(event.formConfig), [event.formConfig]);
  const reg = useRegistration(event);
  const [person, setPerson] = useState<Person>({ nome: "", telefone: "", email: "" });
  const [dataNascimento, setDataNascimento] = useState("");
  const [igreja, setIgreja] = useState("");
  const [cidade, setCidade] = useState("");
  const [dupla, setDupla] = useState<Dupla>("nao");
  const [nomeDupla, setNomeDupla] = useState("");
  const [plano, setPlano] = useState<Plano>("avista");
  const [forma, setForma] = useState<"pix" | "dinheiro">("pix");
  const [website, setWebsite] = useState("");
  const [health, setHealth] = useState<HealthState>(emptyHealth);
  const [guardians, setGuardians] = useState<GuardianState[]>(() => [emptyGuardian()]);
  const formRef = useRef<HTMLFormElement>(null);

  /** O erro de um campo some assim que a pessoa o altera (o formulário é longo; erro velho confunde). */
  const clearErrors = (...keys: string[]) =>
    reg.setErrors((prev) => {
      if (!keys.some((k) => k in prev)) return prev;
      const next = { ...prev };
      for (const k of keys) delete next[k];
      return next;
    });
  const changed = <T extends object>(prev: T, next: T) => (Object.keys(next) as (keyof T)[]).filter((k) => prev[k] !== next[k]).map(String);
  const withClear = <V,>(setter: (v: V) => void, ...keys: string[]) => (v: V) => {
    clearErrors(...keys);
    setter(v);
  };

  const today = todayInSaoPaulo();
  const lot = currentLot(config, today);
  const people = dupla === "nao" ? 1 : 2;

  // Menor de 18 anos: o responsável passa a ser obrigatório (o servidor confere a idade de novo).
  const validBirth = /^\d{4}-\d{2}-\d{2}$/.test(dataNascimento) && dataNascimento >= "1900-01-01" && dataNascimento <= today;
  const age = validBirth ? calculateAge(dataNascimento) : null;
  const minor = age !== null && isMinor(age);
  // Passos numerados na ordem em que aparecem.
  const guardiansStep = 2;
  const dupleStep = minor ? 3 : 2;
  const paymentStep = dupleStep + 1;
  const healthStep = paymentStep + 1;

  const answers = {
    dataNascimento,
    igreja,
    cidade,
    dupla,
    nomeDupla: dupla === "nao" ? undefined : nomeDupla,
    quantidadePessoas: people,
    plano,
    formaPagamento: plano === "avista" ? forma : plano === "credito" ? "cartao" : undefined,
  };

  // Prévia do valor com as mesmas regras do servidor (o servidor recalcula no envio).
  const preview = (() => {
    try {
      return acampamentoModel.price(config, answers as never, today);
    } catch {
      return null;
    }
  })();
  const discountCents = preview ? preview.valorOriginalCentavos - preview.valorFinalCentavos : 0;
  const discountLabel =
    dupla !== "nao" ? `Desconto dupla (${config.descontoDuplaPct}%)` : plano === "avista" && forma === "dinheiro" ? `Desconto dinheiro (${config.descontoDinheiroPct}%)` : plano === "avista" ? `Desconto Pix (${config.descontoPixPct}%)` : "Desconto";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ficha = parseFicha({ saude: health, responsaveis: minor ? guardians : [], extras: health.extras }, minor, config.ficha.extras);
    const fichaErrors: Errors = {};
    if (!ficha.success) {
      for (const issue of ficha.error.issues) {
        const key = issue.path.join(".") || "_";
        (fichaErrors[key] ??= []).push(issue.message);
      }
    }
    const outcome = await reg.submit(person, answers, website, {
      body: { saude: health, responsaveis: minor ? guardians : undefined, extras: health.extras },
      errors: fichaErrors,
    });
    if (outcome.kind === "invalid") setTimeout(() => focusFirstError(formRef.current), 50);
    onOutcome(outcome, person);
  }

  const err = reg.errors;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative flex flex-wrap items-start gap-6">
      <Honeypot value={website} onChange={setWebsite} />

      <div className="grid min-w-0 flex-[999_1_560px] gap-9 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <FormSection step={1} title="Dados pessoais">
        <PersonFields
          person={person}
          onChange={(next) => {
            clearErrors(...changed(person, next));
            setPerson(next);
          }}
          errors={err}
          requiresEmail
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            name="dataNascimento"
            label="Data de nascimento"
            type="date"
            min="1900-01-01"
            max={today}
            autoComplete="bday"
            required
            value={dataNascimento}
            onChange={withClear(setDataNascimento, "dataNascimento")}
            errors={err.dataNascimento}
          />
          <TextInput name="igreja" label="Igreja" required value={igreja} onChange={withClear(setIgreja, "igreja")} errors={err.igreja} />
          <TextInput name="cidade" label="Cidade" required value={cidade} onChange={withClear(setCidade, "cidade")} errors={err.cidade} />
        </div>
      </FormSection>

      {minor ? <GuardiansSection
          step={guardiansStep}
          value={guardians}
          onChange={(next) => {
            const keys = next.flatMap((g, i) => (guardians[i] ? changed(guardians[i], g).map((k) => `responsaveis.${i}.${k}`) : []));
            clearErrors("responsaveis", ...keys);
            setGuardians(next);
          }}
          errors={err}
        /> : null}

      <FormSection step={dupleStep} title="Inscrição em dupla" description={`Cônjuges ou irmãos ganham ${config.descontoDuplaPct}% de desconto no total.`}>
        <ChoiceCards<Dupla>
          name="dupla"
          legend="Vai se inscrever com alguém?"
          value={dupla}
          onChange={withClear(setDupla, "dupla", "quantidadePessoas", "nomeDupla")}
          columns={3}
          options={[
            { value: "nao", label: "Não, só eu" },
            { value: "conjuge", label: "Sim, com cônjuge" },
            { value: "irmao", label: "Sim, com irmão(ã)" },
          ]}
          errors={err.dupla}
        />
        {dupla !== "nao" ? (
          <TextInput name="nomeDupla" label="Nome da dupla" required value={nomeDupla} onChange={withClear(setNomeDupla, "nomeDupla")} errors={err.nomeDupla} />
        ) : null}
      </FormSection>

      <FormSection step={paymentStep} title="Pagamento">
        <ChoiceCards<Plano>
          name="plano"
          legend="Como prefere pagar?"
          value={plano}
          onChange={withClear(setPlano, "plano", "formaPagamento")}
          columns={3}
          options={[
            { value: "avista", label: "À vista", hint: "Pix ou dinheiro, com desconto" },
            ...(config.permitirCredito ? [{ value: "credito" as const, label: "Cartão de crédito", hint: "Sem desconto" }] : []),
            ...(config.parcelasCarne > 0 ? [{ value: "carne" as const, label: "Carnê SALT", hint: `Em ${config.parcelasCarne}x mensais` }] : []),
          ]}
          errors={err.plano}
        />
        {plano === "avista" ? (
          <ChoiceCards<"pix" | "dinheiro">
            name="forma"
            legend="Forma de pagamento à vista"
            value={forma}
            onChange={withClear(setForma, "formaPagamento")}
            options={[
              { value: "pix", label: "Pix", tag: `${config.descontoPixPct}% OFF` },
              { value: "dinheiro", label: "Dinheiro", tag: `${config.descontoDinheiroPct}% OFF` },
            ]}
            errors={err.formaPagamento}
          />
        ) : null}
        <p className="text-xs text-text-3">Descontos não são acumulativos: vale o maior que se aplica.</p>
      </FormSection>

      <HealthSection
        step={healthStep}
        value={health}
        onChange={(next) => {
          const keys = changed(health, next).flatMap((k) => {
            if (k === "extras") return Object.keys({ ...health.extras, ...next.extras }).filter((id) => health.extras[id] !== next.extras[id]).map((id) => `extras.${id}`);
            return k === "outrasCondicoes" || k === "condicoes" ? ["saude.condicoes", `saude.${k}`] : [`saude.${k}`];
          });
          clearErrors(...keys);
          setHealth(next);
        }}
        errors={err}
        ficha={config.ficha}
      />

      </div>

      <aside aria-labelledby="resumo-titulo" className="flex min-w-0 flex-[1_1_320px] flex-col gap-[18px] rounded-xl border border-line bg-white p-7 lg:sticky lg:top-24">
        <h3 id="resumo-titulo" className="font-display text-[19px] font-semibold tracking-[-0.01em]">
          Resumo da inscrição
        </h3>
        <dl className="flex flex-col text-[15px]">
          <div className="flex justify-between gap-4 border-b border-[#eeebe6] py-2.5">
            <dt className="text-text-2">Lote vigente</dt>
            <dd className="font-semibold">
              {lot.rotulo} · até {formatDate(`${lot.validoAte}T12:00:00Z`)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eeebe6] py-2.5">
            <dt className="text-text-2">Valor por pessoa</dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(lot.valorCentavos)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eeebe6] py-2.5">
            <dt className="text-text-2">Participantes</dt>
            <dd className="font-semibold">{people === 1 ? "1 pessoa" : "2 pessoas"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#eeebe6] py-2.5">
            <dt className="text-text-2">{discountLabel}</dt>
            <dd className="font-semibold tabular-nums text-success">{discountCents > 0 ? `− ${formatCurrency(discountCents)}` : "—"}</dd>
          </div>
        </dl>
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-semibold">Total</span>
          <span className="font-display text-[30px] font-semibold tracking-[-0.02em] tabular-nums">
            {preview ? formatCurrency(preview.valorFinalCentavos) : "—"}
          </span>
        </div>
        {plano === "carne" && preview?.parcelas.length ? (
          <p className="-mt-2.5 text-right text-[15px] text-text-2">
            Carnê: {preview.parcelas.length}x de {formatCurrency(preview.parcelas[0].valorCentavos)}
          </p>
        ) : null}
        {plano === "credito" && preview && preview.parcelas.length > 1 ? (
          <p className="-mt-2.5 text-right text-[15px] text-text-2">
            Cartão: {preview.parcelas.length}x de {formatCurrency(preview.parcelas[0].valorCentavos)}
          </p>
        ) : null}
        <PrivacyNotice />
        <FichaNotice />
        <SubmitRow pending={reg.pending} error={reg.formError} />
        <p className="text-center text-[13px] text-text-3">O valor final é confirmado no envio, pelo lote vigente nesse momento.</p>
      </aside>
    </form>
  );
}
