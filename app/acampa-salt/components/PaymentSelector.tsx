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
        Carnê SALT: parcelamento mensal disponível em todos os meses. Não há
        acumulação de descontos nesta modalidade.
      </div>
    );
  }

  if (paymentPlan === "credito") {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Plano de crédito: pagamento somente por cartão de crédito.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Forma de pagamento á vista</Label>
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
