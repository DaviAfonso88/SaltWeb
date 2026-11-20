"use client";

import { Archive, ArchiveRestore, Check, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteVisitor, setVisitorStatus } from "@/lib/visitors/actions";

type Status = "new" | "contacted" | "archived";

export function VisitorActions({
  id,
  name,
  status,
  wasContacted,
}: {
  id: string;
  name: string;
  status: Status;
  /** Ao desarquivar, volta para "contatado" só se alguém já tinha falado com o visitante. */
  wasContacted: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: Status) {
    startTransition(async () => {
      const result = await setVisitorStatus(id, next);
      if (result.ok) {
        toast.success(result.message ?? "Atualizado.");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "new" ? (
        <Button type="button" className="min-h-11 rounded-full" disabled={pending} onClick={() => change("contacted")}>
          <Check aria-hidden /> Marcar como contatado
        </Button>
      ) : null}
      {status === "contacted" ? (
        <Button type="button" variant="outline" className="min-h-11 rounded-full" disabled={pending} onClick={() => change("new")}>
          <RotateCcw aria-hidden /> Voltar para novo
        </Button>
      ) : null}
      {status !== "archived" ? (
        <Button type="button" variant="outline" className="min-h-11 rounded-full" disabled={pending} onClick={() => change("archived")}>
          <Archive aria-hidden /> Arquivar
        </Button>
      ) : (
        <Button type="button" variant="outline" className="min-h-11 rounded-full" disabled={pending} onClick={() => change(wasContacted ? "contacted" : "new")}>
          <ArchiveRestore aria-hidden /> Desarquivar
        </Button>
      )}
      <ConfirmDialog
        trigger={
          <Button type="button" variant="outline" className="min-h-11 rounded-full text-destructive">
            <Trash2 aria-hidden /> Excluir
          </Button>
        }
        title="Excluir visitante?"
        description={`O cadastro de ${name} será excluído definitivamente.`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          const result = await deleteVisitor(id);
          if (result.ok) router.push("/painel/visitantes");
          return result;
        }}
      />
    </div>
  );
}
