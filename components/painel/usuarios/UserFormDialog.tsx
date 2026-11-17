"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { ProvisionalPassword } from "@/components/painel/usuarios/ProvisionalPasswordDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/action-result";
import { createUser, updateUser, type ProvisionalPassword as Provisional } from "@/lib/users/actions";

type RoleOption = { id: string; name: string };
type UserValues = { id: string; name: string; email: string; roleId: string };

export function UserFormDialog({
  roles,
  user,
  trigger,
}: {
  roles: RoleOption[];
  user?: UserValues;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ActionResult<Provisional> | ActionResult | undefined>();
  const [provisional, setProvisional] = useState<Provisional | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      if (user) {
        const r = await updateUser(undefined, formData);
        setResult(r);
        if (r.ok) {
          toast.success(r.message ?? "Usuário atualizado.");
          setOpen(false);
        }
      } else {
        const r = await createUser(undefined, formData);
        setResult(r);
        if (r.ok && r.data) setProvisional(r.data);
      }
    });
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setResult(undefined);
      setProvisional(null);
    }
  }

  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="min-h-11 rounded-full">
            <Plus aria-hidden /> Novo usuário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuário" : provisional ? "Usuário criado" : "Novo usuário"}</DialogTitle>
          <DialogDescription className="sr-only">Dados de acesso ao painel.</DialogDescription>
        </DialogHeader>

        {provisional ? (
          <>
            <ProvisionalPassword {...provisional} />
            <Button className="min-h-11" onClick={() => onOpenChange(false)}>
              Concluir
            </Button>
          </>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4" noValidate>
            {user ? <input type="hidden" name="id" value={user.id} /> : null}
            <TextField name="name" label="Nome" defaultValue={user?.name} required errors={errors?.name} />
            <TextField
              name="email"
              label="E-mail de acesso"
              type="email"
              defaultValue={user?.email}
              required
              errors={errors?.email}
            />
            <div className="grid gap-1.5">
              <Label htmlFor="roleId" className="text-sm font-semibold">
                Papel
              </Label>
              <select
                id="roleId"
                name="roleId"
                defaultValue={user?.roleId ?? ""}
                required
                className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm"
              >
                <option value="" disabled>
                  Escolha um papel
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors?.roleId ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.roleId[0]}
                </p>
              ) : null}
            </div>
            {!user ? (
              <p className="text-xs text-text-3">
                Uma senha provisória será gerada e mostrada uma única vez após salvar.
              </p>
            ) : null}
            <FormError message={result && !result.ok && !result.fieldErrors ? result.error : undefined} />
            <SubmitButton disabled={pending} pendingLabel="Salvando…" className="rounded-full">
              {user ? "Salvar" : "Criar usuário"}
            </SubmitButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
