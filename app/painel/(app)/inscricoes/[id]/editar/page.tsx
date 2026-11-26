import { notFound } from "next/navigation";
import { z } from "zod";

import { FestaRegistrationForm } from "@/components/painel/inscricoes/FestaRegistrationForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { requirePermission } from "@/lib/auth/guard";
import { getFestaAvailability } from "@/lib/forms/availability";
import { festaConfigSchema } from "@/lib/forms/festa";
import { draftFromAnswers } from "@/lib/forms/festa-draft";
import { getRegistration } from "@/lib/registrations/queries";

export const metadata = { title: "Editar inscrição" };

export default async function EditRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("inscricoes.gerenciar");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const data = await getRegistration(id);
  const config = festaConfigSchema.safeParse(data?.formConfig);
  if (!data || data.formModel !== "festa" || !config.success) notFound();
  const r = data.registration;
  const availability = await getFestaAvailability(r.eventId, config.data, undefined, r.id);

  return (
    <>
      <PageHeader title={`Editar · ${r.name}`} description={`${data.eventTitle} · inscrição nº ${r.number}`} />
      <FestaRegistrationForm
        mode="editar"
        registrationId={r.id}
        initial={draftFromAnswers(r.answers)}
        config={config.data}
        availability={availability}
        cancelHref={`/painel/inscricoes/${r.id}`}
      />
    </>
  );
}
