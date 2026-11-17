"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ChoiceCards, FormSection, Honeypot, PersonFields, SubmitRow, TextInput, useRegistration, type Person, type SubmitOutcome } from "@/components/forms/shared";
import { PrivacyNotice } from "@/components/forms/PrivacyNotice";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PublicEvent } from "@/lib/events/queries";
import { formatCurrency } from "@/lib/format";
import type { FestaAvailability } from "@/lib/forms/availability";
import { festaConfigSchema } from "@/lib/forms/festa";

type Props = {
  event: PublicEvent;
  /** Calculada no servidor pela página do evento. */
  availability: FestaAvailability;
  onOutcome: (outcome: SubmitOutcome, person: Person) => void;
};

export function FestaForm({ event, availability: initialAvailability, onOutcome }: Props) {
  const config = useMemo(() => festaConfigSchema.parse(event.formConfig), [event.formConfig]);
  const reg = useRegistration(event);
  const [availability, setAvailability] = useState(initialAvailability);
  const [person, setPerson] = useState<Person>({ nome: "", telefone: "", email: "" });
  const [faixa, setFaixa] = useState<"12-17" | "18-35" | undefined>();
  const [tipo, setTipo] = useState<"membro" | "convidado" | undefined>();
  const [convidadoPor, setConvidadoPor] = useState("");
  const [observacao, setObservacao] = useState<"normal" | "nao_consigo">("normal");
  const [contribuicao, setContribuicao] = useState<"alimento" | "valor" | undefined>();
  const [itens, setItens] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [soldOut, setSoldOut] = useState<string[]>([]);
  const soldOutNotice = useRef<HTMLDivElement>(null);

  // Quem envia está no fim do formulário: leva o aviso para a tela.
  useEffect(() => {
    if (soldOut.length) soldOutNotice.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [soldOut]);

  const answers = {
    faixaEtaria: faixa,
    tipoParticipante: tipo,
    convidadoPor: tipo === "convidado" ? convidadoPor : undefined,
    observacao,
    tipoContribuicao: observacao === "normal" ? contribuicao : undefined,
    itens: observacao === "normal" && contribuicao === "alimento" ? itens : undefined,
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSoldOut([]);
    const outcome = await reg.submit(person, answers, website);
    if (outcome.kind === "sem_vagas") {
      // Atualiza a lista com o que sobrou e tira o que esgotou da seleção.
      setAvailability(outcome.disponibilidade);
      setSoldOut(outcome.itens);
      setItens((current) => current.filter((i) => !outcome.itens.includes(i)));
      if (outcome.itens.includes("Contribuição em valor")) setContribuicao(undefined);
      return;
    }
    onOutcome(outcome, person);
  }

  const err = reg.errors;
  const valueFull = availability.vagasContribuicao <= 0;
  const grouped = (["comida", "bebida"] as const).map((cat) => ({
    cat,
    label: cat === "comida" ? "Comidas" : "Bebidas",
    items: availability.itens.filter((i) => i.categoria === cat),
  }));

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-8 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <Honeypot value={website} onChange={setWebsite} />

      {soldOut.length ? (
        <div ref={soldOutNotice} role="alert" className="rounded-[10px] border border-[#ebddb4] bg-warning-tint p-4 text-sm text-warning">
          <p className="font-semibold">Alguém acabou de escolher: {soldOut.join(", ")}.</p>
          <p className="mt-1 text-text-2">A lista foi atualizada. Escolha outra opção e envie de novo.</p>
        </div>
      ) : null}

      <FormSection step={1} title="Seus dados">
        <PersonFields person={person} onChange={setPerson} errors={err} requiresEmail={false} />
        <ChoiceCards
          name="faixa"
          legend="Sua faixa etária"
          value={faixa}
          onChange={setFaixa}
          options={[
            { value: "12-17", label: "12 a 17 anos (Adolescente)" },
            { value: "18-35", label: "18 a 35 anos (Jovem)" },
          ]}
          errors={err.faixaEtaria}
        />
        <ChoiceCards
          name="tipo"
          legend="Você é"
          value={tipo}
          onChange={setTipo}
          options={[
            { value: "membro", label: "Sou membro da PIB" },
            { value: "convidado", label: "Sou convidado" },
          ]}
          errors={err.tipoParticipante}
        />
        {tipo === "convidado" ? (
          <TextInput name="convidadoPor" label="Quem te convidou?" required value={convidadoPor} onChange={setConvidadoPor} errors={err.convidadoPor} />
        ) : null}
      </FormSection>

      <FormSection step={2} title="Contribuição">
        <ChoiceCards
          name="observacao"
          legend="Observação"
          value={observacao}
          onChange={setObservacao}
          options={[
            { value: "normal", label: "Posso contribuir" },
            { value: "nao_consigo", label: "Não consigo contribuir agora", hint: "Sem problema, venha mesmo assim." },
          ]}
          errors={err.observacao}
        />

        {observacao === "normal" ? (
          <>
            <ChoiceCards
              name="contribuicao"
              legend="Como deseja contribuir?"
              value={contribuicao}
              onChange={setContribuicao}
              options={[
                { value: "alimento", label: "Levar alimento", hint: "Escolha os itens da lista" },
                {
                  value: "valor",
                  label: `Valor simbólico ${formatCurrency(config.valorContribuicaoCentavos)}`,
                  hint: valueFull ? "Vagas esgotadas" : `Contribuição em dinheiro · ${availability.vagasContribuicao} vaga(s)`,
                  disabled: valueFull,
                },
              ]}
              errors={err.tipoContribuicao}
            />

            {contribuicao === "alimento" ? (
              <fieldset className="grid gap-4 border-0 p-0" aria-describedby="itens-dica">
                <legend className="mb-1 p-0 text-sm font-semibold">Qual alimento você pode levar?</legend>
                <p id="itens-dica" className="text-xs text-text-3">
                  Os itens disponíveis são atualizados conforme as inscrições.
                </p>
                {grouped
                  .filter((g) => g.items.length)
                  .map((g) => (
                    <div key={g.cat} className="grid gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-3">{g.label}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {g.items.map((item) => {
                          const id = `item-${item.nome}`;
                          const out = item.restante <= 0;
                          return (
                            <div key={item.nome} className="flex min-h-12 items-center gap-3 rounded-lg border border-line-strong bg-white px-3">
                              <Checkbox
                                id={id}
                                disabled={out}
                                checked={itens.includes(item.nome)}
                                onCheckedChange={(checked) =>
                                  setItens((cur) => (checked ? [...cur, item.nome] : cur.filter((n) => n !== item.nome)))
                                }
                              />
                              <Label htmlFor={id} className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-sm font-normal">
                                <span className={out ? "text-text-3 line-through" : ""}>{item.nome}</span>
                                <span className="text-xs text-text-3">{out ? "esgotado" : `${item.restante} disp.`}</span>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                {err.itens ? (
                  <p role="alert" className="text-sm text-destructive">
                    {err.itens[0]}
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
