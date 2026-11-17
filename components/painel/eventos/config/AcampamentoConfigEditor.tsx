"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AcampamentoConfig } from "@/lib/forms/acampamento";

import { FichaConfigEditor } from "./FichaConfigEditor";
import { ConfigErrors, MoneyField, NumberField, type ConfigEditorProps } from "./fields";

export function AcampamentoConfigEditor({ value, onChange, errors, disabled }: ConfigEditorProps<AcampamentoConfig>) {
  const set = (patch: Partial<AcampamentoConfig>) => onChange({ ...value, ...patch });
  const setLot = (index: number, patch: Partial<AcampamentoConfig["lotes"][number]>) =>
    set({ lotes: value.lotes.map((l, i) => (i === index ? { ...l, ...patch } : l)) });

  function addLot() {
    const last = value.lotes[value.lotes.length - 1];
    set({
      lotes: [
        ...value.lotes,
        { rotulo: `${value.lotes.length + 1}º Lote`, valorCentavos: last?.valorCentavos ?? 30000, validoAte: "" },
      ],
    });
  }

  return (
    <div className="grid gap-6">
      <fieldset className="grid gap-3" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Lotes</legend>
        <p className="text-xs text-text-3">
          O lote vigente é o primeiro cuja data limite ainda não passou. Mantenha as datas em ordem crescente.
        </p>
        {value.lotes.map((lot, i) => (
          <div key={i} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_9rem_10rem_auto] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor={`lote-${i}-rotulo`} className="text-sm font-semibold">
                Nome
              </Label>
              <Input
                id={`lote-${i}-rotulo`}
                className="min-h-11 rounded-xl bg-card"
                value={lot.rotulo}
                onChange={(e) => setLot(i, { rotulo: e.target.value })}
              />
            </div>
            <MoneyField id={`lote-${i}-valor`} label="Valor (R$)" cents={lot.valorCentavos} onChange={(c) => setLot(i, { valorCentavos: c })} />
            <div className="grid gap-1.5">
              <Label htmlFor={`lote-${i}-data`} className="text-sm font-semibold">
                Vale até
              </Label>
              <Input
                id={`lote-${i}-data`}
                type="date"
                className="min-h-11 rounded-xl bg-card"
                value={lot.validoAte}
                onChange={(e) => setLot(i, { validoAte: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-destructive"
              aria-label={`Remover ${lot.rotulo || `lote ${i + 1}`}`}
              disabled={value.lotes.length <= 1}
              onClick={() => set({ lotes: value.lotes.filter((_, idx) => idx !== i) })}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" className="min-h-11 w-fit rounded-full" onClick={addLot}>
          <Plus aria-hidden /> Adicionar lote
        </Button>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-3" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Descontos</legend>
        <NumberField id="desc-dupla" label="Dupla (%)" value={value.descontoDuplaPct} max={100} step={0.5} onChange={(n) => set({ descontoDuplaPct: n })} hint="Irmão ou cônjuge, sobre o total." />
        <NumberField id="desc-pix" label="Pix à vista (%)" value={value.descontoPixPct} max={100} step={0.5} onChange={(n) => set({ descontoPixPct: n })} />
        <NumberField id="desc-dinheiro" label="Dinheiro à vista (%)" value={value.descontoDinheiroPct} max={100} step={0.5} onChange={(n) => set({ descontoDinheiroPct: n })} />
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-3 sm:items-end" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Pagamento</legend>
        <NumberField
          id="parcelas-carne"
          label="Parcelas do carnê"
          value={value.parcelasCarne}
          max={12}
          onChange={(n) => set({ parcelasCarne: Math.trunc(n) })}
          hint="0 desativa o carnê."
        />
        <NumberField
          id="parcelas-credito"
          label="Parcelas no cartão"
          value={value.parcelasCredito ?? 1}
          max={12}
          onChange={(n) => set({ parcelasCredito: Math.max(1, Math.trunc(n)) })}
          hint="1 = valor total em uma cobrança. O painel dá baixa em cada parcela."
        />
        <div className="flex min-h-11 items-center gap-3">
          <Switch
            id="permitir-credito"
            checked={value.permitirCredito}
            onCheckedChange={(checked) => set({ permitirCredito: checked })}
          />
          <Label htmlFor="permitir-credito" className="cursor-pointer text-sm">
            Aceitar pagamento no crédito
          </Label>
        </div>
      </fieldset>

      <FichaConfigEditor value={value.ficha} onChange={(ficha) => set({ ficha })} disabled={disabled} />

      <ConfigErrors errors={errors} />
    </div>
  );
}
