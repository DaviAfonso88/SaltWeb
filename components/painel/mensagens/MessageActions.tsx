"use client";

import { Archive, MailOpen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteMessage, markMessageRead, setMessageStatus } from "@/lib/messages/actions";

type Status = "new" | "read" | "archived";

/** Marca como lida ao abrir uma mensagem nova (feito no cliente: uma página não pode gravar durante a renderização). */
export function MarkAsRead({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  useEffect(() => {
    if (status !== "new") return;
    markMessageRead(id).then(() => router.refresh());
  }, [id, status, router]);
  return null;
}

export function MessageActions({ id, status, name, canManage }: { id: string; status: Status; name: string; canManage: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!canManage) return null;

  function change(next: Status) {
    startTransition(async () => {
      const result = await setMessageStatus(id, next);
      if (result.ok) {
        toast.success(result.message ?? "Atualizado.");
        router.refresh();
      } else toast.error(result.error);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "new" ? (
        <Button type="button" variant="outline" className="min-h-11 rounded-full" disabled={pending} onClick={() => change("new")}>
          <MailOpen aria-hidden /> Marcar como não lida
        </Button>
      ) : null}
      {status !== "archived" ? (
        <Button type="button" variant="outline" className="min-h-11 rounded-full" disabled={pending} onClick={() => change("archived")}>
          <Archive aria-hidden /> Arquivar
        </Button>
      ) : (
        <Button type="button" variant="outline" className="min-h-11 rounded-full" disabled={pending} onClick={() => change("read")}>
          Desarquivar
        </Button>
      )}
      <ConfirmDialog
        trigger={
          <Button type="button" variant="outline" className="min-h-11 rounded-full text-destructive">
            <Trash2 aria-hidden /> Excluir
          </Button>
        }
        title="Excluir mensagem?"
        description={`A mensagem de ${name} será excluída definitivamente.`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          const result = await deleteMessage(id);
          if (result.ok) router.push("/painel/mensagens");
          return result;
        }}
      />
    </div>
  );
}
