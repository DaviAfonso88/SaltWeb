"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ConfigEditorProps<T> = {
  value: T;
  onChange: (next: T) => void;
  /** Erros do servidor para `formConfig`. */
  errors?: string[];
  disabled?: boolean;
};

/** Campo de valor em reais que guarda centavos. */
export function MoneyField({
  id,
  label,
  cents,
  onChange,
  disabled,
  className,
}: {
  id: string;
  label: string;
  cents: number;
  onChange: (cents: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        disabled={disabled}
        className="min-h-11 rounded-xl bg-card"
        value={Number.isFinite(cents) ? (cents / 100).toString() : ""}
        onChange={(e) => onChange(Math.round(Number(e.target.value || 0) * 100))}
      />
    </div>
  );
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  hint,
  disabled,
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="min-h-11 rounded-xl bg-card"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(Number(e.target.value || 0))}
      />
      {hint ? <p className="text-xs text-text-3">{hint}</p> : null}
    </div>
  );
}

export function ConfigErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul role="alert" className="grid gap-1 text-sm text-destructive">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}
