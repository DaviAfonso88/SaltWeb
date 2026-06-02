"use client";

import Image from "next/image";
import { useState } from "react";
import {
  PartyPopper,
  CheckCircle2,
  Copy,
  QrCode,
  Wallet,
  CalendarCheck,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationRecord } from "@/lib/acampa/types";
import { PIBLS_PIX_IMAGE } from "@/lib/pix";

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

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl">
      <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-2xl">
            <PartyPopper className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      <CardHeader className="pt-16 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
          Inscrição Confirmada!
        </CardTitle>
        <p className="text-muted-foreground">
          Você está oficialmente inscrito no Acampa SALT 2026. Prepare-se para
          uma experiência incrível!
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-8 space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Inscrição
            </p>
            <p className="text-lg font-bold text-primary">
              {registration.numeroInscricao}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Participante
            </p>
            <p className="text-lg font-semibold">{registration.nome}</p>
          </div>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Valor Total
            </p>
            <p className="text-xl font-bold text-green-500">
              {formatCurrency(registration.valorFinal)}
            </p>
          </div>
        </div>

        {isPix && (
          <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <QrCode className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Pagamento via PIX</h3>
                <p className="text-xs text-muted-foreground">
                  Escaneie ou copie a chave abaixo
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
              <Image
                src={PIBLS_PIX_IMAGE}
                alt="QR Code PIX"
                width={180}
                height={180}
                className="rounded-xl border-2 border-amber-500/20 bg-white p-3 mx-auto md:mx-0 shadow-lg"
              />
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-500/30 bg-background/80 p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Chave PIX
                  </p>
                  <p className="text-sm font-mono font-medium break-all text-amber-700 dark:text-amber-400">
                    {payment.pixKey}
                  </p>
                </div>
                <Button
                  onClick={copyPix}
                  type="button"
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar chave PIX"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/30 border border-amber-400/50 p-4">
              <p className="text-sm font-medium text-white mb-2">
                Próximo passo
              </p>
              <p className="text-white/90 mb-3">
                Envie o comprovante para o <strong>Gazofilásio Digital</strong>{" "}
                e para o irmão <strong>Davi Afonso</strong> no WhatsApp junto
                com seu número de inscrição{" "}
                <strong className="text-amber-200">
                  {registration.numeroInscricao}
                </strong>
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/553197018582"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Gazofilásio Digital
                </a>
                <a
                  href="https://wa.me/5531987139735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Irmão Davi Afonso
                </a>
              </div>
            </div>
          </div>
        )}

        {isMoney && (
          <div className="rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Pagamento em Dinheiro</h3>
                <p className="text-xs text-muted-foreground">
                  Realize o pagamento na igreja
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Alert>
                <AlertDescription className="text-sm">
                  O pagamento deve ser feito diretamente na PIBLS. Guarde seu
                  número de inscrição{" "}
                  <strong className="text-amber-600 dark:text-amber-400">
                    ({registration.numeroInscricao})
                  </strong>{" "}
                  para identificação. Para confirmar, envie o comprovante para o{" "}
                  <strong>Gazofilásio Digital</strong> e para o irmão{" "}
                  <strong>Davi Afonso</strong> no WhatsApp.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/553197018582"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Gazofilásio Digital
                </a>
                <a
                  href="https://wa.me/5531987139735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Irmão Davi Afonso
                </a>
              </div>
            </div>
          </div>
        )}

        {isCard && (
          <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                <Wallet className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Pagamento com Cartão</h3>
                <p className="text-xs text-muted-foreground">
                  Máquina disponível na igreja
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Alert>
                <AlertDescription className="text-sm">
                  O pagamento será processado na máquina de cartão da igreja.
                  Para confirmações, envie o comprovante para o{" "}
                  <strong>Gazofilásio Digital</strong> e para o irmão{" "}
                  <strong>Davi Afonso</strong> no WhatsApp junto com seu número
                  de inscrição{" "}
                  <strong className="text-amber-600 dark:text-amber-400">
                    ({registration.numeroInscricao})
                  </strong>
                  .
                </AlertDescription>
              </Alert>
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/553197018582"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Gazofilásio Digital
                </a>
                <a
                  href="https://wa.me/5531987139735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Irmão Davi Afonso
                </a>
              </div>
            </div>
          </div>
        )}

        {isCarne && (
          <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                <CalendarCheck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold">Carnê SALT - Parcelado</h3>
                <p className="text-xs text-muted-foreground">
                  6 parcelas de {formatCurrency(registration.valorFinal / 6)}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
              <Image
                src={PIBLS_PIX_IMAGE}
                alt="QR Code PIX"
                width={180}
                height={180}
                className="rounded-xl border-2 border-purple-500/20 bg-white p-3 mx-auto md:mx-0 shadow-lg"
              />
              <div className="space-y-3">
                <div className="rounded-lg border border-purple-500/30 bg-background/80 p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Chave PIX
                  </p>
                  <p className="text-sm font-mono font-medium break-all text-purple-700 dark:text-purple-400">
                    {payment.pixKey}
                  </p>
                </div>
                <Button
                  onClick={copyPix}
                  type="button"
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar chave PIX"}
                </Button>
              </div>
            </div>

            <Alert className="bg-purple-600 border-purple-400">
              <AlertTitle className="text-white text-sm font-semibold">
                Parcelas ({formatCurrency(registration.valorFinal / 6)}/mês)
              </AlertTitle>
              <AlertDescription className="text-white/90 text-sm">
                São 6 parcelas de{" "}
                <strong className="text-amber-300">
                  {formatCurrency(registration.valorFinal / 6)}
                </strong>{" "}
                cada (fevereiro a julho). Pague por mês e envie o comprovante
                para o <strong>Gazofilásio Digital</strong> e para o irmão{" "}
                <strong>Davi Afonso</strong> no WhatsApp com seu número de
                inscrição{" "}
                <strong className="text-amber-300">
                  {registration.numeroInscricao}
                </strong>
                .
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/553197018582"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Gazofilásio Digital
              </a>
              <a
                href="https://wa.me/5531987139735"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Irmão Davi Afonso
              </a>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onReset}
            type="button"
            className="flex-1"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Fazer nova inscrição
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
