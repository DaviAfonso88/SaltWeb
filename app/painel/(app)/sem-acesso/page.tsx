import Link from "next/link";

import { PageHeader } from "@/components/painel/PageHeader";
import { requireUser } from "@/lib/auth/guard";

export const metadata = { title: "Sem acesso" };

export default async function NoAccessPage() {
  await requireUser();
  return (
    <>
      <PageHeader title="Sem acesso" description="Seu papel não permite abrir esta área. Se precisar dela, peça a um administrador." />
      <Link
        href="/painel"
        className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark"
      >
        Voltar à visão geral
      </Link>
    </>
  );
}
