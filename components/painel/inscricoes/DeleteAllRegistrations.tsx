"use client";

import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteAllRegistrations } from "@/lib/registrations/actions";

export function DeleteAllRegistrations({
  eventId,
  eventTitle,
  total,
  keepsParticipants,
}: {
  eventId: string;
  eventTitle: string;
  /** Inscrições do evento em qualquer situação. */
  total: number;
  /** Acampamento: avisa que participantes e fichas de saúde não são excluídos. */
  keepsParticipants: boolean;
}) {
  const one = total === 1;

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" className="min-h-11 rounded-full text-destructive">
          <Trash2 aria-hidden /> Excluir todas
        </Button>
      }
      title="Excluir todas as inscrições?"
      description={
        <div className="grid gap-2">
          <p>
            {one ? "A única inscrição" : `As ${total} inscrições`} de <strong>{eventTitle}</strong>{" "}
            {one ? "será excluída" : "serão excluídas"} definitivamente, em qualquer situação. A busca e o filtro da tela não limitam a
            exclusão.
          </p>
          <p>Pagamentos marcados e itens escolhidos se perdem, e não dá para desfazer. Se precisar de uma cópia, exporte o CSV antes.</p>
          {keepsParticipants ? <p>Os cadastros em Participantes e as fichas de saúde não são excluídos.</p> : null}
        </div>
      }
      confirmLabel="Excluir todas"
      requireText="EXCLUIR"
      onConfirm={() => deleteAllRegistrations(eventId)}
    />
  );
}
