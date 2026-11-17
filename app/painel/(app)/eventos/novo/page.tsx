import { EventForm } from "@/components/painel/eventos/EventForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { requirePermission } from "@/lib/auth/guard";

export const metadata = { title: "Novo evento" };

export default async function NewEventPage() {
  await requirePermission("eventos.gerenciar");
  return (
    <>
      <PageHeader title="Novo evento" description="Ele nasce como rascunho. Publique quando estiver pronto." />
      <EventForm />
    </>
  );
}
