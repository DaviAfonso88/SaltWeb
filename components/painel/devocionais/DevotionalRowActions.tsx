"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { DevotionalFormDialog, type DevotionalValues } from "@/components/painel/devocionais/DevotionalFormDialog";
import { Button } from "@/components/ui/button";
import { deleteDevotional, setDevotionalPublished } from "@/lib/devotionals/actions";

export function DevotionalRowActions({ devotional }: { devotional: DevotionalValues }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <DevotionalFormDialog
        devotional={devotional}
        trigger={
          <Button variant="ghost" className="min-h-11" aria-label={`Editar ${devotional.title}`}>
            <Pencil aria-hidden />
            <span className="hidden xl:inline">Editar</span>
          </Button>
        }
      />
      <ConfirmDialog
        trigger={
          <Button variant="ghost" className="min-h-11" aria-label={`${devotional.published ? "Despublicar" : "Publicar"} ${devotional.title}`}>
            {devotional.published ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
            <span className="hidden xl:inline">{devotional.published ? "Despublicar" : "Publicar"}</span>
          </Button>
        }
        title={devotional.published ? "Despublicar devocional?" : "Publicar devocional?"}
        description={devotional.published ? "Ele sai do site, mas continua salvo aqui." : "Ele passa a aparecer no site público."}
        confirmLabel={devotional.published ? "Despublicar" : "Publicar"}
        onConfirm={() => setDevotionalPublished(devotional.id, !devotional.published)}
      />
      <ConfirmDialog
        trigger={
          <Button variant="ghost" className="min-h-11 text-destructive" aria-label={`Excluir ${devotional.title}`}>
            <Trash2 aria-hidden />
            <span className="hidden xl:inline">Excluir</span>
          </Button>
        }
        title="Excluir devocional?"
        description={`“${devotional.title}” será excluído definitivamente.`}
        confirmLabel="Excluir"
        onConfirm={() => deleteDevotional(devotional.id)}
      />
    </div>
  );
}
