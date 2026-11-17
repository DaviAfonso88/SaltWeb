"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";
import { saveDevotional } from "@/lib/devotionals/actions";

export type DevotionalValues = { id: string; version: number; title: string; referenceMonth: string; url: string; published: boolean };

export function DevotionalFormDialog({ devotional, trigger }: { devotional?: DevotionalValues; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await saveDevotional(undefined, formData);
      setResult(r);
      if (r.ok) {
        toast.success(r.message ?? "Devocional salvo.");
        setOpen(false);
      }
    });
  }

  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResult(undefined);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="min-h-11 rounded-full">
            <Plus aria-hidden /> Novo devocional
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{devotional ? "Editar devocional" : "Novo devocional"}</DialogTitle>
          <DialogDescription>O link deve apontar para o arquivo do devocional (ex.: Google Drive).</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          {devotional ? (
            <>
              <input type="hidden" name="id" value={devotional.id} />
              <input type="hidden" name="version" value={devotional.version} />
            </>
          ) : null}
          <TextField name="title" label="Título" defaultValue={devotional?.title} required maxLength={160} errors={errors?.title} />
          <TextField
            name="referenceMonth"
            label="Mês de referência"
            type="month"
            defaultValue={devotional?.referenceMonth}
            required
            errors={errors?.referenceMonth}
          />
          <TextField name="url" label="Link" type="url" defaultValue={devotional?.url} required errors={errors?.url} />
          <div className="flex min-h-11 items-center gap-3">
            <Checkbox id="published" name="published" defaultChecked={devotional?.published ?? true} />
            <Label htmlFor="published" className="cursor-pointer text-sm">
              Publicar no site
            </Label>
          </div>
          <FormError message={result && !result.ok && !result.fieldErrors ? result.error : undefined} />
          <SubmitButton disabled={pending} pendingLabel="Salvando…" className="rounded-full">
            Salvar
          </SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
