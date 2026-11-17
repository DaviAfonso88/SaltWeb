"use client";

import { GitMerge, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteParticipant, mergeParticipants, searchMergeCandidates } from "@/lib/participants/actions";

type Candidate = { id: string; number: number; name: string; church: string | null; city: string | null; birthDate: string | null };

const pad = (n: number) => String(n).padStart(3, "0");
const describe = (c: Candidate) => [c.church, c.city, c.birthDate ? c.birthDate.split("-").reverse().join("/") : null].filter(Boolean).join(" · ");

export function MergeDialog({ participantId, eventId, name, number }: { participantId: string; eventId: string; name: string; number: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [resolvedQ, setResolvedQ] = useState("");
  const [pending, startTransition] = useTransition();

  const active = open && q.trim().length >= 2;
  const searching = active && resolvedQ !== q;
  const visible = active ? results : [];

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const found = await searchMergeCandidates(eventId, participantId, q);
      if (!cancelled) {
        setResults(found);
        setResolvedQ(q);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, active, eventId, participantId]);

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setQ("");
      setResults([]);
      setResolvedQ("");
      setPicked(null);
    }
  }

  function merge() {
    if (!picked) return;
    startTransition(async () => {
      const r = await mergeParticipants(participantId, picked.id);
      if (r.ok) {
        toast.success(r.message ?? "Cadastros mesclados.");
        reset(false);
        router.refresh();
      } else toast.error(r.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11 rounded-full">
          <GitMerge aria-hidden /> Mesclar com outro cadastro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mesclar cadastros repetidos</DialogTitle>
          <DialogDescription>
            Este cadastro (nº {pad(number)}, {name}) será mantido. Os dados do outro completam os campos vazios, e o outro cadastro é excluído.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="merge-q" className="text-sm font-semibold">
              Buscar o outro cadastro pelo nome
            </Label>
            <Input id="merge-q" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" className="min-h-11" />
          </div>

          <div role="status" aria-live="polite" className="text-sm text-text-2">
            {searching ? "Buscando…" : active && !searching && !visible.length ? "Nenhum outro cadastro encontrado." : ""}
          </div>

          {visible.length ? (
            <ul className="grid max-h-56 gap-2 overflow-y-auto">
              {visible.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(c)}
                    aria-pressed={picked?.id === c.id}
                    className={`min-h-11 w-full rounded-xl border px-3 py-2 text-left text-sm ${picked?.id === c.id ? "border-primary bg-purple-tint" : "border-border bg-card hover:bg-muted"}`}
                  >
                    <span className="font-semibold">
                      {pad(c.number)} · {c.name}
                    </span>
                    {describe(c) ? <span className="block text-text-2">{describe(c)}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {picked ? (
            <div className="rounded-xl border border-warning/40 bg-warning-tint p-3 text-sm">
              <p>
                O cadastro nº {pad(picked.number)} (<strong>{picked.name}</strong>) será excluído e seus responsáveis, observações e histórico passam para este. Não dá para desfazer.
              </p>
            </div>
          ) : null}

          <Button type="button" variant="destructive" className="min-h-11" onClick={merge} disabled={!picked || pending}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Mesclando…
              </>
            ) : (
              "Mesclar cadastros"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteParticipantButton({ participantId, name, eventId }: { participantId: string; name: string; eventId: string }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="outline" className="min-h-11 rounded-full text-destructive">
          <Trash2 aria-hidden /> Excluir participante
        </Button>
      }
      title="Excluir participante?"
      description={`${name} será excluído definitivamente, com responsáveis, ficha de saúde, observações e histórico.`}
      confirmLabel="Excluir"
      onConfirm={async () => {
        const result = await deleteParticipant(participantId);
        if (result.ok) router.push(`/painel/participantes?evento=${eventId}`);
        return result;
      }}
    />
  );
}
