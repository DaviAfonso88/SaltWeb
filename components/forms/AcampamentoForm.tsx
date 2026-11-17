"use client";

import { useMemo, useState } from "react";

import { Honeypot, ChoiceCards, FormSection, PersonFields, SubmitRow, TextInput, useRegistration, type Person, type SubmitOutcome } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import type { PublicEvent } from "@/lib/events/queries";
import { formatCurrency, formatDate, todayInSaoPaulo } from "@/lib/format";
import { acampamentoConfigSchema, acampamentoModel, currentLot } from "@/lib/forms/acampamento";

type Props = { event: PublicEvent; onOutcome: (outcome: SubmitOutcome, person: Person) => void };

type Dupla = "nao" | "irmao" | "conjuge";
type Plano = "avista" | "carne" | "credito";

export function AcampamentoForm({ event, onOutcome }: Props) {
  const config = useMemo(() => acampamentoConfigSchema.parse(event.formConfig), [event.formConfig]);
  const reg = useRegistration(event);
  const [person, setPerson] = useState<Person>({ nome: "", telefone: "", email: "" });
  const [idade, setIdade] = useState("");
  const [igreja, setIgreja] = useState("");
  const [cidade, setCidade] = useState("");
  const [dupla, setDupla] = useState<Dupla>("nao");
  const [nomeDupla, setNomeDupla] = useState("");
  const [plano, setPlano] = useState<Plano>("avista");
  const [forma, setForma] = useState<"pix" | "dinheiro">("pix");
  const [website, setWebsite] = useState("");

  const today = todayInSaoPaulo();
  const lot = currentLot(config, today);
  const people = dupla === "nao" ? 1 : 2;

  const answers = {
    idade: Number(idade),
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
    const outcome = await reg.submit(person, answers, website);
    onOutcome(outcome, person);
  }

  const err = reg.errors;

  return (
    <form onSubmit={onSubmit} noValidate className="relative flex flex-wrap items-start gap-6">
      <Honeypot value={website} onChange={setWebsite} />

      <div className="grid min-w-0 flex-[999_1_560px] gap-9 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <FormSection step={1} title="Dados pessoais">
        <PersonFields person={person} onChange={setPerson} errors={err} requiresEmail />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput name="idade" label="Idade" type="number" inputMode="numeric" min={10} max={99} required value={idade} onChange={setIdade} errors={err.idade} />
          <TextInput name="igreja" label="Igreja" required value={igreja} onChange={setIgreja} errors={err.igreja} />
          <TextInput name="cidade" label="Cidade" required value={cidade} onChange={setCidade} errors={err.cidade} />
        </div>
      </FormSection>

      <FormSection step={2} title="Inscrição em dupla" description={`Cônjuges ou irmãos ganham ${config.descontoDuplaPct}% de desconto no total.`}>
        <ChoiceCards<Dupla>
          name="dupla"
          legend="Vai se inscrever com alguém?"
          value={dupla}
          onChange={setDupla}
          columns={3}
          options={[
            { value: "nao", label: "Não, só eu" },
            { value: "conjuge", label: "Sim, com cônjuge" },
            { value: "irmao", label: "Sim, com irmão(ã)" },
          ]}
          errors={err.dupla}
        />
        {dupla !== "nao" ? (
          <TextInput name="nomeDupla" label="Nome da dupla" required value={nomeDupla} onChange={setNomeDupla} errors={err.nomeDupla} />
        ) : null}
      </FormSection>

      <FormSection step={3} title="Pagamento">
        <ChoiceCards<Plano>
          name="plano"
          legend="Como prefere pagar?"
          value={plano}
          onChange={setPlano}
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
            onChange={setForma}
            options={[
              { value: "pix", label: "Pix", tag: `${config.descontoPixPct}% OFF` },
              { value: "dinheiro", label: "Dinheiro", tag: `${config.descontoDinheiroPct}% OFF` },
            ]}
            errors={err.formaPagamento}
          />
        ) : null}
        <p className="text-xs text-text-3">Descontos não são acumulativos: vale o maior que se aplica.</p>
      </FormSection>

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
        <PrivacyNotice />
        <SubmitRow pending={reg.pending} error={reg.formError} />
        <p className="text-center text-[13px] text-text-3">O valor final é confirmado no envio, pelo lote vigente nesse momento.</p>
      </aside>
    </form>
  );
}
