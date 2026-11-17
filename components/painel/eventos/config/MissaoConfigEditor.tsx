"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { MissaoConfig } from "@/lib/forms/missao";

import { ConfigErrors, type ConfigEditorProps } from "./fields";

export function MissaoConfigEditor({ value, onChange, errors, disabled }: ConfigEditorProps<MissaoConfig>) {
  const set = (patch: Partial<MissaoConfig>) => onChange({ ...value, ...patch });

  function setPeriod(index: number, rotulo: string) {
    set({
      periodos: value.periodos.map((p, i) => (i === index ? { ...p, rotulo } : p)),
    });
  }

  function addPeriod() {
    const taken = new Set(value.periodos.map((p) => p.id));
    let n = value.periodos.length + 1;
    while (taken.has(`periodo-${n}`)) n++;
    set({ periodos: [...value.periodos, { id: `periodo-${n}`, rotulo: "" }] });
  }

  return (
    <div className="grid gap-6">
      <div className="flex min-h-11 items-center gap-3">
        <Switch
          id="missao-integral"
          disabled={disabled}
          checked={value.permitirTempoIntegral}
          onCheckedChange={(checked) => set({ permitirTempoIntegral: checked })}
        />
        <Label htmlFor="missao-integral" className="cursor-pointer text-sm">
          Permitir participação em tempo integral
        </Label>
      </div>

      <fieldset className="grid gap-3" disabled={disabled}>
        <legend className="mb-1 text-sm font-semibold">Períodos</legend>
        <p className="text-xs text-text-3">Ex.: “Sexta à noite”, “Sábado de manhã”. Quem não vai em tempo integral escolhe ao menos um.</p>
        {value.periodos.map((period, i) => (
          <div key={period.id} className="flex items-end gap-2">
            <div className="grid flex-1 gap-1.5">
              <Label htmlFor={`periodo-${i}`} className="text-sm font-semibold">
                Período {i + 1}
              </Label>
              <Input
                id={`periodo-${i}`}
                className="min-h-11 rounded-xl bg-card"
                value={period.rotulo}
                onChange={(e) => setPeriod(i, e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-destructive"
              aria-label={`Remover período ${i + 1}`}
              onClick={() => set({ periodos: value.periodos.filter((_, idx) => idx !== i) })}
            >
              <Trash2 aria-hidden />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" className="min-h-11 w-fit rounded-full" onClick={addPeriod}>
          <Plus aria-hidden /> Adicionar período
        </Button>
      </fieldset>

      <ConfigErrors errors={errors} />
    </div>
  );
}
