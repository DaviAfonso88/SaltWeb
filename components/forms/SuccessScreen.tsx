"use client";

import { Check, CheckCircle2, Copy, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { formatItem } from "@/lib/forms/festa";
import { festaReminderUrl } from "@/lib/forms/festa-lembrete";
import { PIX_BENEFICIARY, PIX_KEY, PIX_KEY_DISPLAY } from "@/lib/pix";
import { whatsappUrlWithText } from "@/lib/site-info";

import type { SubmitSummary } from "./shared";

export function SuccessScreen({
  eventTitle,
  summary,
  name,
  phone,
  when,
  location,
  showPayment,
  healthReceived = false,
}: {
  eventTitle: string;
  summary: SubmitSummary;
  name: string;
  /** Telefone informado: destino do lembrete que a pessoa salva para si. */
  phone: string;
  when: string;
  location?: string | null;
  /** Mostra Pix e parcelas quando o modelo cobra valor. */
  showPayment: boolean;
  /** Acampamento: confirma que a ficha de saúde foi recebida junto com a inscrição. */
  healthReceived?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const hasValue = summary.valorFinalCentavos > 0;

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* a chave está visível para copiar à mão */
    }
  }

  const contribution = summary.resumo.contribuicao;
  const items = contribution?.itens.length ? contribution.itens.map(formatItem) : null;
  const companions = contribution?.acompanhantes ?? [];
  const reminderUrl =
    contribution && items
      ? festaReminderUrl({
          de: "propria",
          telefone: phone,
          nome: name,
          numero: summary.numero,
          evento: eventTitle,
          quando: when,
          local: location,
          contribuicao: contribution,
          pago: false,
        })
      : null;
  const whatsapp = whatsappUrlWithText(
    `Olá! Fiz minha inscrição em ${eventTitle} (nº ${summary.numero})${showPayment && hasValue ? " e quero enviar o comprovante" : ""}.`,
  );
  const primaryButton = "min-h-12 rounded-lg bg-primary px-[22px] text-[15px] font-semibold shadow-none hover:bg-purple-dark";
  const outlineButton = "min-h-12 rounded-lg border-line-strong bg-white px-[22px] text-[15px] font-semibold shadow-none hover:bg-sand";

  return (
    <div role="status" className="grid gap-6 rounded-xl border border-line bg-white p-[clamp(24px,3.5vw,40px)]">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="size-10 shrink-0 text-success" aria-hidden />
        <div>
          <h2 className="font-display text-[clamp(26px,3vw,32px)] font-semibold tracking-[-0.02em]">Inscrição recebida!</h2>
          <p className="mt-1 text-text-2">
            Obrigado, {name.split(" ")[0]}. Guarde o seu número: <strong>nº {summary.numero}</strong>.
          </p>
          {healthReceived ? <p className="mt-1 text-text-2">Recebemos também a sua ficha de saúde. A equipe pode atualizá-la com você se for preciso.</p> : null}
          {companions.length ? <p className="mt-1 text-text-2">Inscritos com você: {companions.join(", ")}.</p> : null}
        </div>
      </div>

      {items ? (
        <section aria-labelledby="levar-titulo" className="grid gap-4 rounded-[10px] bg-sand p-4 sm:p-5">
          <h3 id="levar-titulo" className="font-display text-xl font-semibold tracking-[-0.01em]">
            Não esqueça: você vai levar
          </h3>
          <ul className="grid gap-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-lg border border-line-strong bg-white px-3.5 py-3 font-semibold">
                <Check className="mt-0.5 size-[18px] shrink-0 text-purple" aria-hidden />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-text-2">
            {when}
            {location ? ` · ${location}` : ""}
          </p>
          {reminderUrl ? (
            <div className="grid gap-2">
              <Button asChild className={`${primaryButton} justify-self-start`}>
                <a href={reminderUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden /> Salvar no meu WhatsApp
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </Button>
              <p className="text-sm text-text-2">Abre a conversa com o seu número ({phone}) com a lista pronta. É só tocar em enviar.</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {showPayment && hasValue ? (
        <>
          <dl className="grid gap-4 rounded-[10px] bg-sand p-4 sm:grid-cols-2">
            <div>
              <dt className="text-[13px] text-text-3">{contribution ? "Contribuição" : "Valor da inscrição"}</dt>
              <dd className="font-display text-2xl font-semibold">{formatCurrency(summary.valorFinalCentavos)}</dd>
              {summary.resumo.lote ? <dd className="text-sm text-text-2">{summary.resumo.lote}</dd> : null}
            </div>
            {summary.parcelas.length > 1 || summary.resumo.plano === "carne" ? (
              <div>
                <dt className="text-[13px] text-text-3">{summary.resumo.plano === "credito" ? "Cartão de crédito" : "Carnê SALT"}</dt>
                <dd className="text-sm">
                  <ul className="grid gap-0.5">
                    {summary.parcelas.map((p) => (
                      <li key={p.rotulo} className="flex justify-between gap-4">
                        <span className="capitalize">{p.rotulo}</span>
                        <span className="font-medium">{formatCurrency(p.valorCentavos)}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="grid gap-3">
            <p className="text-sm font-semibold">Pagamento por Pix (chave CNPJ)</p>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line-strong bg-white p-3">
              <code className="min-w-0 flex-1 break-all font-mono text-sm">{PIX_KEY_DISPLAY}</code>
              <Button type="button" variant="outline" className="min-h-11 rounded-lg border-line-strong bg-white shadow-none hover:bg-sand" onClick={copyPix}>
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? "Copiada" : "Copiar chave"}
              </Button>
            </div>
            <p className="text-sm text-text-2">Beneficiário: {PIX_BENEFICIARY}.</p>
            <p className="text-sm text-text-2">Depois de pagar, envie o comprovante pelo WhatsApp informando seu número de inscrição.</p>
          </div>
        </>
      ) : items ? null : (
        <p className="text-text-2">Entraremos em contato pelo WhatsApp informado com as próximas orientações.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant={reminderUrl ? "outline" : "default"} className={reminderUrl ? outlineButton : primaryButton}>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            {reminderUrl ? "Falar com a equipe" : "Falar no WhatsApp"}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </Button>
        <Button asChild variant="outline" className={outlineButton}>
          <Link href="/eventos">Ver outros eventos</Link>
        </Button>
      </div>
    </div>
  );
}
