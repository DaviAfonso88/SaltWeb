"use client";

import { useActionState } from "react";

import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { login } from "@/lib/auth/actions";

export function LoginForm({ from }: { from?: string }) {
  const [state, action] = useActionState(login, undefined);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="from" value={from ?? ""} />
      <TextField name="email" label="E-mail" type="email" autoComplete="username" required errors={errors?.email} />
      <TextField
        name="password"
        label="Senha"
        type="password"
        autoComplete="current-password"
        required
        errors={errors?.password}
      />
      <FormError message={state && !state.ok && !state.fieldErrors ? state.error : undefined} />
      <SubmitButton pendingLabel="Entrando…" className="w-full rounded-full">
        Entrar
      </SubmitButton>
    </form>
  );
}
