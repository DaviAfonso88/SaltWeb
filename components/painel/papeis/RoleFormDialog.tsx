"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { PERMISSION_GROUPS, PERMISSION_LABELS, type Permission } from "@/lib/auth/permissions";
import { createRole, updateRole } from "@/lib/users/role-actions";

type RoleValues = { id: string; name: string; description: string | null; permissions: string[] };

export function RoleFormDialog({
  role,
  trigger,
  readOnly = false,
}: {
  role?: RoleValues;
  trigger?: React.ReactNode;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ActionResult | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const r = role ? await updateRole(undefined, formData) : await createRole(undefined, formData);
      setResult(r);
      if (r.ok) {
        toast.success(r.message ?? "Papel salvo.");
        setOpen(false);
      }
    });
  }

  const errors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setResult(undefined);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="min-h-11 rounded-full">
            <Plus aria-hidden /> Novo papel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{role ? (readOnly ? role.name : "Editar papel") : "Novo papel"}</DialogTitle>
          <DialogDescription>
            {readOnly
              ? "O papel Administrador tem todas as permissões e não pode ser alterado."
              : "Escolha o que as pessoas com este papel podem fazer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          {role ? <input type="hidden" name="id" value={role.id} /> : null}
          <TextField name="name" label="Nome" defaultValue={role?.name} required disabled={readOnly} errors={errors?.name} />
          <TextField
            name="description"
            label="Descrição (opcional)"
            defaultValue={role?.description ?? ""}
            disabled={readOnly}
          />

          <fieldset className="grid gap-4" disabled={readOnly}>
            <legend className="mb-1 text-sm font-semibold">Permissões</legend>
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="grid gap-2 rounded-xl border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-3">{group.title}</p>
                {group.items.map((permission: Permission) => {
                  const id = `perm-${permission}`;
                  return (
                    <div key={permission} className="flex min-h-11 items-center gap-3">
                      <Checkbox
                        id={id}
                        name="permissions"
                        value={permission}
                        defaultChecked={role?.permissions.includes(permission)}
                      />
                      <Label htmlFor={id} className="flex-1 cursor-pointer text-sm font-normal">
                        {PERMISSION_LABELS[permission]}
                      </Label>
                    </div>
                  );
                })}
              </div>
            ))}
            {errors?.permissions ? (
              <p role="alert" className="text-sm text-destructive">
                {errors.permissions[0]}
              </p>
            ) : null}
          </fieldset>

          <FormError message={result && !result.ok && !result.fieldErrors ? result.error : undefined} />
          {!readOnly ? (
            <SubmitButton disabled={pending} pendingLabel="Salvando…" className="rounded-full">
              Salvar papel
            </SubmitButton>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
