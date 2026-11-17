"use client";

import { ClipboardList, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteAllParticipants, generateParticipantsFromRegistrations } from "@/lib/participants/actions";

export function GenerateFromRegistrations({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      const result = await generateParticipantsFromRegistrations(eventId);
      if (result.ok) {
        toast.success(result.message ?? "Pronto.");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  return (
    <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={run} disabled={pending}>
      <ClipboardList aria-hidden /> {pending ? "Gerando…" : "Gerar a partir das inscrições"}
    </Button>
  );
}

export function DeleteAllParticipants({ eventId, title, total }: { eventId: string; title: string; total: number }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button type="button" variant="outline" className="min-h-11 rounded-full text-destructive">
          <Trash2 aria-hidden /> Excluir todos
        </Button>
      }
      title="Excluir todos os participantes?"
      description={
        <div className="grid gap-2">
          <p>
            Isto exclui definitivamente os <strong>{total}</strong> participantes de <strong>{title}</strong>, com responsáveis, fichas de saúde, observações e histórico. As inscrições não são afetadas.
          </p>
          <p>Esta ação não pode ser desfeita. Exporte antes, se precisar guardar os dados.</p>
        </div>
      }
      requireText={title}
      confirmLabel="Excluir todos"
      onConfirm={async () => {
        const result = await deleteAllParticipants(eventId, title);
        if (result.ok) router.refresh();
        return result;
      }}
    />
  );
}
