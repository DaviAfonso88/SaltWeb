"use client";

import { useActionState } from "react";

import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { changePassword } from "@/lib/auth/actions";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid max-w-md gap-4" noValidate>
      <TextField
        name="current"
        label="Senha atual"
        type="password"
        autoComplete="current-password"
        required
        errors={errors?.current}
      />
      <TextField
        name="next"
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        required
        hint="Mínimo de 8 caracteres."
        errors={errors?.next}
      />
      <TextField
        name="confirm"
        label="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        required
        errors={errors?.confirm}
      />
      <FormError message={state && !state.ok && !state.fieldErrors ? state.error : undefined} />
      <SubmitButton pendingLabel="Salvando…" className="rounded-full">
        Salvar nova senha
      </SubmitButton>
    </form>
  );
}
