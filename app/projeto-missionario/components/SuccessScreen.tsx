"use client";

import Image from "next/image";
import { useState } from "react";
import {
  CheckCircle2,
  Globe,
  MapPin,
  CalendarDays,
  Copy,
  QrCode,
  CreditCard,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENT_FULL_DATE } from "@/lib/projeto-missionario/types";
import { PIBLS_PIX_KEY, PIBLS_PIX_IMAGE } from "@/lib/pix";

type SuccessScreenProps = {
  nome: string;
  interesseCamisa: boolean;
  tamanhoCamisa?: string;
  formaPagamentoCamisa?: string;
};

export function RegistrationSuccess({
  nome,
  interesseCamisa,
  tamanhoCamisa,
  formaPagamentoCamisa,
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyPix = async () => {
    await navigator.clipboard.writeText(PIBLS_PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden border-teal-500/30 shadow-xl max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 px-6 py-10 text-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Inscrição Confirmada!
          </h2>
          <p className="mt-1 text-teal-100">
            Que bom ter você conosco, {nome}!
          </p>
        </div>
      </div>

      <CardHeader className="pb-2 text-center pt-6">
        <CardTitle className="text-xl flex items-center justify-center gap-2 text-foreground">
          <Globe className="h-5 w-5 text-teal-500" />
          Projeto Missionário SALT
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-8 space-y-5">
        <div className="rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/20 p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 text-teal-500" />
            <span className="font-medium">{EVENT_FULL_DATE}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-teal-500" />
            <span className="font-medium">PIBLS Lagoa Santa</span>
          </div>
        </div>

        {interesseCamisa && formaPagamentoCamisa === "pix" && (
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <QrCode className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold">Pagamento via PIX</h3>
                <p className="text-xs text-muted-foreground">
                  Camisa tamanho <strong>{tamanhoCamisa}</strong> &mdash; R$ 30
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
              <Image
                src={PIBLS_PIX_IMAGE}
                alt="QR Code PIX da PIBLS"
                width={180}
                height={180}
                className="rounded-xl border-2 border-emerald-500/20 bg-white p-3 mx-auto md:mx-0 shadow-lg"
              />
              <div className="space-y-3">
                <div className="rounded-lg border border-emerald-500/30 bg-background/80 p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Chave PIX (CNPJ)
                  </p>
                  <p className="text-sm font-mono font-medium break-all text-emerald-700 dark:text-emerald-400">
                    {PIBLS_PIX_KEY}
                  </p>
                </div>
                <Button
                  onClick={copyPix}
                  type="button"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar chave PIX"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-600/80 border border-emerald-400/50 p-4">
              <p className="text-sm font-medium text-white mb-2">
                Próximo passo
              </p>
              <p className="text-white/90 text-sm mb-3">
                Envie o comprovante para o <strong>Gazofilásio Digital</strong>{" "}
                e para o irmão <strong>Davi Afonso</strong> no WhatsApp para
                confirmar seu pedido.
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

        {interesseCamisa && formaPagamentoCamisa === "credito" && (
          <div className="rounded-2xl border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                <CreditCard className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold">
                  Pagamento com Cartão de Crédito
                </h3>
                <p className="text-xs text-muted-foreground">
                  Camisa tamanho <strong>{tamanhoCamisa}</strong> &mdash; R$ 30
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-violet-500/30 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">
                  O pagamento será processado na{" "}
                  <strong>maquininha da igreja</strong>. Para confirmar, envie o
                  comprovante para o <strong>Gazofilásio Digital</strong> ou
                  para o irmão <strong>Davi Afonso</strong> no WhatsApp.
                </p>
              </div>
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

        <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
          <h4 className="font-semibold text-sm mb-2">Prepare-se</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>Traga sua Bíblia, caderno e disposição</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>
                Se for ficar em tempo integral, traga colchonete e roupa de cama
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>Almoço e janta serão fornecidos</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Dúvidas? Fale com a liderança da SALT.
        </p>
      </CardContent>
    </Card>
  );
}
