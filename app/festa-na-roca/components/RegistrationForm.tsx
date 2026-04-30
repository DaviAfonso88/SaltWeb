"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
    <Card className="w-full max-w-2xl border-border/70 bg-card/70">
      <CardHeader>
        <CardTitle className="font-heading text-center text-2xl">
          Inscrição - Festa na Roça
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              placeholder="Seu nome completo"
              {...form.register("nome")}
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-destructive">
                {form.formState.errors.nome.message}
              </p>
            )}
          </div>

          {/* Faixa Etária */}
          <div className="space-y-2">
            <Label>Faixa etária *</Label>
            <div className="flex gap-4">
              {faixaEtariaOptions.map((option) => (
                <Label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 p-3 hover:bg-muted/50"
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
              <p className="text-sm text-destructive">
                {form.formState.errors.faixaEtaria.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">WhatsApp para contato *</Label>
            <Input
              id="telefone"
              placeholder="(38) 99999-9999"
              {...form.register("telefone")}
            />
            {form.formState.errors.telefone && (
              <p className="text-sm text-destructive">
                {form.formState.errors.telefone.message}
              </p>
            )}
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label>Sobre a contribuição *</Label>
            <Select
              value={form.watch("observacao")}
              onValueChange={(value) =>
                form.setValue("observacao", value as "normal" | "nao_consigo")
              }
            >
              <SelectTrigger>
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
              <p className="text-sm text-destructive">
                {form.formState.errors.observacao.message}
              </p>
            )}
          </div>

          {/* Tipo Contribuição (only if observacao === normal) */}
          {observacao === "normal" && (
            <div className="space-y-2">
              <Label>Como deseja contribuir? *</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                {tipoContribuicaoOptions.map((option) => (
                  <Label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 p-3 hover:bg-muted/50"
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
                <p className="text-sm text-destructive">
                  {form.formState.errors.tipoContribuicao.message}
                </p>
              )}
            </div>
          )}

          {/* Ingredientes (only if tipoContribuicao === alimento) */}
          {observacao === "normal" && tipoContribuicao === "alimento" && (
            <div className="space-y-2">
              <Label>Qual alimento voçê pode levar? *</Label>
              <p className="text-sm text-muted-foreground">
                Selecione pelo menos 1 ingrediente
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ingredientsList.map((ingredient) => (
                  <Label
                    key={ingredient}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 p-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      value={ingredient}
                      checked={
                        form.watch("ingredientes")?.includes(ingredient) ??
                        false
                      }
                      onCheckedChange={(checked) => {
                        const current = form.getValues("ingredientes") ?? [];
                        if (checked) {
                          form.setValue("ingredientes", [
                            ...current,
                            ingredient,
                          ]);
                        } else {
                          form.setValue(
                            "ingredientes",
                            current.filter((i) => i !== ingredient),
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{ingredient}</span>
                  </Label>
                ))}
              </div>
              {form.formState.errors.ingredientes && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.ingredientes.message}
                </p>
              )}
            </div>
          )}

          {/* Valor (only if tipoContribuicao === valor) */}
          {observacao === "normal" && tipoContribuicao === "valor" && (
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                min={30}
                max={500}
                placeholder="30"
                {...form.register("valor", { valueAsNumber: true })}
              />
              {form.formState.errors.valor && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.valor.message}
                </p>
              )}
            </div>
          )}

          {/* Tipo Participante */}
          <div className="space-y-2">
            <Label>Você é *</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              {tipoParticipanteOptions.map((option) => (
                <Label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/70 p-3 hover:bg-muted/50"
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
              <p className="text-sm text-destructive">
                {form.formState.errors.tipoParticipante.message}
              </p>
            )}
          </div>

          {/* Nome de quem convidou (se convidado) */}
          {tipoParticipante === "convidado" && (
            <div className="space-y-2">
              <Label htmlFor="nomeConvidadoPor">
                Quem você foi convidado? *
              </Label>
              <Input
                id="nomeConvidadoPor"
                placeholder="Nome de quem convidou"
                {...form.register("nomeConvidadoPor")}
              />
              {form.formState.errors.nomeConvidadoPor && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.nomeConvidadoPor.message}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {apiError && <p className="text-sm text-destructive">{apiError}</p>}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Enviando..." : "Confirmar Inscrição"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
