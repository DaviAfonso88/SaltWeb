"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ChoiceCards,
  FormCard,
  FormSection,
  Honeypot,
  PersonFields,
  SelectInput,
  SubmitRow,
  TextInput,
  useRegistration,
  type Choice,
  type Person,
  type SubmitOutcome,
} from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PublicEvent } from "@/lib/events/queries";
import { formatCurrency } from "@/lib/format";
import type { FestaAvailability } from "@/lib/forms/availability";
import { AGE_BANDS, FESTA_CATEGORIES, festaConfigSchema } from "@/lib/forms/festa";
import { addCompanion, draftToAnswers, emptyDraft, takesItems, type FestaDraft } from "@/lib/forms/festa-draft";

type Props = {
  event: PublicEvent;
  /** Calculada no servidor pela página do evento. */
  availability: FestaAvailability;
  onOutcome: (outcome: SubmitOutcome, person: Person) => void;
};

/** Depois de uma recusa por falta: ajusta a escolha ao que ainda existe. */
function fitToAvailability(draft: FestaDraft, availability: FestaAvailability): FestaDraft {
  const itens = Object.fromEntries(
    Object.entries(draft.itens).flatMap(([nome, quantidade]) => {
      const restante = availability.itens.find((i) => i.nome === nome)?.restante ?? 0;
      return restante > 0 ? [[nome, Math.min(quantidade, restante)]] : [];
    }),
  );
  let { contribuicao } = draft;
  if (availability.vagasContribuicao <= 0) {
    if (contribuicao === "valor") contribuicao = undefined;
    if (contribuicao === "ambos") contribuicao = "alimento";
  }
  return { ...draft, itens, contribuicao };
}

function Stepper({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  const button = "size-11 rounded-lg border-line-strong bg-white shadow-none hover:bg-sand";
  return (
    <div role="group" aria-label={`Quantidade de ${label}`} className="flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" className={button} disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label={`Diminuir ${label}`}>
        <Minus aria-hidden />
      </Button>
      <output aria-live="polite" className="w-8 text-center text-base font-semibold tabular-nums">
        {value}
      </output>
      <Button type="button" variant="outline" size="icon" className={button} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`Aumentar ${label}`}>
        <Plus aria-hidden />
      </Button>
    </div>
  );
}

export function FestaForm({ event, availability: initialAvailability, onOutcome }: Props) {
  const config = useMemo(() => festaConfigSchema.parse(event.formConfig), [event.formConfig]);
  const reg = useRegistration(event);
  const [availability, setAvailability] = useState(initialAvailability);
  const [person, setPerson] = useState<Person>({ nome: "", telefone: "", email: "" });
  // Sem pagamento não há o que escolher: quem contribui leva itens.
  const [draft, setDraft] = useState<FestaDraft>(() => ({ ...emptyDraft(), contribuicao: config.aceitaValor ? undefined : "alimento" }));
  const [website, setWebsite] = useState("");
  const [shortage, setShortage] = useState<string[]>([]);
  const shortageNotice = useRef<HTMLDivElement>(null);
  const patch = (next: Partial<FestaDraft>) => setDraft((d) => ({ ...d, ...next }));

  // Quem envia está no fim do formulário: leva o aviso para a tela.
  useEffect(() => {
    if (shortage.length) shortageNotice.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [shortage]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShortage([]);
    const outcome = await reg.submit(person, draftToAnswers(draft), website);
    if (outcome.kind === "sem_vagas") {
      setAvailability(outcome.disponibilidade);
      setShortage(outcome.itens);
      setDraft((d) => fitToAvailability(d, outcome.disponibilidade));
      return;
    }
    onOutcome(outcome, person);
  }

  const err = reg.errors;
  const spots = availability.vagasParticipantes;

  if (spots !== null && spots <= 0) {
    return (
      <FormCard role="status">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.015em]">Vagas esgotadas</h2>
        <p className="mt-2 text-text-2">Todas as vagas deste evento já foram preenchidas.</p>
      </FormCard>
    );
  }

  const people = 1 + draft.acompanhantes.length;
  const maxCompanions = spots === null ? config.maxAcompanhantes : Math.min(config.maxAcompanhantes, spots - 1);
  const hasCompanionStep = config.maxAcompanhantes > 0;
  const ageOptions = AGE_BANDS.filter((b) => config.faixasEtarias.includes(b.id)).map((b) => ({ value: b.id as string, label: b.label }));

  const price = config.valorContribuicaoCentavos;
  const valueFull = availability.vagasContribuicao <= 0;
  const valueLabel = `${formatCurrency(price)}${config.valorPorPessoa ? " por pessoa" : ""}`;
  const totalHint = config.valorPorPessoa && people > 1 ? `Total para ${people} pessoas: ${formatCurrency(price * people)}` : null;
  const contributionOptions: Choice<"alimento" | "valor" | "ambos">[] = [
    { value: "alimento", label: "Levar itens", hint: "Escolha na lista" },
    {
      value: "valor",
      label: `Valor simbólico ${valueLabel}`,
      hint: valueFull ? "Vagas esgotadas" : (totalHint ?? `Contribuição em dinheiro · ${availability.vagasContribuicao} vaga(s)`),
      disabled: valueFull,
    },
  ];
  if (config.itens.length && config.vagasContribuicao > 0) {
    contributionOptions.push({
      value: "ambos",
      label: "Os dois",
      hint: valueFull ? "Vagas em dinheiro esgotadas" : `Levar itens e contribuir com ${valueLabel}`,
      disabled: valueFull,
    });
  }

  const grouped = FESTA_CATEGORIES.map((cat) => ({
    ...cat,
    items: availability.itens.map((item, index) => ({ ...item, index })).filter((i) => i.categoria === cat.id),
  })).filter((g) => g.items.length);
  const itemsError = err.itens?.[0] ?? Object.entries(err).find(([key]) => key.startsWith("quantidades"))?.[1][0];

  function toggleItem(nome: string, checked: boolean) {
    setDraft((d) => {
      const itens = { ...d.itens };
      if (checked) itens[nome] = 1;
      else delete itens[nome];
      return { ...d, itens };
    });
  }

  const setCompanion = (id: number, next: Partial<FestaDraft["acompanhantes"][number]>) =>
    setDraft((d) => ({ ...d, acompanhantes: d.acompanhantes.map((c) => (c.id === id ? { ...c, ...next } : c)) }));

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-8 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <Honeypot value={website} onChange={setWebsite} />

      {shortage.length ? (
        <div ref={shortageNotice} role="alert" className="rounded-[10px] border border-[#ebddb4] bg-warning-tint p-4 text-sm text-warning">
          <p className="font-semibold">Não há mais o suficiente de: {shortage.join(", ")}.</p>
          <p className="mt-1 text-text-2">
            {spots !== null && spots < people ? `Restam ${spots} vaga(s) no evento. ` : ""}A lista foi atualizada. Confira sua escolha e envie de novo.
          </p>
        </div>
      ) : null}

      <FormSection step={1} title="Seus dados">
        <PersonFields person={person} onChange={setPerson} errors={err} requiresEmail={false} />
        <ChoiceCards name="faixa" legend="Sua faixa etária" value={draft.faixa} onChange={(faixa) => patch({ faixa })} options={ageOptions} errors={err.faixaEtaria} />
        <ChoiceCards
          name="tipo"
          legend="Você é"
          value={draft.tipo}
          onChange={(tipo) => patch({ tipo })}
          options={[
            { value: "membro", label: "Sou membro da PIB" },
            { value: "convidado", label: "Sou convidado" },
          ]}
          errors={err.tipoParticipante}
        />
        {draft.tipo === "convidado" ? (
          <TextInput name="convidadoPor" label="Quem te convidou?" required value={draft.convidadoPor} onChange={(convidadoPor) => patch({ convidadoPor })} errors={err.convidadoPor} />
        ) : null}
      </FormSection>

      {hasCompanionStep ? (
        <FormSection
          step={2}
          title="Acompanhantes"
          description={`Vai levar alguém? Inclua até ${config.maxAcompanhantes} pessoa(s) na sua inscrição.${spots !== null ? ` Vagas restantes no evento: ${spots}.` : ""}`}
        >
          {draft.acompanhantes.map((c, i) => (
            <div key={c.id} role="group" aria-label={`Acompanhante ${i + 1}`} className="grid gap-4 rounded-[10px] bg-sand p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Acompanhante {i + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="min-h-11 rounded-lg text-destructive hover:bg-white hover:text-destructive"
                  onClick={() => setDraft((d) => ({ ...d, acompanhantes: d.acompanhantes.filter((x) => x.id !== c.id) }))}
                >
                  <Trash2 aria-hidden /> Remover<span className="sr-only"> acompanhante {i + 1}</span>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput name={`acompanhante-${c.id}`} label="Nome completo" required value={c.nome} onChange={(nome) => setCompanion(c.id, { nome })} errors={err[`acompanhantes.${i}.nome`]} />
                <SelectInput
                  name={`acompanhante-faixa-${c.id}`}
                  label="Faixa etária"
                  value={c.faixa}
                  onChange={(faixa) => setCompanion(c.id, { faixa })}
                  options={ageOptions}
                  placeholder="Selecione"
                  errors={err[`acompanhantes.${i}.faixaEtaria`]}
                />
              </div>
            </div>
          ))}
          {draft.acompanhantes.length < maxCompanions ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-12 justify-self-start rounded-lg border-line-strong bg-white px-[22px] text-[15px] font-semibold shadow-none hover:bg-sand"
              onClick={() => setDraft(addCompanion)}
            >
              <Plus aria-hidden /> Adicionar acompanhante
            </Button>
          ) : null}
          {err.acompanhantes ? (
            <p role="alert" className="text-sm text-destructive">
              {err.acompanhantes[0]}
            </p>
          ) : null}
        </FormSection>
      ) : null}

      <FormSection step={hasCompanionStep ? 3 : 2} title="Contribuição">
        <ChoiceCards
          name="observacao"
          legend="Observação"
          value={draft.observacao}
          onChange={(observacao) => patch({ observacao })}
          options={[
            { value: "normal", label: "Posso contribuir" },
            { value: "nao_consigo", label: "Não consigo contribuir agora", hint: "Sem problema, venha mesmo assim." },
          ]}
          errors={err.observacao}
        />

        {draft.observacao === "normal" ? (
          <>
            {config.aceitaValor ? (
              <ChoiceCards
                name="contribuicao"
                legend="Como deseja contribuir?"
                value={draft.contribuicao}
                onChange={(contribuicao) => patch({ contribuicao })}
                options={contributionOptions}
                columns={contributionOptions.length === 3 ? 3 : 2}
                errors={err.tipoContribuicao}
              />
            ) : null}
            {draft.contribuicao === "ambos" && totalHint ? <p className="text-sm font-semibold">{totalHint}</p> : null}

            {takesItems(draft) ? (
              <fieldset className="grid gap-4 border-0 p-0" aria-describedby="itens-dica">
                <legend className="mb-1 p-0 text-sm font-semibold">O que você pode levar?</legend>
                <p id="itens-dica" className="text-xs text-text-3">
                  Marque os itens e ajuste a quantidade. A lista é atualizada conforme as inscrições.
                </p>
                {grouped.map((g) => (
                  <div key={g.id} className="grid gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-3">{g.plural}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {g.items.map((item) => {
                        const id = `item-${item.index}`;
                        const out = item.restante <= 0;
                        const quantity = draft.itens[item.nome];
                        return (
                          <div key={item.nome} className="grid content-start rounded-lg border border-line-strong bg-white px-3">
                            <div className="flex min-h-12 items-center gap-3">
                              <Checkbox id={id} disabled={out} checked={quantity !== undefined} onCheckedChange={(checked) => toggleItem(item.nome, checked === true)} />
                              <Label htmlFor={id} className="flex min-h-11 flex-1 cursor-pointer items-center justify-between gap-2 text-sm font-normal">
                                <span className={out ? "text-text-3 line-through" : ""}>{item.nome}</span>
                                <span className="shrink-0 text-xs text-text-3">{out ? "esgotado" : `${item.restante} disp.`}</span>
                              </Label>
                            </div>
                            {quantity !== undefined && item.restante > 1 ? (
                              <div className="flex items-center justify-between gap-3 border-t border-line py-2">
                                <span className="text-sm text-text-2" aria-hidden>
                                  Quantidade
                                </span>
                                <Stepper
                                  label={item.nome}
                                  value={quantity}
                                  max={item.restante}
                                  onChange={(n) => setDraft((d) => ({ ...d, itens: { ...d.itens, [item.nome]: n } }))}
                                />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {itemsError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {itemsError}
                  </p>
                ) : null}
              </fieldset>
            ) : null}
          </>
        ) : null}
      </FormSection>

      <PrivacyNotice />
      <SubmitRow pending={reg.pending} error={reg.formError} />
    </form>
  );
}
