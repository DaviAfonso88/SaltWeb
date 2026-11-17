"use client";

import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";
import { toast } from "sonner";

type Props = {
  trigger: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  /** Exige digitar exatamente este texto para habilitar a confirmação. */
  requireText?: string;
  onConfirm: () => Promise<ActionResult<unknown> | void>;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  requireText,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();

  const blocked = requireText ? typed.trim() !== requireText : false;

  function run() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result && !result.ok) {
        toast.error(result.error);
        return;
      }
      if (result?.ok && result.message) toast.success(result.message);
      setOpen(false);
      setTyped("");
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-text-2">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireText ? (
          <div className="grid gap-2">
            <Label htmlFor="confirm-text">
              Digite <strong>{requireText}</strong> para confirmar
            </Label>
            <Input
              id="confirm-text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="min-h-11"
            />
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11" disabled={pending}>
            Cancelar
          </AlertDialogCancel>
          <Button variant="destructive" className="min-h-11" onClick={run} disabled={blocked || pending}>
            {pending ? "Aguarde…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
