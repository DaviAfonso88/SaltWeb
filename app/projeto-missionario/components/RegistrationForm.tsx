"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Path } from "react-hook-form";
import Image from "next/image";
import {
  Globe,
  CheckCircle2,
  User,
  Moon,
  Shirt,
  ChevronRight,
  Loader2,
  Clock,
  ZoomIn,
  CreditCard,
  QrCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  participationSchema,
  ParticipationInput,
  ParticipationRecord,
  parcialOptions,
  SHIRT_PRICE,
  SHIRT_IMAGE_PATH,
  SHIRT_SIZES,
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
      interesseCamisa: undefined,
    },
  });

  const [shirtImageError, setShirtImageError] = useState(false);

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
        interesseCamisa={success.registration.interesseCamisa}
        tamanhoCamisa={success.registration.tamanhoCamisa}
        formaPagamentoCamisa={success.registration.formaPagamentoCamisa}
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

          <div className="rounded-xl bg-gradient-to-br from-amber-500/[0.03] to-orange-500/[0.03] border border-amber-500/20 p-5">
            <h3 className="mb-5 flex items-center gap-2 text-base font-semibold">
              <Shirt className="h-4 w-4 text-amber-500" />
              Camisa do Evento
            </h3>

            <div className="flex flex-col sm:flex-row gap-5 mb-5">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="group relative shrink-0 self-center sm:self-auto"
                  >
                    <div className="relative h-36 w-36 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20 overflow-hidden shadow-lg shadow-amber-500/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-amber-500/20 group-hover:scale-[1.02] group-hover:border-amber-500/50">
                      {shirtImageError ? (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="text-center">
                            <Shirt className="h-12 w-12 text-amber-500/40 mx-auto mb-1" />
                            <span className="text-[10px] font-medium text-amber-600/40 block leading-tight">
                              Modelo
                            </span>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={SHIRT_IMAGE_PATH}
                          alt="Modelo da camisa do Projeto Missionário SALT 2026"
                          fill
                          sizes="144px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={() => setShirtImageError(true)}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ZoomIn className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 z-10 flex h-8 min-w-[3rem] items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 text-xs font-bold text-white shadow-lg">
                      R$ {SHIRT_PRICE}
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg border-amber-500/30 bg-card p-1">
                  <DialogTitle className="sr-only">
                    Camisa do Projeto Missionário SALT 2026
                  </DialogTitle>
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    {!shirtImageError && (
                      <Image
                        src={SHIRT_IMAGE_PATH}
                        alt="Camisa do Projeto Missionário SALT 2026"
                        fill
                        sizes="(max-width: 768px) 100vw, 512px"
                        className="object-contain p-4"
                      />
                    )}
                  </div>
                  <div className="px-4 pb-4 pt-2 text-center">
                    <p className="text-sm font-semibold">
                      Camisa oficial por R${SHIRT_PRICE}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Estampa exclusiva • Projeto Missionário SALT 2026
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex flex-col justify-center gap-1.5 min-w-0">
                <p className="font-semibold text-base">Camisa oficial</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Estampa exclusiva do Projeto Missionário SALT 2026
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    R$ {SHIRT_PRICE}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    R$ 50
                  </span>
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-500">
                    -40%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Clique na imagem para ampliar
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Tem interesse em adquirir? *
              </Label>
              <div className="flex gap-3">
                <Label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-3.5 transition-all ${
                    form.watch("interesseCamisa") === true
                      ? "border-teal-500 bg-teal-500/10 shadow-[0_0_12px_-4px_rgba(20,184,166,0.4)]"
                      : "border-border/40 bg-background/50 hover:border-teal-500/30 hover:bg-teal-500/5"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value="true"
                    checked={form.watch("interesseCamisa") === true}
                    onChange={() => form.setValue("interesseCamisa", true)}
                  />
                  <CheckCircle2
                    className={`h-5 w-5 ${
                      form.watch("interesseCamisa") === true
                        ? "text-teal-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="font-medium text-sm">Sim, quero!</span>
                </Label>

                <Label
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-3.5 transition-all ${
                    form.watch("interesseCamisa") === false
                      ? "border-destructive/40 bg-destructive/10"
                      : "border-border/40 bg-background/50 hover:border-destructive/30 hover:bg-destructive/5"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value="false"
                    checked={form.watch("interesseCamisa") === false}
                    onChange={() => form.setValue("interesseCamisa", false)}
                  />
                  <span className="font-medium text-sm">Não</span>
                </Label>
              </div>
              {form.formState.errors.interesseCamisa && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.interesseCamisa.message}
                </p>
              )}
            </div>

            {form.watch("interesseCamisa") === true && (
              <div className="mt-5 space-y-5 border-t border-amber-500/20 pt-5">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Tamanho da camisa *
                  </Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SHIRT_SIZES.map((size) => {
                      const selected = form.watch("tamanhoCamisa") === size;
                      return (
                        <Label
                          key={size}
                          className={`flex cursor-pointer items-center justify-center rounded-lg border-2 py-3 font-semibold text-sm transition-all ${
                            selected
                              ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-[0_0_12px_-4px_rgba(245,158,11,0.4)]"
                              : "border-border/40 bg-background/50 text-muted-foreground hover:border-amber-500/30 hover:bg-amber-500/5"
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            value={size}
                            checked={selected}
                            onChange={() =>
                              form.setValue("tamanhoCamisa", size)
                            }
                          />
                          {size}
                        </Label>
                      );
                    })}
                  </div>
                  {form.formState.errors.tamanhoCamisa && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.tamanhoCamisa.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Forma de pagamento *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                        form.watch("formaPagamentoCamisa") === "pix"
                          ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_12px_-4px_rgba(16,185,129,0.4)]"
                          : "border-border/40 bg-background/50 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value="pix"
                        checked={form.watch("formaPagamentoCamisa") === "pix"}
                        onChange={() =>
                          form.setValue("formaPagamentoCamisa", "pix")
                        }
                      />
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          form.watch("formaPagamentoCamisa") === "pix"
                            ? "bg-emerald-500 text-white"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          Pix da Igreja
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Copie a chave PIX e envie o comprovante
                        </p>
                      </div>
                      <div
                        className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          form.watch("formaPagamentoCamisa") === "pix"
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {form.watch("formaPagamentoCamisa") === "pix" && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </Label>

                    <Label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                        form.watch("formaPagamentoCamisa") === "credito"
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_12px_-4px_rgba(139,92,246,0.4)]"
                          : "border-border/40 bg-background/50 hover:border-violet-500/30 hover:bg-violet-500/5"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        value="credito"
                        checked={
                          form.watch("formaPagamentoCamisa") === "credito"
                        }
                        onChange={() =>
                          form.setValue("formaPagamentoCamisa", "credito")
                        }
                      />
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          form.watch("formaPagamentoCamisa") === "credito"
                            ? "bg-violet-500 text-white"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          Cartão de Crédito
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pagamento na maquininha da igreja
                        </p>
                      </div>
                      <div
                        className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          form.watch("formaPagamentoCamisa") === "credito"
                            ? "border-violet-500 bg-violet-500"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {form.watch("formaPagamentoCamisa") === "credito" && (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </Label>
                  </div>
                  {form.formState.errors.formaPagamentoCamisa && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.formaPagamentoCamisa.message}
                    </p>
                  )}
                </div>
              </div>
            )}
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
