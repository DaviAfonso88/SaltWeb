import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/painel/PageHeader";
import { ImportWizard } from "@/components/painel/participantes/ImportWizard";
import { requirePermission } from "@/lib/auth/guard";
import { listCampEvents } from "@/lib/participants/queries";

export const metadata = { title: "Importar participantes" };

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ evento?: string }> }) {
  await requirePermission("participantes.importar");
  const { evento } = await searchParams;
  if (!z.string().uuid().safeParse(evento).success) notFound();

  const camp = (await listCampEvents()).find((c) => c.id === evento);
  if (!camp) notFound();

  return (
    <>
      <PageHeader title="Importar participantes" description={camp.title} />
      <Link href={`/painel/participantes?evento=${camp.id}`} className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
        ← Voltar aos participantes
      </Link>
      <div className="max-w-4xl">
        <ImportWizard eventId={camp.id} eventTitle={camp.title} />
      </div>
    </>
  );
}
