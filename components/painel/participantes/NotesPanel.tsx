"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { AreaField } from "@/components/painel/participantes/Field";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { addParticipantNote } from "@/lib/participants/actions";

export type NoteItem = { id: string; body: string; author: string | null; createdAt: string };

export function NotesPanel({ participantId, notes, canAdd }: { participantId: string; notes: NoteItem[]; canAdd: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const r = await addParticipantNote(participantId, { body });
      setResult(r);
      if (r.ok) {
        toast.success(r.message ?? "Registrado.");
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-4">
      {notes.length ? (
        <ul className="grid gap-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl border border-border p-3">
              <p className="whitespace-pre-wrap text-sm">{n.body}</p>
              <p className="mt-1 text-xs text-text-3">
                {n.author ?? "Sistema"} · {n.createdAt}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-2">Nenhuma observação registrada.</p>
      )}

      {canAdd ? (
        <div className="grid gap-3">
          <AreaField id="note-body" label="Nova observação" value={body} onChange={(e) => setBody(e.target.value)} error={result && !result.ok ? result.fieldErrors?.body : undefined} maxLength={2000} />
          <FormError message={result && !result.ok && !result.fieldErrors ? result.error : undefined} />
          <div>
            <Button type="button" className="min-h-11 rounded-full" onClick={add} disabled={pending || !body.trim()}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Registrando…
                </>
              ) : (
                "Registrar observação"
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
