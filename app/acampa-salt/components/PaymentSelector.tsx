"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentSelectorProps = {
  paymentPlan: "avista" | "carne" | "credito";
  value?: "pix" | "dinheiro" | "cartao";
  onChange: (value: "pix" | "dinheiro" | "cartao") => void;
  error?: string;
};

export function PaymentSelector({
  paymentPlan,
  value,
  onChange,
  error,
}: PaymentSelectorProps) {
  if (paymentPlan === "carne") {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Carne SALT: 6 parcelas fixas de R$ 48 (fevereiro a julho). Nao ha
        desconto nesta modalidade.
      </div>
    );
  }

  if (paymentPlan === "credito") {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Plano de credito: pagamento somente por cartao de credito.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Forma de pagamento a vista</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pix">Pix (5% desconto)</SelectItem>
          <SelectItem value="dinheiro">Dinheiro (10% desconto)</SelectItem>
        </SelectContent>
      </Select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
