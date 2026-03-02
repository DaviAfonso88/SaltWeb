"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstallmentTable } from "./InstallmentTable";
import { RegistrationRecord } from "@/lib/acampa/types";
import { JUVENTUDE_PIX_IMAGE } from "@/lib/pix";

type SuccessScreenProps = {
  registration: RegistrationRecord;
  payment: {
    pixKey: string;
    pixPayload: string;
    pixQrCode: string;
  };
  onReset: () => void;
};

export function SuccessScreen({
  registration,
  payment,
  onReset,
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const copyPix = async () => {
    if (!payment.pixKey) {
      return;
    }

    await navigator.clipboard.writeText(payment.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPix =
    registration.paymentPlan === "avista" &&
    registration.formaPagamento === "pix";
  const isMoney =
    registration.paymentPlan === "avista" &&
    registration.formaPagamento === "dinheiro";
  const isCard =
    (registration.paymentPlan === "avista" &&
      registration.formaPagamento === "cartao") ||
    registration.paymentPlan === "credito";
  const isCarne = registration.paymentPlan === "carne";

  const paymentLabel =
    registration.paymentPlan === "carne"
      ? "Carne SALT"
      : registration.paymentPlan === "credito"
        ? "Credito - Cartao"
        : registration.formaPagamento === "pix"
          ? "A vista - PIX"
          : registration.formaPagamento === "dinheiro"
            ? "A vista - Dinheiro"
            : "A vista - Cartao";

  const paidInstallments = registration.parcelas.filter(
    (parcela) => parcela.pago,
  ).length;

  return (
    <Card className="border-border/70 bg-card/80 shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            Inscricao confirmada
          </CardTitle>
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
            Processo concluido
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Confira os dados abaixo e siga as instrucoes de pagamento para
          concluir sua vaga.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Inscricao
            </p>
            <p className="mt-1 text-sm font-semibold">
              {registration.numeroInscricao}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Participante
            </p>
            <p className="mt-1 text-sm font-semibold">{registration.nome}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Valor final
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatCurrency(registration.valorFinal)}
            </p>
          </div>
        </div>

        {isPix ? (
          <div className="rounded-xl border border-border/70 bg-background/40 p-4 md:p-5 space-y-4">
            <p className="text-sm font-medium">Pagamento: {paymentLabel}</p>
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code PIX da Juventude SALT ou copie a chave abaixo e
              envie o comprovante para o irmão Thiago juntamente com o numero da
              inscricao para identificar o pagamento.
            </p>
            <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
              <Image
                src={JUVENTUDE_PIX_IMAGE}
                alt="QR Code PIX Juventude"
                width={220}
                height={220}
                className="rounded-lg border border-border/70 bg-white p-2 mx-auto md:mx-0"
              />
              <div className="space-y-3">
                <div className="rounded-md border border-border/70 bg-card/60 p-3">
                  <p className="text-xs text-muted-foreground">Chave PIX</p>
                  <p className="text-sm font-medium break-all">
                    {payment.pixKey}
                  </p>
                </div>
                <Button
                  onClick={copyPix}
                  type="button"
                  className="w-full md:w-auto"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Chave copiada" : "Copiar chave PIX"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {isMoney ? (
          <Alert>
            <AlertTitle>Pagamento em dinheiro</AlertTitle>
            <AlertDescription>
              O pagamento deverá ser realizado diretamente na igreja com o irmão
              Thiago. Favor salvar o numero da inscricao para identificar o
              pagamento.
            </AlertDescription>
          </Alert>
        ) : null}

        {isCard ? (
          <Alert>
            <AlertTitle>Pagamento com cartao</AlertTitle>
            <AlertDescription>
              O pagamento será realizado na máquina de cartão da igreja. Favor
              enviar o comprovante de todas as parcelas pagas para o irmão
              Thiago e o numero da inscricao para identificar o pagamento.
            </AlertDescription>
          </Alert>
        ) : null}

        {isCarne ? (
          <div className="rounded-xl border border-border/70 bg-background/40 p-4 md:p-5 space-y-4">
            <p className="text-sm font-medium">Pagamento: Carnê SALT</p>
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code PIX da Juventude SALT ou copie a chave abaixo e
              envie o comprovante para o irmão Thiago juntamente com o numero da
              inscricao para identificar o pagamento.
            </p>
            <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
              <Image
                src={JUVENTUDE_PIX_IMAGE}
                alt="QR Code PIX Juventude"
                width={220}
                height={220}
                className="rounded-lg border border-border/70 bg-white p-2 mx-auto md:mx-0"
              />
              <div className="space-y-3">
                <div className="rounded-md border border-border/70 bg-card/60 p-3">
                  <p className="text-xs text-muted-foreground">Chave PIX</p>
                  <p className="text-sm font-medium break-all">
                    {payment.pixKey}
                  </p>
                </div>
                <Button
                  onClick={copyPix}
                  type="button"
                  className="w-full md:w-auto"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Chave copiada" : "Copiar chave PIX"}
                </Button>
              </div>
            </div>
            <Alert>
              <AlertDescription>
                Cada parcela deve ser paga separadamente. Favor enviar o
                comprovante de todas as parcelas pagas para o irmão Thiago e o
                numero da inscricao para identificar o pagamento.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" onClick={onReset} type="button">
            Fazer nova inscricao
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
