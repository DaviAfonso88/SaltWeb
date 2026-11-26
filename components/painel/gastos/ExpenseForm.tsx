"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { TextField } from "@/components/painel/TextField";
import { Button } from "@/components/ui/button";
import { addExpense } from "@/lib/expenses/actions";

export function ExpenseForm({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState(addExpense, undefined);
  const form = useRef<HTMLFormElement>(null);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  // Só limpa o formulário quando salvou: com erro, o que foi digitado continua lá.
  useEffect(() => {
    if (state?.ok) {
      toast.success(state.message ?? "Gasto lançado.");
      form.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 sm:p-6"
    >
      <h2 className="font-display text-lg font-semibold sm:col-span-2">Lançar gasto</h2>
      <input type="hidden" name="eventId" value={eventId} />
      <TextField name="description" label="O que foi comprado" maxLength={120} errors={errors?.description} wrapperClassName="sm:col-span-2" />
      <TextField name="amount" label="Valor (R$)" type="number" inputMode="decimal" min={0} step="0.01" errors={errors?.amount} />
      <TextField name="spentOn" label="Data (opcional)" type="date" errors={errors?.spentOn} />
      <TextField name="paidBy" label="Quem pagou (opcional)" maxLength={80} errors={errors?.paidBy} wrapperClassName="sm:col-span-2" />
      <div className="grid gap-3 sm:col-span-2">
        <FormError message={state && !state.ok ? state.error : undefined} />
        <Button type="submit" disabled={pending} className="min-h-11 w-fit rounded-full px-6">
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {pending ? "Salvando…" : "Lançar gasto"}
        </Button>
      </div>
    </form>
  );
}
