"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError, FormError } from "@/components/painel/FieldError";
import { TextField } from "@/components/painel/TextField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { AGE_BANDS, FESTA_CATEGORIES, type FestaAvailability, type FestaConfig } from "@/lib/forms/festa";
import { addCompanion, draftToAnswers, emptyDraft, paysValue, takesItems, type FestaDraft } from "@/lib/forms/festa-draft";
import { createFestaRegistration, updateFestaRegistration } from "@/lib/registrations/actions";

type Props = {
  config: FestaConfig;
  /** Na edição, calculada sem contar a própria inscrição. */
  availability: FestaAvailability;
  cancelHref: string;
} & ({ mode: "criar"; eventId: string } | { mode: "editar"; registrationId: string; initial: FestaDraft });

type Errors = Record<string, string[]>;

const card = "grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6";
const selectClass = "min-h-11 w-full rounded-xl border border-input bg-card px-3 text-sm aria-invalid:border-destructive";

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
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  errors?: string[];
}) {
  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={name} className="text-sm font-semibold">
        {label}
      </Label>
      <select
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? `${name}-erro` : undefined}
        className={selectClass}
      >
        <option value="">Selecione</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={`${name}-erro`} errors={errors} />
    </div>
  );
}

export function FestaRegistrationForm(props: Props) {
  const { config, availability, cancelHref } = props;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Itens renomeados ou removidos do formulário não podem ser salvos de novo.
  const listed = new Set(config.itens.map((i) => i.nome));
  const removed = props.mode === "editar" ? Object.keys(props.initial.itens).filter((n) => !listed.has(n)) : [];
  const [draft, setDraft] = useState<FestaDraft>(() => {
    if (props.mode === "criar") return emptyDraft();
    return { ...props.initial, itens: Object.fromEntries(Object.entries(props.initial.itens).filter(([n]) => listed.has(n))) };
  });
  const [person, setPerson] = useState({ nome: "", telefone: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const patch = (next: Partial<FestaDraft>) => setDraft((d) => ({ ...d, ...next }));

  const ageOptions = AGE_BANDS.filter((b) => config.faixasEtarias.includes(b.id)).map((b) => ({ value: b.id as string, label: b.label }));
  const people = 1 + draft.acompanhantes.length;
  const value = config.valorContribuicaoCentavos * (config.valorPorPessoa ? people : 1);
  const choice = draft.observacao === "nao_consigo" ? "nenhuma" : (draft.contribuicao ?? "");
  // Pagamento aparece se o evento oferece ou se esta inscrição já tinha.
  const showValue =
    config.aceitaValor || (props.mode === "editar" && (props.initial.contribuicao === "valor" || props.initial.contribuicao === "ambos"));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setFormError(undefined);
    startTransition(async () => {
      const answers = draftToAnswers(draft);
      if (props.mode === "criar") {
        const result = await createFestaRegistration(props.eventId, { ...person, email: person.email || undefined, respostas: answers });
        if (!result.ok) return showError(result.error, result.fieldErrors);
        toast.success(result.message ?? "Inscrição criada.");
        router.push(`/painel/inscricoes/${result.data!.id}`);
      } else {
        const result = await updateFestaRegistration(props.registrationId, answers);
        if (!result.ok) return showError(result.error, result.fieldErrors);
        toast.success(result.message ?? "Inscrição atualizada.");
        router.push(`/painel/inscricoes/${props.registrationId}`);
      }
    });
  }

  function showError(message: string, fieldErrors?: Errors) {
    setFormError(message);
    setErrors(fieldErrors ?? {});
  }

  const setCompanion = (id: number, next: Partial<FestaDraft["acompanhantes"][number]>) =>
    setDraft((d) => ({ ...d, acompanhantes: d.acompanhantes.map((c) => (c.id === id ? { ...c, ...next } : c)) }));

  function setQuantity(nome: string, quantity: number) {
    setDraft((d) => {
      const itens = { ...d.itens };
      if (quantity > 0) itens[nome] = quantity;
      else delete itens[nome];
      return { ...d, itens };
    });
  }

  const itemsError = errors.itens?.[0] ?? Object.entries(errors).find(([key]) => key.startsWith("quantidades"))?.[1][0];

  return (
    <form onSubmit={onSubmit} noValidate className="grid max-w-3xl gap-6">
      {removed.length ? (
        <p role="status" className="rounded-2xl bg-warning-tint p-4 text-sm">
          Estes itens saíram do formulário do evento e serão retirados desta inscrição ao salvar: <strong>{removed.join(", ")}</strong>.
        </p>
      ) : null}

      <section aria-labelledby="pessoa-titulo" className={card}>
        <h2 id="pessoa-titulo" className="font-display text-lg font-semibold">
          {props.mode === "criar" ? "Quem vai" : "Participante"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {props.mode === "criar" ? (
            <>
              <TextField name="nome" label="Nome completo" value={person.nome} onChange={(e) => setPerson({ ...person, nome: e.target.value })} errors={errors.nome} wrapperClassName="sm:col-span-2" />
              <TextField name="telefone" label="Telefone (WhatsApp)" type="tel" inputMode="tel" placeholder="(31) 99999-0000" value={person.telefone} onChange={(e) => setPerson({ ...person, telefone: e.target.value })} errors={errors.telefone} />
              <TextField name="email" label="E-mail (opcional)" type="email" value={person.email} onChange={(e) => setPerson({ ...person, email: e.target.value })} errors={errors.email} />
            </>
          ) : null}
          <SelectField name="faixa" label="Faixa etária" value={draft.faixa ?? ""} onChange={(faixa) => patch({ faixa: faixa || undefined })} options={ageOptions} errors={errors.faixaEtaria} />
          <SelectField
            name="tipo"
            label="Vínculo"
            value={draft.tipo ?? ""}
            onChange={(tipo) => patch({ tipo: (tipo || undefined) as FestaDraft["tipo"] })}
            options={[
              { value: "membro", label: "Membro da PIB" },
              { value: "convidado", label: "Convidado" },
            ]}
            errors={errors.tipoParticipante}
          />
          {draft.tipo === "convidado" ? (
            <TextField name="convidadoPor" label="Quem convidou" value={draft.convidadoPor} onChange={(e) => patch({ convidadoPor: e.target.value })} errors={errors.convidadoPor} wrapperClassName="sm:col-span-2" />
          ) : null}
        </div>
      </section>

      {config.maxAcompanhantes > 0 || draft.acompanhantes.length ? (
        <section aria-labelledby="acompanhantes-titulo" className={card}>
          <div>
            <h2 id="acompanhantes-titulo" className="font-display text-lg font-semibold">
              Acompanhantes
            </h2>
            <p className="text-sm text-text-2">
              Até {config.maxAcompanhantes} por inscrição.
              {availability.vagasParticipantes !== null ? ` Cabem ${availability.vagasParticipantes} pessoa(s) no evento, contando quem está nesta inscrição.` : ""}
            </p>
          </div>
          {draft.acompanhantes.map((c, i) => (
            <div key={c.id} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_15rem_auto] sm:items-end">
              <TextField name={`acompanhante-${c.id}`} label={`Nome do acompanhante ${i + 1}`} value={c.nome} onChange={(e) => setCompanion(c.id, { nome: e.target.value })} errors={errors[`acompanhantes.${i}.nome`]} />
              <SelectField name={`acompanhante-faixa-${c.id}`} label="Faixa etária" value={c.faixa} onChange={(faixa) => setCompanion(c.id, { faixa })} options={ageOptions} errors={errors[`acompanhantes.${i}.faixaEtaria`]} />
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 text-destructive"
                aria-label={`Remover acompanhante ${i + 1}`}
                onClick={() => setDraft((d) => ({ ...d, acompanhantes: d.acompanhantes.filter((x) => x.id !== c.id) }))}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>
          ))}
          {draft.acompanhantes.length < config.maxAcompanhantes ? (
            <Button type="button" variant="outline" className="min-h-11 w-fit rounded-full" onClick={() => setDraft(addCompanion)}>
              <Plus aria-hidden /> Adicionar acompanhante
            </Button>
          ) : null}
          <FieldError errors={errors.acompanhantes} />
        </section>
      ) : null}

      <section aria-labelledby="contribuicao-titulo" className={card}>
        <h2 id="contribuicao-titulo" className="font-display text-lg font-semibold">
          Contribuição
        </h2>
        <SelectField
          name="contribuicao"
          label="Como vai contribuir"
          value={choice}
          onChange={(next) =>
            patch(
              next === "nenhuma"
                ? { observacao: "nao_consigo", contribuicao: undefined }
                : { observacao: "normal", contribuicao: (next || undefined) as FestaDraft["contribuicao"] },
            )
          }
          options={[
            { value: "alimento", label: "Levar itens" },
            ...(showValue
              ? [
                  { value: "valor", label: "Pagamento" },
                  { value: "ambos", label: "Itens e pagamento" },
                ]
              : []),
            { value: "nenhuma", label: "Não consegue contribuir" },
          ]}
          errors={errors.tipoContribuicao ?? errors.observacao}
        />

        {paysValue(draft) ? (
          <p className="text-sm text-text-2">
            Valor: <strong className="text-foreground">{formatCurrency(value)}</strong>
            {config.valorPorPessoa ? ` (${people} pessoa(s))` : ""} · {availability.vagasContribuicao} vaga(s) para pagamento disponível(is).
          </p>
        ) : null}

        {takesItems(draft) ? (
          <fieldset className="grid gap-3 border-0 p-0">
            <legend className="mb-1 p-0 text-sm font-semibold">Quantidade de cada item (0 = não leva)</legend>
            {FESTA_CATEGORIES.map((category) => {
              const items = availability.itens.map((item, index) => ({ ...item, index })).filter((i) => i.categoria === category.id);
              if (!items.length) return null;
              return (
                <div key={category.id} className="grid gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-3">{category.plural}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {items.map((item) => (
                      <li key={item.nome} className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border px-3 py-1.5">
                        <Label htmlFor={`item-${item.index}`} className="grid flex-1 gap-0.5 text-sm font-medium">
                          {item.nome}
                          <span className="text-xs font-normal text-text-3">{item.restante} disponível(is)</span>
                        </Label>
                        <Input
                          id={`item-${item.index}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          className="min-h-11 w-20 rounded-xl bg-card"
                          value={draft.itens[item.nome] ?? 0}
                          onChange={(e) => setQuantity(item.nome, Math.max(0, Math.trunc(Number(e.target.value) || 0)))}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {!availability.itens.length ? <p className="text-sm text-text-3">O evento não tem itens cadastrados.</p> : null}
            <FieldError errors={itemsError ? [itemsError] : undefined} />
          </fieldset>
        ) : null}
      </section>

      <FormError message={formError} />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending} className="min-h-11 rounded-full px-6">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {props.mode === "criar" ? "Criar inscrição" : "Salvar alterações"}
        </Button>
        <Button asChild variant="outline" className="min-h-11 rounded-full">
          <Link href={cancelHref}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
