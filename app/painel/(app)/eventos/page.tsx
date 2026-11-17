import { Plus } from "lucide-react";
import Link from "next/link";

import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { EventRowActions } from "@/components/painel/eventos/EventRowActions";
import { PageHeader } from "@/components/painel/PageHeader";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/guard";
import { listEventsAdmin } from "@/lib/events/queries";
import { formatDateTime } from "@/lib/format";
import { FORM_MODELS } from "@/lib/forms/registry";
import { cn } from "@/lib/utils";

export const metadata = { title: "Eventos" };

type Row = Awaited<ReturnType<typeof listEventsAdmin>>[number];
type Publication = Row["publication"];

const FILTERS: { value: "" | Publication; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Rascunhos" },
  { value: "published", label: "Publicados" },
  { value: "archived", label: "Arquivados" },
];

const PUBLICATION_LABEL: Record<Publication, { label: string; tone: "neutral" | "success" | "warning" }> = {
  draft: { label: "Rascunho", tone: "warning" },
  published: { label: "Publicado", tone: "success" },
  archived: { label: "Arquivado", tone: "neutral" },
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ situacao?: string }> }) {
  await requirePermission("eventos.gerenciar");
  const { situacao } = await searchParams;
  const publication = FILTERS.some((f) => f.value && f.value === situacao) ? (situacao as Publication) : undefined;
  const events = await listEventsAdmin({ publication });

  const columns: Column<Row>[] = [
    {
      key: "title",
      header: "Evento",
      cell: (e) => (
        <div>
          <p className="font-semibold">
            {e.title} {e.featured ? <StatusBadge tone="brand">Destaque</StatusBadge> : null}
          </p>
          <p className="text-xs text-text-3">/eventos/{e.slug}</p>
        </div>
      ),
    },
    { key: "date", header: "Início", cell: (e) => formatDateTime(e.startsAt) },
    {
      key: "status",
      header: "Situação",
      cell: (e) => <StatusBadge tone={PUBLICATION_LABEL[e.publication].tone}>{PUBLICATION_LABEL[e.publication].label}</StatusBadge>,
    },
    {
      key: "reg",
      header: "Inscrições",
      cell: (e) =>
        e.formModel ? (
          <div className="grid gap-1">
            <span>
              {e.registrations} · {FORM_MODELS[e.formModel].label}
            </span>
            <StatusBadge tone={e.registrationOpen ? "success" : "neutral"}>{e.registrationOpen ? "Abertas" : "Fechadas"}</StatusBadge>
          </div>
        ) : (
          <span className="text-text-3">Sem formulário</span>
        ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      cell: (e) => <EventRowActions event={{ id: e.id, title: e.title, publication: e.publication, registrations: e.registrations }} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Crie e publique os eventos que aparecem no site e configure as inscrições de cada um."
        actions={
          <Button asChild className="min-h-11 rounded-full">
            <Link href="/painel/eventos/novo">
              <Plus aria-hidden /> Novo evento
            </Link>
          </Button>
        }
      />

      <nav aria-label="Filtrar por situação" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (publication ?? "") === f.value;
          return (
            <Link
              key={f.value || "todos"}
              href={f.value ? `/painel/eventos?situacao=${f.value}` : "/painel/eventos"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
                active ? "border-primary bg-purple-tint text-purple-dark" : "border-border bg-card text-text-2 hover:bg-muted",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {events.length ? (
        <DataTable columns={columns} rows={events} rowKey={(e) => e.id} caption="Lista de eventos" />
      ) : (
        <EmptyState
          title="Nenhum evento por aqui"
          description="Crie o primeiro evento para ele aparecer no site."
          action={
            <Button asChild className="min-h-11 rounded-full">
              <Link href="/painel/eventos/novo">Novo evento</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
