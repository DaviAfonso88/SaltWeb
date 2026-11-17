"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { RoleFormDialog } from "@/components/painel/papeis/RoleFormDialog";
import { Button } from "@/components/ui/button";
import { deleteRole } from "@/lib/users/role-actions";

type Props = {
  role: { id: string; name: string; description: string | null; permissions: string[]; isSystem: boolean; userCount: number };
};

export function RoleRowActions({ role }: Props) {
  const isAdminRole = role.isSystem && role.name === "Administrador";
  return (
    <div className="flex items-center justify-end gap-1">
      <RoleFormDialog
        role={role}
        readOnly={isAdminRole}
        trigger={
          <Button variant="ghost" className="min-h-11" aria-label={`${isAdminRole ? "Ver" : "Editar"} ${role.name}`}>
            {isAdminRole ? <Eye aria-hidden /> : <Pencil aria-hidden />}
            <span className="hidden xl:inline">{isAdminRole ? "Ver" : "Editar"}</span>
          </Button>
        }
      />
      {!isAdminRole ? (
        <ConfirmDialog
          trigger={
            <Button variant="ghost" className="min-h-11 text-destructive" aria-label={`Excluir ${role.name}`}>
              <Trash2 aria-hidden />
              <span className="hidden xl:inline">Excluir</span>
            </Button>
          }
          title="Excluir papel?"
          description={
            role.userCount > 0
              ? `Há ${role.userCount} usuário(s) com este papel. Mude o papel deles antes de excluir.`
              : `O papel "${role.name}" será excluído.`
          }
          confirmLabel="Excluir"
          onConfirm={() => deleteRole(role.id)}
        />
      ) : null}
    </div>
  );
}
