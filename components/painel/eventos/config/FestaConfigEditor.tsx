"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FestaConfig } from "@/lib/forms/festa";

import { ConfigErrors, MoneyField, NumberField, type ConfigEditorProps } from "./fields";

export function FestaConfigEditor({ value, onChange, errors, disabled }: ConfigEditorProps<FestaConfig>) {
  const set = (patch: Partial<FestaConfig>) => onChange({ ...value, ...patch });
  const setItem = (index: number, patch: Partial<FestaConfig["itens"][number]>) =>
    set({ itens: value.itens.map((it, i) => (i === index ? { ...it, ...patch } : it)) });

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-3 sm:grid-cols-2" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Contribuição em valor</legend>
        <MoneyField id="festa-valor" label="Valor (R$)" cents={value.valorContribuicaoCentavos} onChange={(c) => set({ valorContribuicaoCentavos: c })} />
        <NumberField id="festa-vagas" label="Vagas" value={value.vagasContribuicao} onChange={(n) => set({ vagasContribuicao: Math.trunc(n) })} hint="Quantas pessoas podem contribuir em valor." />
      </fieldset>

      <fieldset className="grid gap-3" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Itens para levar</legend>
        {value.itens.map((item, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_9rem_8rem_auto] sm:items-end">
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
                onChange={(e) => setItem(i, { categoria: e.target.value as "comida" | "bebida" })}
              >
                <option value="comida">Comida</option>
                <option value="bebida">Bebida</option>
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
