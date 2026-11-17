"use client";

import { KeyRound, Pencil, Power, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/painel/ConfirmDialog";
import { ProvisionalPasswordDialog } from "@/components/painel/usuarios/ProvisionalPasswordDialog";
import { UserFormDialog } from "@/components/painel/usuarios/UserFormDialog";
import { Button } from "@/components/ui/button";
import { deleteUser, resetUserPassword, setUserActive } from "@/lib/users/actions";

type Props = {
  user: { id: string; name: string; email: string; roleId: string; active: boolean };
  roles: { id: string; name: string }[];
  isSelf: boolean;
};

export function UserRowActions({ user, roles, isSelf }: Props) {
  const [provisional, setProvisional] = useState<{ email: string; password: string } | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <UserFormDialog
        roles={roles}
        user={user}
        trigger={
          <Button variant="ghost" className="min-h-11" aria-label={`Editar ${user.name}`}>
            <Pencil aria-hidden />
            <span className="hidden xl:inline">Editar</span>
          </Button>
        }
      />

      <ConfirmDialog
        trigger={
          <Button variant="ghost" className="min-h-11" aria-label={`Redefinir senha de ${user.name}`}>
            <KeyRound aria-hidden />
            <span className="hidden xl:inline">Senha</span>
          </Button>
        }
        title="Redefinir senha?"
        description="Uma nova senha provisória será gerada e as sessões abertas dessa pessoa serão encerradas."
        confirmLabel="Redefinir"
        onConfirm={async () => {
          const result = await resetUserPassword(user.id);
          if (result.ok && result.data) setProvisional(result.data);
          return result;
        }}
      />

      {!isSelf ? (
        <>
          <ConfirmDialog
            trigger={
              <Button variant="ghost" className="min-h-11" aria-label={`${user.active ? "Desativar" : "Reativar"} ${user.name}`}>
                <Power aria-hidden />
                <span className="hidden xl:inline">{user.active ? "Desativar" : "Reativar"}</span>
              </Button>
            }
            title={user.active ? "Desativar usuário?" : "Reativar usuário?"}
            description={
              user.active
                ? "A pessoa perde o acesso imediatamente. Você pode reativar depois."
                : "A pessoa volta a poder entrar com a senha atual."
            }
            confirmLabel={user.active ? "Desativar" : "Reativar"}
            onConfirm={() => setUserActive(user.id, !user.active)}
          />
          <ConfirmDialog
            trigger={
              <Button variant="ghost" className="min-h-11 text-destructive" aria-label={`Excluir ${user.name}`}>
                <Trash2 aria-hidden />
                <span className="hidden xl:inline">Excluir</span>
              </Button>
            }
            title="Excluir usuário?"
            description={`${user.name} (${user.email}) será excluído definitivamente. O histórico de auditoria é mantido.`}
            confirmLabel="Excluir"
            onConfirm={() => deleteUser(user.id)}
          />
        </>
      ) : null}

      <ProvisionalPasswordDialog data={provisional} onClose={() => setProvisional(null)} />
    </div>
  );
}
