"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { User, Phone, Heart, Gift, Users, CheckCircle2, ChevronRight } from "lucide-react";

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
  faixaEtariaOptions,
  ingredientsList,
  observacaoOptions,
  RegistrationInput,
  RegistrationRecord,
  registrationSchema,
  tipoContribuicaoOptions,
  tipoParticipanteOptions,
} from "@/lib/festa-roca/types";
import { RegistrationSuccess } from "./SuccessScreen";

type RegisterResponse = {
  registration: RegistrationRecord;
};

export function RegistrationForm() {
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState<RegisterResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      nome: "",
      faixaEtaria: undefined,
      telefone: "",
      observacao: undefined,
      ingredientes: undefined,
      tipoContribuicao: undefined,
      valor: 30,
      tipoParticipante: undefined,
      nomeConvidadoPor: "",
    },
  });

  const observacao = useWatch({
    control: form.control,
    name: "observacao",
  });
  const tipoContribuicao = useWatch({
    control: form.control,
    name: "tipoContribuicao",
  });
  const tipoParticipante = useWatch({
    control: form.control,
    name: "tipoParticipante",
  });

  const onSubmit = async (data: RegistrationInput) => {
    setApiError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/festa-na-roca/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as
        | RegisterResponse
        | { message: string };

      if (!response.ok) {
        setApiError(
          "message" in result
            ? result.message
            : "Erro ao registrar. Tente novamente.",
        );
        return;
      }

      setSuccess(result as RegisterResponse);
    } catch {
      setApiError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <RegistrationSuccess
        nome={success.registration.nome}
        valor={success.registration.valor}
      />
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 px-6 py-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-2xl">
            <Gift className="h-12 w-12 text-amber-500" />
          </div>
        </div>
      </div>
      
      <CardHeader className="pt-16 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Faça sua inscrição</CardTitle>
        <p className="text-muted-foreground">Garanta seu lugar na Festa na Roça!</p>
      </CardHeader>
      
      <CardContent className="px-6 pb-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              Dados Pessoais
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium">Nome completo *</Label>
                <Input id="nome" {...form.register("nome")} className="h-11" placeholder="Seu nome completo" />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Faixa etária *</Label>
                <div className="flex flex-wrap gap-2">
                  {faixaEtariaOptions.map((option) => (
                    <Label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 px-4 py-2 hover:bg-muted/50 data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...form.register("faixaEtaria")}
                        className="accent-primary"
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
                {form.formState.errors.faixaEtaria && (
                  <p className="text-sm text-destructive">{form.formState.errors.faixaEtaria.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium">WhatsApp para contato *</Label>
                <Input id="telefone" {...form.register("telefone")} className="h-11" placeholder="(38) 99999-9999" />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-5 w-5 text-primary" />
              Contribuição
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sobre a contribuição *</Label>
                <Select
                  value={form.watch("observacao")}
                  onValueChange={(value) =>
                    form.setValue("observacao", value as "normal" | "nao_consigo")
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {observacaoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.observacao && (
                  <p className="text-sm text-destructive">{form.formState.errors.observacao.message}</p>
                )}
              </div>

              {observacao === "normal" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Como deseja contribuir? *</Label>
                  <div className="flex flex-wrap gap-2">
                    {tipoContribuicaoOptions.map((option) => (
                      <Label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 px-4 py-2 hover:bg-muted/50 data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          {...form.register("tipoContribuicao")}
                          className="accent-primary"
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>
                  {form.formState.errors.tipoContribuicao && (
                    <p className="text-sm text-destructive">{form.formState.errors.tipoContribuicao.message}</p>
                  )}
                </div>
              )}

              {observacao === "normal" && tipoContribuicao === "alimento" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Qual alimento você pode levar? *</Label>
                  <p className="text-xs text-muted-foreground">Selecione pelo menos 1 ingrediente</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ingredientsList.map((ingredient) => (
                      <Label
                        key={ingredient}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 p-2 text-sm hover:bg-muted/50 data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary"
                      >
                        <Checkbox
                          value={ingredient}
                          checked={form.watch("ingredientes")?.includes(ingredient) ?? false}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("ingredientes") ?? [];
                            if (checked) {
                              form.setValue("ingredientes", [...current, ingredient]);
                            } else {
                              form.setValue("ingredientes", current.filter((i) => i !== ingredient));
                            }
                          }}
                        />
                        {ingredient}
                      </Label>
                    ))}
                  </div>
                  {form.formState.errors.ingredientes && (
                    <p className="text-sm text-destructive">{form.formState.errors.ingredientes.message}</p>
                  )}
                </div>
              )}

              {observacao === "normal" && tipoContribuicao === "valor" && (
                <div className="space-y-2">
                  <Label htmlFor="valor" className="text-sm font-medium">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    min={30}
                    max={500}
                    placeholder="30"
                    className="h-11"
                    {...form.register("valor", { valueAsNumber: true })}
                  />
                  {form.formState.errors.valor && (
                    <p className="text-sm text-destructive">{form.formState.errors.valor.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-primary" />
              Tipo de Participante
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Você é *</Label>
                <div className="flex flex-wrap gap-2">
                  {tipoParticipanteOptions.map((option) => (
                    <Label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/50 px-4 py-2 hover:bg-muted/50 data-[state=checked]:bg-primary/20 data-[state=checked]:border-primary"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...form.register("tipoParticipante")}
                        className="accent-primary"
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
                {form.formState.errors.tipoParticipante && (
                  <p className="text-sm text-destructive">{form.formState.errors.tipoParticipante.message}</p>
                )}
              </div>

              {tipoParticipante === "convidado" && (
                <div className="space-y-2">
                  <Label htmlFor="nomeConvidadoPor" className="text-sm font-medium">Quem você foi convidado? *</Label>
                  <Input
                    id="nomeConvidadoPor"
                    placeholder="Nome de quem convidou"
                    className="h-11"
                    {...form.register("nomeConvidadoPor")}
                  />
                  {form.formState.errors.nomeConvidadoPor && (
                    <p className="text-sm text-destructive">{form.formState.errors.nomeConvidadoPor.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {apiError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="text-sm font-medium">{apiError}</p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full text-base" disabled={submitting}>
            {submitting ? "Enviando..." : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Confirmar Inscrição
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
