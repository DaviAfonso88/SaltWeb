import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/painel/PageHeader";
import { ParticipantForm } from "@/components/painel/participantes/ParticipantForm";
import { requirePermission } from "@/lib/auth/guard";
import { listCampEvents } from "@/lib/participants/queries";

export const metadata = { title: "Novo participante" };

export default async function NewParticipantPage({ searchParams }: { searchParams: Promise<{ evento?: string }> }) {
  await requirePermission("participantes.editar");
  const { evento } = await searchParams;
  if (!z.string().uuid().safeParse(evento).success) notFound();

  const camp = (await listCampEvents()).find((c) => c.id === evento);
  if (!camp) notFound();

  return (
    <>
      <PageHeader title="Novo participante" description={camp.title} />
      <Link href={`/painel/participantes?evento=${camp.id}`} className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
        ← Voltar aos participantes
      </Link>
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-4 sm:p-6">
        <ParticipantForm mode="create" eventId={camp.id} />
        <p className="mt-4 text-sm text-text-2">Responsáveis, contato de emergência e ficha de saúde são preenchidos na ficha, depois de criar.</p>
      </div>
    </>
  );
}
