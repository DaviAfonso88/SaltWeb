"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyDiscount, createCarneInstallments, getCurrentMonthInfo, resolveBasePrice } from "@/lib/acampa/calc";
import { registrationSchema } from "@/lib/acampa/schema";
import { RegistrationInput, RegistrationRecord } from "@/lib/acampa/types";
import { InstallmentTable } from "./InstallmentTable";
import { PaymentSelector } from "./PaymentSelector";
import { SuccessScreen } from "./SuccessScreen";

type RegisterResponse = {
  registration: RegistrationRecord;
  payment: {
    pixKey: string;
    pixPayload: string;
    pixQrCode: string;
  };
};

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function RegistrationForm() {
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState<RegisterResponse | null>(null);

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nome: "",
      idade: 16,
      telefone: "",
      email: "",
      igreja: "",
      cidade: "",
      categoria: "participante",
      dupla: "nao",
      paymentPlan: "avista",
      formaPagamento: "pix",
      loteTravado: false,
    },
  });

  const paymentPlan = useWatch({ control: form.control, name: "paymentPlan" });
  const paymentMethod = useWatch({ control: form.control, name: "formaPagamento" });
  const categoria = useWatch({ control: form.control, name: "categoria" });
  const loteTravado = useWatch({ control: form.control, name: "loteTravado" });
  const dupla = useWatch({ control: form.control, name: "dupla" });

  const preview = useMemo(() => {
    const month = getCurrentMonthInfo().month;
    const base = resolveBasePrice({
      categoria,
      loteTravado,
      month,
      paymentPlan,
    });

    const valorFinal = applyDiscount({
      paymentPlan,
      formaPagamento:
        paymentPlan === "avista"
          ? paymentMethod ?? null
          : paymentPlan === "credito"
            ? "cartao"
            : null,
      valorOriginal: base.valorOriginal,
    });

    return {
      loteLabel: base.loteLabel,
      valorOriginal: base.valorOriginal,
      valorFinal,
      parcelas: paymentPlan === "carne" ? createCarneInstallments() : [],
    };
  }, [categoria, loteTravado, paymentMethod, paymentPlan]);

  useEffect(() => {
    if (paymentPlan === "credito") {
      form.setValue("formaPagamento", "cartao", { shouldValidate: true });
      return;
    }

    if (paymentPlan === "carne") {
      form.setValue("formaPagamento", undefined, { shouldValidate: true });
    }
  }, [form, paymentPlan]);

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError("");
    try {
      const response = await fetch("/api/acampa-salt/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as RegisterResponse | { message: string };
      if (!response.ok) {
        setApiError("message" in data ? data.message : "Erro ao enviar inscricao.");
        return;
      }

      setSuccess(data as RegisterResponse);
      form.reset();
    } catch {
      setApiError("Falha de conexao. Tente novamente.");
    }
  });

  if (success) {
    return (
      <SuccessScreen
        registration={success.registration}
        payment={success.payment}
        onReset={() => setSuccess(null)}
      />
    );
  }

  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader>
        <CardTitle>Formulario de inscricao</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" {...form.register("nome")} />
            <p className="text-sm text-destructive">{form.formState.errors.nome?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade">Idade</Label>
            <Input id="idade" type="number" {...form.register("idade", { valueAsNumber: true })} />
            <p className="text-sm text-destructive">{form.formState.errors.idade?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
            <Input id="telefone" {...form.register("telefone")} />
            <p className="text-sm text-destructive">{form.formState.errors.telefone?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-sm text-destructive">{form.formState.errors.email?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="igreja">Igreja</Label>
            <Input id="igreja" {...form.register("igreja")} />
            <p className="text-sm text-destructive">{form.formState.errors.igreja?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" {...form.register("cidade")} />
            <p className="text-sm text-destructive">{form.formState.errors.cidade?.message}</p>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={(v) => form.setValue("categoria", v as RegistrationInput["categoria"])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participante">Participante</SelectItem>
                <SelectItem value="lideranca">Lideranca</SelectItem>
                <SelectItem value="voluntario">Voluntario</SelectItem>
                <SelectItem value="pastor_lider_ecossistema">Pastor / Lider de Ecossistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Possui inscricao em dupla?</Label>
            <Select value={dupla} onValueChange={(v) => form.setValue("dupla", v as RegistrationInput["dupla"])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Nao</SelectItem>
                <SelectItem value="irmao">Irmao</SelectItem>
                <SelectItem value="conjuge">Conjuge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plano de pagamento</Label>
            <Select
              value={paymentPlan}
              onValueChange={(v) => form.setValue("paymentPlan", v as RegistrationInput["paymentPlan"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avista">Pagamento a vista</SelectItem>
                <SelectItem value="credito">Credito</SelectItem>
                <SelectItem value="carne">Carne SALT (parcelado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <PaymentSelector
              paymentPlan={paymentPlan}
              value={paymentMethod}
              onChange={(v) => form.setValue("formaPagamento", v)}
              error={form.formState.errors.formaPagamento?.message}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-border/70 p-3">
            <Checkbox
              id="loteTravado"
              checked={loteTravado}
              onCheckedChange={(checked) => form.setValue("loteTravado", checked === true)}
            />
            <Label htmlFor="loteTravado" className="text-sm leading-none">
              Manter inscricao no 1o lote de fevereiro (lote travado)
            </Label>
          </div>

          <div className="md:col-span-2 space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
            <p className="text-sm">
              <strong>Lote:</strong> {preview.loteLabel}
            </p>
            <p className="text-sm">
              <strong>Valor original:</strong> {currency(preview.valorOriginal)}
            </p>
            <p className="text-sm">
              <strong>Valor final:</strong> {currency(preview.valorFinal)}
            </p>
            {paymentPlan === "carne" ? <InstallmentTable parcelas={preview.parcelas} /> : null}
          </div>

          {apiError ? <p className="md:col-span-2 text-sm text-destructive">{apiError}</p> : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? "Enviando..." : "Finalizar inscricao"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
