"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { Field } from "@/components/painel/participantes/Field";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { saveEmergencyContact } from "@/lib/participants/actions";

export type EmergencyValues = { nome: string; parentesco: string | null; telefone: string };

export function EmergencyContactForm({ participantId, initial, readOnly }: { participantId: string; initial: EmergencyValues | null; readOnly?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState<EmergencyValues>(initial ?? { nome: "", parentesco: null, telefone: "" });
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  function save() {
    // Tudo vazio = remover o contato.
    const empty = !value.nome.trim() && !value.telefone.trim() && !value.parentesco?.trim();
    startTransition(async () => {
      const r = await saveEmergencyContact(participantId, empty ? null : value);
      setResult(r);
      if (r.ok) {
        toast.success(r.message ?? "Salvo.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="e-nome" label="Nome" value={value.nome} onChange={(e) => setValue((v) => ({ ...v, nome: e.target.value }))} disabled={readOnly} error={errors?.nome} />
        <Field id="e-par" label="Parentesco" value={value.parentesco ?? ""} onChange={(e) => setValue((v) => ({ ...v, parentesco: e.target.value }))} disabled={readOnly} error={errors?.parentesco} />
        <Field id="e-tel" label="Telefone" type="tel" inputMode="tel" value={value.telefone} onChange={(e) => setValue((v) => ({ ...v, telefone: e.target.value }))} disabled={readOnly} error={errors?.telefone} />
      </div>
      <FormError message={result && !result.ok ? result.error : undefined} />
      {!readOnly ? (
        <div>
          <Button type="button" className="min-h-11 rounded-full" onClick={save} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Salvando…
              </>
            ) : (
              "Salvar contato"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
