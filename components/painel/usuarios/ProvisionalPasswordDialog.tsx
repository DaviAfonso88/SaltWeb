"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProvisionalPassword({ email, password }: { email: string; password: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* o usuário pode copiar manualmente */
    }
  }

  return (
    <div className="grid gap-3">
      <p className="text-sm text-text-2">
        Senha provisória de <strong>{email}</strong>. Ela aparece <strong>só desta vez</strong>: copie e envie à
        pessoa por um canal seguro. No primeiro acesso ela será obrigada a criar uma senha própria.
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
        <code className="flex-1 select-all break-all font-mono text-lg tracking-wide">{password}</code>
        <Button type="button" variant="outline" className="min-h-11" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copiada" : "Copiar"}
        </Button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {copied ? "Senha copiada" : ""}
      </p>
    </div>
  );
}

export function ProvisionalPasswordDialog({
  data,
  onClose,
}: {
  data: { email: string; password: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(data)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Senha provisória</DialogTitle>
          <DialogDescription className="sr-only">Senha temporária gerada para o usuário.</DialogDescription>
        </DialogHeader>
        {data ? <ProvisionalPassword {...data} /> : null}
        <DialogFooter>
          <Button className="min-h-11" onClick={onClose}>
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
