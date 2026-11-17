import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/painel/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Entrar no painel" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await getSessionUser()) redirect("/painel");
  const { from } = await searchParams;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Entrar no painel</h1>
      <p className="mb-6 mt-1 text-sm text-text-2">Acesso restrito à equipe da Juventude SALT.</p>
      <LoginForm from={from} />
    </>
  );
}
