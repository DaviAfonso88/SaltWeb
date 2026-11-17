import { Download } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { PageHeader } from "@/components/painel/PageHeader";
import { Pagination, parsePage } from "@/components/painel/Pagination";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { Button } from "@/components/ui/button";
import { can, requirePermission } from "@/lib/auth/guard";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { listEventsWithRegistrations, listRegistrations, REGISTRATION_STATUSES, type RegistrationStatus } from "@/lib/registrations/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inscrições" };

type SearchParams = { evento?: string; situacao?: string; q?: string; page?: string };

const STATUS_LABEL: Record<RegistrationStatus, { label: string; tone: "warning" | "success" | "neutral" }> = {
  pending: { label: "Pendente", tone: "warning" },
  confirmed: { label: "Confirmada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "neutral" },
};

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requirePermission("inscricoes.ver");
  const sp = await searchParams;

  const events = await listEventsWithRegistrations();
  if (!events.length) {
    return (
      <>
        <PageHeader title="Inscrições" />
        <EmptyState
          title="Nenhum evento ainda"
          description="Crie um evento com formulário de inscrição para receber respostas."
          action={
            <Button asChild className="min-h-11 rounded-full">
              <Link href="/painel/eventos/novo">Novo evento</Link>
            </Button>
          }
        />
      </>
    );
  }

  const requested = z.string().uuid().safeParse(sp.evento).success ? events.find((e) => e.id === sp.evento) : undefined;
  const event = requested ?? events.find((e) => e.formModel) ?? events[0];
  const status = REGISTRATION_STATUSES.find((s) => s === sp.situacao);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const page = parsePage(sp.page);

  const { rows, total, counts } = await listRegistrations({ eventId: event.id, status, q, page });
  const allCount = counts.pending + counts.confirmed + counts.cancelled;
  const canExport = can(user, "inscricoes.exportar");

  const base = new URLSearchParams({ evento: event.id });
  const withParams = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams(base);
    if (q) p.set("q", q);
    if (status) p.set("situacao", status);
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    return `/painel/inscricoes?${p.toString()}`;
  };
  const exportHref = (formato: "csv" | "pdf") => {
    const p = new URLSearchParams({ evento: event.id, formato });
    if (status) p.set("situacao", status);
    if (q) p.set("q", q);
    return `/api/painel/inscricoes/export?${p.toString()}`;
  };

  type Row = (typeof rows)[number];

  const columns: Column<Row>[] = [
    { key: "n", header: "Nº", cell: (r) => <span className="font-semibold tabular-nums">{r.number}</span> },
    {
      key: "name",
      header: "Nome",
      cell: (r) => (
        <Link href={`/painel/inscricoes/${r.id}`} className="font-semibold text-foreground underline-offset-2 hover:underline">
          {r.name}
        </Link>
      ),
    },
    { key: "phone", header: "Telefone", cell: (r) => r.phone },
    {
      key: "status",
      header: "Situação",
      cell: (r) => <StatusBadge tone={STATUS_LABEL[r.status].tone}>{STATUS_LABEL[r.status].label}</StatusBadge>,
    },
    { key: "value", header: "Valor", cell: (r) => (r.amountCents ? formatCurrency(r.amountCents) : "—") },
    {
      key: "plan",
      header: "Pagamento",
      hideOnMobile: true,
      cell: (r) => {
        const parcelas = r.payment?.parcelas ?? [];
        if (parcelas.length) return `${r.payment?.plano === "credito" ? "Cartão" : "Carnê"} ${parcelas.filter((p) => p.pago).length}/${parcelas.length}`;
        return r.payment?.plano ? `${r.payment.plano}${r.payment.forma ? ` (${r.payment.forma})` : ""}` : "—";
      },
    },
    { key: "date", header: "Inscrito em", hideOnMobile: true, cell: (r) => formatDateTime(r.createdAt) },
  ];

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium",
      active ? "border-primary bg-purple-tint text-purple-dark" : "border-border bg-card text-text-2 hover:bg-muted",
    );

  return (
    <>
      <PageHeader
        title="Inscrições"
        description="Respostas dos formulários de cada evento."
        actions={
          canExport ? (
            total > 0 ? (
              <>
                <Button asChild variant="outline" className="min-h-11 rounded-full">
                  <a href={exportHref("csv")} download>
                    <Download aria-hidden /> CSV
                  </a>
                </Button>
                <Button asChild variant="outline" className="min-h-11 rounded-full">
                  <a href={exportHref("pdf")} download>
                    <Download aria-hidden /> PDF
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-sm text-text-3">Nada para exportar com este filtro.</p>
            )
          ) : null
        }
      />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        {status ? <input type="hidden" name="situacao" value={status} /> : null}
        <div className="grid gap-1.5">
          <label htmlFor="evento" className="text-sm font-semibold">
            Evento
          </label>
          <select id="evento" name="evento" defaultValue={event.id} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm">
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="q" className="text-sm font-semibold">
            Buscar por nome ou telefone
          </label>
          <input id="q" name="q" defaultValue={q} className="min-h-11 w-64 max-w-full rounded-xl border border-input bg-card px-3 text-sm" />
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
          Aplicar
        </button>
      </form>

      <nav aria-label="Filtrar por situação" className="mb-4 flex flex-wrap gap-2">
        <Link href={withParams({ situacao: undefined, page: undefined })} aria-current={!status ? "page" : undefined} className={chip(!status)}>
          Todas <span className="tabular-nums text-text-3">{allCount}</span>
        </Link>
        {REGISTRATION_STATUSES.map((s) => (
          <Link key={s} href={withParams({ situacao: s, page: undefined })} aria-current={status === s ? "page" : undefined} className={chip(status === s)}>
            {STATUS_LABEL[s].label} <span className="tabular-nums text-text-3">{counts[s]}</span>
          </Link>
        ))}
      </nav>

      {rows.length ? (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption={`Inscrições de ${event.title}`} />
          <Pagination page={page} total={total} basePath="/painel/inscricoes" params={{ evento: event.id, situacao: status, q }} />
        </>
      ) : (
        <EmptyState
          title={allCount ? "Nenhuma inscrição com esses filtros" : "Nenhuma inscrição ainda"}
          description={allCount ? "Tente limpar a busca ou trocar a situação." : "Quando alguém se inscrever, aparece aqui."}
        />
      )}
    </>
  );
}
