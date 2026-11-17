"use client";

import { useActionState } from "react";

import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { setupFirstAdmin } from "@/lib/auth/actions";

export function SetupForm() {
  const [state, action] = useActionState(setupFirstAdmin, undefined);
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="grid gap-4" noValidate>
      <TextField
        name="code"
        label="Código de configuração"
        type="password"
        autoComplete="off"
        required
        hint="Valor de SETUP_TOKEN definido no servidor."
        errors={errors?.code}
      />
      <TextField name="name" label="Seu nome" autoComplete="name" required errors={errors?.name} />
      <TextField name="email" label="E-mail de acesso" type="email" autoComplete="username" required errors={errors?.email} />
      <TextField
        name="password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        required
        hint="Mínimo de 8 caracteres."
        errors={errors?.password}
      />
      <FormError message={state && !state.ok && !state.fieldErrors ? state.error : undefined} />
      <SubmitButton pendingLabel="Criando…" className="w-full rounded-full">
        Criar administrador
      </SubmitButton>
    </form>
  );
}
