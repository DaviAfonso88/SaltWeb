import { notFound } from "next/navigation";
import { z } from "zod";

import { EventForm, type EventFormValues } from "@/components/painel/eventos/EventForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { requirePermission } from "@/lib/auth/guard";
import { getEventAdmin } from "@/lib/events/queries";
import { toSaoPauloInput } from "@/lib/format";

export const metadata = { title: "Editar evento" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("eventos.gerenciar");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const data = await getEventAdmin(id);
  if (!data) notFound();
  const { event, imageUrl, registrationCount, participantCount } = data;

  const values: EventFormValues = {
    id: event.id,
    version: event.version,
    title: event.title,
    slug: event.slug,
    summary: event.summary ?? "",
    description: event.description ?? "",
    startsAt: toSaoPauloInput(event.startsAt),
    endsAt: toSaoPauloInput(event.endsAt),
    locationName: event.locationName ?? "",
    locationAddress: event.locationAddress ?? "",
    locationMapUrl: event.locationMapUrl ?? "",
    imageUrl,
    imageAlt: event.imageAlt ?? "",
    category: event.category ?? "",
    featured: event.featured,
    externalUrl: event.externalUrl ?? "",
    externalLabel: event.externalLabel ?? "",
    formModel: event.formModel,
    formConfig: event.formConfig,
    registrationOpen: event.registrationOpen,
    registrationClosesAt: toSaoPauloInput(event.registrationClosesAt),
  };

  return (
    <>
      <PageHeader
        title={event.title}
        description={`${registrationCount} inscrição(ões) · ${participantCount} participante(s)`}
        actions={
          <StatusBadge tone={event.publication === "published" ? "success" : event.publication === "draft" ? "warning" : "neutral"}>
            {event.publication === "published" ? "Publicado" : event.publication === "draft" ? "Rascunho" : "Arquivado"}
          </StatusBadge>
        }
      />
      {/* A chave remonta o formulário com os valores novos depois de cada salvamento. */}
      <EventForm key={`${event.id}-${event.version}`} event={values} modelLocked={registrationCount > 0} />
    </>
  );
}
