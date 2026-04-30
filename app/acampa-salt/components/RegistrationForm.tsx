"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Calendar, CheckCircle2, ChevronRight, Mail, MapPin, User, Users, Wallet } from "lucide-react";

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
import {
  applyDiscount,
  createCarneInstallments,
  resolveBasePrice,
  resolveOriginalTotal,
} from "@/lib/acampa/calc";
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
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function RegistrationForm() {
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState<RegisterResponse | null>(null);

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nome: "",
      nomeDupla: "",
      idade: 0,
      telefone: "",
      email: "",
      igreja: "",
      cidade: "",
      categoria: "participante",
      dupla: "nao",
      quantidadeConjuges: 0,
      paymentPlan: "avista",
      formaPagamento: "pix",
      loteTravado: false,
    },
  });

  const paymentPlan = useWatch({ control: form.control, name: "paymentPlan" });
  const paymentMethod = useWatch({
    control: form.control,
    name: "formaPagamento",
  });
  const loteTravado =
    useWatch({ control: form.control, name: "loteTravado" }) ?? false;
  const dupla = useWatch({ control: form.control, name: "dupla" });
  const quantidadeConjuges = useWatch({
    control: form.control,
    name: "quantidadeConjuges",
  });

  const preview = useMemo(() => {
    const base = resolveBasePrice({
      loteTravado,
    });
    const valorOriginalTotal = resolveOriginalTotal({
      valorOriginal: base.valorOriginal,
      dupla,
      quantidadeConjuges: quantidadeConjuges ?? 0,
    });

    const valorFinal = applyDiscount({
      paymentPlan,
      formaPagamento:
        paymentPlan === "avista"
          ? (paymentMethod ?? null)
          : paymentPlan === "credito"
            ? "cartao"
            : null,
      valorOriginal: base.valorOriginal,
      dupla,
      quantidadeConjuges: quantidadeConjuges ?? 0,
    });

    return {
      loteLabel: base.loteLabel,
      valorOriginal: valorOriginalTotal,
      valorFinal,
      parcelas:
        paymentPlan === "carne" ? createCarneInstallments(valorFinal) : [],
    };
  }, [dupla, loteTravado, paymentMethod, paymentPlan, quantidadeConjuges]);

  useEffect(() => {
    if (paymentPlan === "credito") {
      form.setValue("formaPagamento", "cartao", { shouldValidate: true });
      return;
    }

    if (paymentPlan === "carne") {
      form.setValue("formaPagamento", undefined, { shouldValidate: true });
    }
  }, [form, paymentPlan]);

  useEffect(() => {
    if (dupla === "nao" && (quantidadeConjuges ?? 0) !== 0) {
      form.setValue("quantidadeConjuges", 0, { shouldValidate: true });
    }

    if (dupla === "nao" && (form.getValues("nomeDupla") ?? "").trim() !== "") {
      form.setValue("nomeDupla", "", { shouldValidate: true });
    }

    if (
      (dupla === "conjuge" || dupla === "irmao") &&
      (quantidadeConjuges ?? 0) < 2
    ) {
      form.setValue("quantidadeConjuges", 2, { shouldValidate: true });
    }

    if (dupla !== "nao") {
      form.setFocus("nomeDupla");
    }
  }, [dupla, form, quantidadeConjuges]);

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError("");
    try {
      const response = await fetch("/api/acampa-salt/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as
        | RegisterResponse
        | { message: string };
      if (!response.ok) {
        setApiError(
          "message" in data ? data.message : "Erro ao enviar inscrição.",
        );
        return;
      }

      setSuccess(data as RegisterResponse);
      form.reset();
    } catch {
      setApiError("Falha de conexão. Tente novamente.");
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
    <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl">
      <div className="relative bg-gradient-to-r from-primary via-primary/80 to-purple-600 px-6 py-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-2xl">
            <Calendar className="h-12 w-12 text-primary" />
          </div>
        </div>
      </div>
      
      <CardHeader className="pt-16 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Faça sua inscrição</CardTitle>
        <p className="text-muted-foreground">Preencha os dados abaixo para garantir seu lugar no Acampa SALT 2026</p>
      </CardHeader>
      
      <CardContent className="px-6 pb-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              Dados Pessoais
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium">Nome completo</Label>
                <Input id="nome" {...form.register("nome")} className="h-11" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.nome?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idade" className="text-sm font-medium">Idade</Label>
                <Input
                  id="idade"
                  type="number"
                  className="h-11"
                  {...form.register("idade", { valueAsNumber: true })}
                />
                <p className="text-sm text-destructive">
                  {form.formState.errors.idade?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium">Telefone (WhatsApp)</Label>
                <Input id="telefone" {...form.register("telefone")} className="h-11" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.telefone?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" {...form.register("email")} className="h-11" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.email?.message}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              Informações da Igreja
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="igreja" className="text-sm font-medium">Igreja</Label>
                <Input id="igreja" {...form.register("igreja")} className="h-11" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.igreja?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-sm font-medium">Cidade</Label>
                <Input id="cidade" {...form.register("cidade")} className="h-11" />
                <p className="text-sm text-destructive">
                  {form.formState.errors.cidade?.message}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-primary" />
              Inscrição em Dupla
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Possui inscrição em dupla?</Label>
                <Select
                  value={dupla}
                  onValueChange={(v) =>
                    form.setValue("dupla", v as RegistrationInput["dupla"])
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="irmao">Irmão</SelectItem>
                    <SelectItem value="conjuge">Cônjuge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dupla !== "nao" ? (
                <div className="space-y-2">
                  <Label htmlFor="nomeDupla" className="text-sm font-medium">
                    {dupla === "irmao" ? "Nome do irmão" : "Nome do cônjuge"}
                  </Label>
                  <Input id="nomeDupla" {...form.register("nomeDupla")} className="h-11" />
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nomeDupla?.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="quantidadeConjuges" className="text-sm font-medium">Quantidade da dupla</Label>
                  <Input
                    id="quantidadeConjuges"
                    type="number"
                    min={dupla === "nao" ? 0 : 2}
                    disabled={dupla === "nao"}
                    className="h-11"
                    {...form.register("quantidadeConjuges", { valueAsNumber: true })}
                  />
                  {dupla !== "nao" ? (
                    <p className="text-xs text-muted-foreground">
                      A inscrição em dupla é válida somente para 2 ou mais pessoas.
                    </p>
                  ) : null}
                  <p className="text-sm text-destructive">
                    {form.formState.errors.quantidadeConjuges?.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Wallet className="h-5 w-5 text-primary" />
              Forma de Pagamento
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Plano de pagamento</Label>
                <Select
                  value={paymentPlan}
                  onValueChange={(v) =>
                    form.setValue(
                      "paymentPlan",
                      v as RegistrationInput["paymentPlan"],
                    )
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avista">Pagamento à vista</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="carne">Carnê SALT (parcelado)</SelectItem>
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
            </div>
          </div>

          <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="loteTravado"
                checked={loteTravado}
                onCheckedChange={(checked) =>
                  form.setValue("loteTravado", checked === true)
                }
              />
              <div>
                <Label htmlFor="loteTravado" className="text-sm font-medium leading-none">
                  Manter inscrição no 1º lote de fevereiro (lote travado)
                </Label>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  Opção válida somente para quem já preencheu o formulário do primeiro lote de fevereiro.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-purple-500/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Resumo da Inscrição</h3>
              <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary">
                {preview.loteLabel}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Valor Original</p>
                <p className="font-medium text-muted-foreground line-through">{currency(preview.valorOriginal)}</p>
              </div>
              <div className="rounded-lg bg-background/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">Desconto</p>
                <p className="font-medium text-green-500">{currency(preview.valorOriginal - preview.valorFinal)}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <p className="text-xs text-muted-foreground">Valor Final</p>
                <p className="text-xl font-bold text-primary">{currency(preview.valorFinal)}</p>
              </div>
            </div>
            {paymentPlan === "carne" ? (
              <div className="mt-4">
                <InstallmentTable parcelas={preview.parcelas} />
              </div>
            ) : null}
          </div>

          {apiError ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="text-sm font-medium">{apiError}</p>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            size="lg"
            className="w-full text-base"
          >
            {form.formState.isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Finalizar inscrição
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
