"use client";

import { Archive, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteEvent, setEventPublication } from "@/lib/events/actions";

type Props = {
  event: { id: string; title: string; publication: "draft" | "published" | "archived"; registrations: number };
};

export function EventRowActions({ event }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button asChild variant="ghost" className="min-h-11">
        <Link href={`/painel/eventos/${event.id}`} aria-label={`Editar ${event.title}`}>
          <Pencil aria-hidden />
          <span className="hidden xl:inline">Editar</span>
        </Link>
      </Button>

      {event.publication !== "published" ? (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" className="min-h-11" aria-label={`Publicar ${event.title}`}>
              <Eye aria-hidden />
              <span className="hidden xl:inline">Publicar</span>
            </Button>
          }
          title="Publicar evento?"
          description="O evento passa a aparecer no site público."
          confirmLabel="Publicar"
          onConfirm={() => setEventPublication(event.id, "published")}
        />
      ) : (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" className="min-h-11" aria-label={`Despublicar ${event.title}`}>
              <EyeOff aria-hidden />
              <span className="hidden xl:inline">Despublicar</span>
            </Button>
          }
          title="Despublicar evento?"
          description="O evento sai do site, volta a rascunho e as inscrições são encerradas."
          confirmLabel="Despublicar"
          onConfirm={() => setEventPublication(event.id, "draft")}
        />
      )}

      {event.publication !== "archived" ? (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" className="min-h-11" aria-label={`Arquivar ${event.title}`}>
              <Archive aria-hidden />
              <span className="hidden xl:inline">Arquivar</span>
            </Button>
          }
          title="Arquivar evento?"
          description="O evento sai do site e as inscrições são encerradas. As inscrições já recebidas são mantidas."
          confirmLabel="Arquivar"
          onConfirm={() => setEventPublication(event.id, "archived")}
        />
      ) : null}

      <ConfirmDialog
        trigger={
          <Button variant="ghost" className="min-h-11 text-destructive" aria-label={`Excluir ${event.title}`}>
            <Trash2 aria-hidden />
            <span className="hidden xl:inline">Excluir</span>
          </Button>
        }
        title="Excluir evento?"
        description={
          event.registrations > 0
            ? `Este evento tem ${event.registrations} inscrição(ões) e não pode ser excluído. Arquive-o em vez disso.`
            : `“${event.title}” será excluído definitivamente.`
        }
        confirmLabel="Excluir"
        onConfirm={() => deleteEvent(event.id)}
      />
    </div>
  );
}
