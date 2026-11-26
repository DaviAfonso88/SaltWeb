"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AGE_BANDS, FESTA_CATEGORIES, MAX_COMPANIONS, type AgeBand, type FestaCategoria, type FestaConfig } from "@/lib/forms/festa";

import { ConfigErrors, MoneyField, NumberField, type ConfigEditorProps } from "./fields";

export function FestaConfigEditor({ value, onChange, errors, disabled }: ConfigEditorProps<FestaConfig>) {
  const set = (patch: Partial<FestaConfig>) => onChange({ ...value, ...patch });
  const setItem = (index: number, patch: Partial<FestaConfig["itens"][number]>) =>
    set({ itens: value.itens.map((it, i) => (i === index ? { ...it, ...patch } : it)) });
  // Eventos salvos antes destes campos existirem não os têm.
  const bands: AgeBand[] = value.faixasEtarias ?? ["12-17", "18-35"];
  const acceptsValue = value.aceitaValor ?? true;
  const toggleBand = (id: AgeBand, checked: boolean) =>
    set({ faixasEtarias: AGE_BANDS.map((b) => b.id).filter((b) => (b === id ? checked : bands.includes(b))) });

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-3 sm:grid-cols-2" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Participantes</legend>
        <NumberField
          id="festa-limite"
          label="Limite de participantes"
          value={value.limiteParticipantes ?? 0}
          onChange={(n) => set({ limiteParticipantes: Math.trunc(n) })}
          hint="Total de pessoas, contando acompanhantes. 0 = sem limite."
        />
        <NumberField
          id="festa-acompanhantes"
          label="Acompanhantes por inscrição"
          max={MAX_COMPANIONS}
          value={value.maxAcompanhantes ?? 0}
          onChange={(n) => set({ maxAcompanhantes: Math.trunc(n) })}
          hint="0 = cada pessoa faz a própria inscrição."
        />
        <div role="group" aria-label="Faixas etárias aceitas" className="grid gap-1 sm:col-span-2">
          <p className="text-sm font-semibold">Faixas etárias aceitas</p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {AGE_BANDS.map((b) => (
              <div key={b.id} className="flex min-h-11 items-center gap-3">
                <Checkbox id={`festa-faixa-${b.id}`} checked={bands.includes(b.id)} onCheckedChange={(checked) => toggleBand(b.id, checked === true)} />
                <Label htmlFor={`festa-faixa-${b.id}`} className="flex min-h-11 flex-1 cursor-pointer items-center text-sm font-normal">
                  {b.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Contribuição com pagamento (opcional)</legend>
        <div className="flex min-h-11 items-center gap-3 sm:col-span-2">
          <Checkbox id="festa-aceita-valor" checked={acceptsValue} onCheckedChange={(checked) => set({ aceitaValor: checked === true })} />
          <Label htmlFor="festa-aceita-valor" className="flex min-h-11 flex-1 cursor-pointer items-center text-sm font-normal">
            Mostrar no formulário a opção de contribuir com pagamento
          </Label>
        </div>
        {acceptsValue ? (
          <>
            <MoneyField id="festa-valor" label="Valor (R$)" cents={value.valorContribuicaoCentavos} onChange={(c) => set({ valorContribuicaoCentavos: c })} />
            <NumberField
              id="festa-vagas"
              label="Vagas"
              value={value.vagasContribuicao}
              onChange={(n) => set({ vagasContribuicao: Math.trunc(n) })}
              hint="Quantas inscrições podem contribuir com pagamento."
            />
            <div className="flex min-h-11 items-center gap-3 sm:col-span-2">
              <Checkbox id="festa-por-pessoa" checked={value.valorPorPessoa ?? false} onCheckedChange={(checked) => set({ valorPorPessoa: checked === true })} />
              <Label htmlFor="festa-por-pessoa" className="flex min-h-11 flex-1 cursor-pointer items-center text-sm font-normal">
                Cobrar o valor de cada pessoa (acompanhantes também pagam)
              </Label>
            </div>
          </>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-3" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Itens para levar</legend>
        <p className="text-xs text-text-3">
          Quantidade é o total de unidades que o evento precisa; cada pessoa escolhe quantas leva. Escreva a medida no nome (ex.: “Carne (1 kg)”).
          Acompanhe em “Estoque”. Renomear um item já escolhido faz a escolha aparecer lá como fora da lista.
        </p>
        {value.itens.map((item, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_11rem_8rem_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor={`item-${i}-nome`} className="text-sm font-semibold">
                Item
              </Label>
              <Input
                id={`item-${i}-nome`}
                className="min-h-11 rounded-xl bg-card"
                value={item.nome}
                onChange={(e) => setItem(i, { nome: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`item-${i}-cat`} className="text-sm font-semibold">
                Categoria
              </Label>
              <select
                id={`item-${i}-cat`}
                className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm"
                value={item.categoria}
                onChange={(e) => setItem(i, { categoria: e.target.value as FestaCategoria })}
              >
                {FESTA_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <NumberField id={`item-${i}-qtd`} label="Quantidade" value={item.quantidade} onChange={(n) => setItem(i, { quantidade: Math.trunc(n) })} />
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-destructive"
              aria-label={`Remover ${item.nome || `item ${i + 1}`}`}
              onClick={() => set({ itens: value.itens.filter((_, idx) => idx !== i) })}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-fit rounded-full"
          onClick={() => set({ itens: [...value.itens, { nome: "", categoria: "comida", quantidade: 1 }] })}
        >
          <Plus aria-hidden /> Adicionar item
        </Button>
      </fieldset>

      <ConfigErrors errors={errors} />
    </div>
  );
}
