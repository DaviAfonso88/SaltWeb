import { notFound } from "next/navigation";
import { z } from "zod";

import { FestaRegistrationForm } from "@/components/painel/inscricoes/FestaRegistrationForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { requirePermission } from "@/lib/auth/guard";
import { getFestaAvailability } from "@/lib/forms/availability";
import { festaConfigSchema } from "@/lib/forms/festa";
import { listFestaEvents } from "@/lib/registrations/queries";

export const metadata = { title: "Nova inscrição" };

export default async function NewRegistrationPage({ searchParams }: { searchParams: Promise<{ evento?: string }> }) {
  await requirePermission("inscricoes.gerenciar");
  const { evento } = await searchParams;
  if (!z.string().uuid().safeParse(evento).success) notFound();

  const event = (await listFestaEvents()).find((e) => e.id === evento);
  const config = festaConfigSchema.safeParse(event?.formConfig);
  if (!event || !config.success) notFound();
  const availability = await getFestaAvailability(event.id, config.data);

  return (
    <>
      <PageHeader title="Nova inscrição" description={`${event.title} · lançada pela equipe, mesmo com as inscrições encerradas.`} />
      <FestaRegistrationForm
        mode="criar"
        eventId={event.id}
        config={config.data}
        availability={availability}
        cancelHref={`/painel/inscricoes?evento=${event.id}`}
      />
    </>
  );
}
