"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Path } from "react-hook-form";
import {
  Globe,
  CheckCircle2,
  User,
  Moon,
  ChevronRight,
  Loader2,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  participationSchema,
  ParticipationInput,
  ParticipationRecord,
  parcialOptions,
} from "@/lib/projeto-missionario/types";
import { RegistrationSuccess } from "./SuccessScreen";

type RegisterResponse = {
  registration: ParticipationRecord;
};

export function RegistrationForm() {
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState<RegisterResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ParticipationInput>({
    resolver: zodResolver(participationSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      tempoIntegral: false,
      parcial: {
        sextaNoite: false,
        sabadoManha: false,
        sabadoTarde: false,
        sabadoNoite: false,
        domingoTarde: false,
      },
    },
  });

  const watchTempoIntegral = form.watch("tempoIntegral");
  const watchParcial = form.watch("parcial");

  const onSubmit = async (data: ParticipationInput) => {
    setApiError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/projeto-missionario/register", {
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
      />
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 px-6 py-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Projeto Missionário SALT
          </h2>
          <p className="mt-1 text-sm text-teal-100/80">
            12 a 14 de Junho de 2026
          </p>
        </div>
      </div>

      <CardHeader className="pb-2 pt-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Faça sua inscrição
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Venha fazer parte desta missão!
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-teal-500/[0.03] to-cyan-500/[0.03] border border-teal-500/10 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <User className="h-4 w-4 text-teal-500" />
              Dados Pessoais
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome completo *
                </Label>
                <Input
                  id="nome"
                  {...form.register("nome")}
                  className="h-11 border-border/50 bg-background/50 focus-visible:ring-teal-500/30"
                  placeholder="Seu nome completo"
                />
                {form.formState.errors.nome && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium">
                  WhatsApp para contato *
                </Label>
                <Input
                  id="telefone"
                  {...form.register("telefone")}
                  className="h-11 border-border/50 bg-background/50 focus-visible:ring-teal-500/30"
                  placeholder="(38) 99999-9999"
                />
                {form.formState.errors.telefone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.telefone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-teal-500/[0.03] to-cyan-500/[0.03] border border-teal-500/10 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4 text-teal-500" />
              Tipo de Participação
            </h3>

            <div className="space-y-4">
              <Label
                className={`relative flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                  watchTempoIntegral
                    ? "border-teal-500 bg-teal-500/10 shadow-[0_0_15px_-3px_rgba(20,184,166,0.3)]"
                    : "border-border/50 bg-background/50 hover:border-teal-500/30"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={watchTempoIntegral}
                  onChange={(e) =>
                    form.setValue("tempoIntegral", e.target.checked)
                  }
                />
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    watchTempoIntegral
                      ? "bg-teal-500 text-white"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Moon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Tempo Integral</p>
                  <p className="text-xs text-muted-foreground">
                    Vou dormir na igreja — participação completa
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    watchTempoIntegral
                      ? "border-teal-500 bg-teal-500"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {watchTempoIntegral && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
              </Label>

              <div className="relative">
                <div className="absolute inset-x-0 top-3 border-t border-border/30" />
                <span className="relative mx-auto flex w-fit px-3 text-xs font-medium text-muted-foreground bg-card/50">
                  ou participe em períodos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {parcialOptions.map((option) => {
                  const fieldKey = option.value as keyof typeof watchParcial;
                  const isChecked = watchParcial[fieldKey];
                  return (
                    <Label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                        isChecked
                          ? "border-teal-500/50 bg-teal-500/5"
                          : "border-border/40 bg-background/30 hover:border-teal-500/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={isChecked}
                        onChange={(e) =>
                          form.setValue(
                            `parcial.${fieldKey}` as Path<ParticipationInput>,
                            e.target.checked,
                            { shouldDirty: true },
                          )
                        }
                      />
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border transition-all ${
                          isChecked
                            ? "border-teal-500 bg-teal-500 text-white"
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </Label>
                  );
                })}
              </div>

              {form.formState.errors.tempoIntegral && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.tempoIntegral.message}
                </p>
              )}
            </div>
          </div>

          {apiError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <p className="text-sm font-medium">{apiError}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full text-base bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
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
