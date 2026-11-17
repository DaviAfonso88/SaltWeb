import { count } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { SetupForm } from "@/components/painel/auth/SetupForm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Configuração inicial" };

export default async function SetupPage() {
  await connection();
  const [{ total }] = await getDb().select({ total: count() }).from(users);

  if (total > 0) {
    return (
      <>
        <h1 className="text-2xl font-semibold tracking-tight">Configuração já feita</h1>
        <p className="mb-6 mt-2 text-sm text-text-2">
          O painel já tem usuários. Entre com sua conta; novos usuários são criados por um administrador.
        </p>
        <Link
          href="/painel/login"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark"
        >
          Ir para o login
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Configuração inicial</h1>
      <p className="mb-6 mt-1 text-sm text-text-2">Crie o primeiro administrador do painel.</p>
      <SetupForm />
    </>
  );
}
