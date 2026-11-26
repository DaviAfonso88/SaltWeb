"use client";

import { Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/lib/expenses/actions";

export function DeleteExpense({ id, description }: { id: string; description: string }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" className="size-11 text-destructive" aria-label={`Excluir gasto: ${description}`}>
          <Trash2 aria-hidden />
        </Button>
      }
      title="Excluir gasto?"
      description={`“${description}” sairá das contas do evento.`}
      confirmLabel="Excluir"
      onConfirm={() => deleteExpense(id)}
    />
  );
}
