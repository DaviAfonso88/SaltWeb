"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { Field } from "@/components/painel/participantes/Field";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { saveGuardians } from "@/lib/participants/actions";

export type GuardianValues = {
  name: string;
  relationship: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
};

const blank = (): GuardianValues => ({ name: "", relationship: "", phone: "", whatsapp: null, email: null, address: null, notes: null });

export function GuardiansEditor({ participantId, initial, readOnly }: { participantId: string; initial: GuardianValues[]; readOnly?: boolean }) {
  const router = useRouter();
  const [list, setList] = useState<GuardianValues[]>(initial);
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  const update = (i: number, patch: Partial<GuardianValues>) => setList((l) => l.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));

  function save() {
    startTransition(async () => {
      const r = await saveGuardians(participantId, list);
      setResult(r);
      if (r.ok) {
        toast.success(r.message ?? "Salvo.");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-4">
      {list.length === 0 ? <p className="text-sm text-text-2">Nenhum responsável cadastrado.</p> : null}

      {list.map((g, i) => (
        <fieldset key={i} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-semibold">Responsável {i + 1}</legend>
          <Field id={`g${i}-name`} label="Nome" value={g.name} onChange={(e) => update(i, { name: e.target.value })} disabled={readOnly} error={errors?.[`${i}.name`]} required />
          <Field id={`g${i}-rel`} label="Parentesco" value={g.relationship} onChange={(e) => update(i, { relationship: e.target.value })} disabled={readOnly} error={errors?.[`${i}.relationship`]} required placeholder="Mãe, pai, avó…" />
          <Field id={`g${i}-phone`} label="Telefone" type="tel" inputMode="tel" value={g.phone} onChange={(e) => update(i, { phone: e.target.value })} disabled={readOnly} error={errors?.[`${i}.phone`]} required />
          <Field id={`g${i}-wa`} label="WhatsApp" type="tel" inputMode="tel" value={g.whatsapp ?? ""} onChange={(e) => update(i, { whatsapp: e.target.value })} disabled={readOnly} error={errors?.[`${i}.whatsapp`]} />
          <Field id={`g${i}-email`} label="E-mail" type="email" value={g.email ?? ""} onChange={(e) => update(i, { email: e.target.value })} disabled={readOnly} error={errors?.[`${i}.email`]} />
          <Field id={`g${i}-addr`} label="Endereço" value={g.address ?? ""} onChange={(e) => update(i, { address: e.target.value })} disabled={readOnly} error={errors?.[`${i}.address`]} />
          <Field id={`g${i}-notes`} label="Observações" value={g.notes ?? ""} onChange={(e) => update(i, { notes: e.target.value })} disabled={readOnly} error={errors?.[`${i}.notes`]} className="sm:col-span-2" />
          {!readOnly ? (
            <div className="sm:col-span-2">
              <Button type="button" variant="ghost" className="min-h-11 text-destructive" onClick={() => setList((l) => l.filter((_, idx) => idx !== i))}>
                <Trash2 aria-hidden /> Remover responsável {i + 1}
              </Button>
            </div>
          ) : null}
        </fieldset>
      ))}

      <FormError message={result && !result.ok ? result.error : undefined} />

      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => setList((l) => [...l, blank()])} disabled={list.length >= 6}>
            <Plus aria-hidden /> Adicionar responsável
          </Button>
          <Button type="button" className="min-h-11 rounded-full" onClick={save} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Salvando…
              </>
            ) : (
              "Salvar responsáveis"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
