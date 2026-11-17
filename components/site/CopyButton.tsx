"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/** Copia um texto e confirma de forma visível e anunciada por leitores de tela. */
export function CopyButton({
  text,
  label = "Copiar",
  copiedLabel = "Copiado",
  variant = "outline",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  /** `primary` é o botão roxo cheio (ex.: ao lado da chave Pix); `outline` é o secundário. */
  variant?: "outline" | "primary";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* o texto continua visível para copiar à mão */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border font-semibold transition-colors",
          variant === "outline" && "min-h-11 border-line-strong bg-white px-4 text-sm hover:bg-sand",
          variant === "primary" && "min-h-12 border-transparent bg-primary px-[18px] text-[15px] text-primary-foreground hover:bg-purple-dark",
          copied && "border-transparent bg-success-tint text-success hover:bg-success-tint",
          className,
        )}
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {copied ? copiedLabel : label}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
