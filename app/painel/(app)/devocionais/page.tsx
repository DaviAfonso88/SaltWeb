import { DataTable, type Column } from "@/components/painel/DataTable";
import { DevotionalFormDialog } from "@/components/painel/devocionais/DevotionalFormDialog";
import { DevotionalRowActions } from "@/components/painel/devocionais/DevotionalRowActions";
import { EmptyState } from "@/components/painel/EmptyState";
import { PageHeader } from "@/components/painel/PageHeader";
import { Pagination, parsePage } from "@/components/painel/Pagination";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { requirePermission } from "@/lib/auth/guard";
import { listDevotionalsAdmin } from "@/lib/devotionals/queries";
import { formatMonth } from "@/lib/format";

export const metadata = { title: "Devocionais" };

type Row = Awaited<ReturnType<typeof listDevotionalsAdmin>>["rows"][number];

export default async function DevotionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; situacao?: string; page?: string }>;
}) {
  await requirePermission("devocionais.gerenciar");
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const published = sp.situacao === "publicados" ? true : sp.situacao === "rascunhos" ? false : undefined;

  const { rows, total } = await listDevotionalsAdmin({ q, published, page });

  const columns: Column<Row>[] = [
    { key: "title", header: "Título", cell: (d) => <span className="font-semibold">{d.title}</span> },
    { key: "month", header: "Mês", cell: (d) => formatMonth(d.referenceMonth) },
    {
      key: "status",
      header: "Situação",
      cell: (d) => <StatusBadge tone={d.published ? "success" : "warning"}>{d.published ? "Publicado" : "Rascunho"}</StatusBadge>,
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      cell: (d) => (
        <DevotionalRowActions
          devotional={{ id: d.id, version: d.version, title: d.title, referenceMonth: d.referenceMonth.slice(0, 7), url: d.url, published: d.published }}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Devocionais" description="Os devocionais publicados aparecem no site, do mais recente para o mais antigo." actions={<DevotionalFormDialog />} />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="q" className="text-sm font-semibold">
            Buscar
          </label>
          <input id="q" name="q" defaultValue={q} className="min-h-11 w-64 max-w-full rounded-xl border border-input bg-card px-3 text-sm" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="situacao" className="text-sm font-semibold">
            Situação
          </label>
          <select id="situacao" name="situacao" defaultValue={sp.situacao ?? ""} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm">
            <option value="">Todas</option>
            <option value="publicados">Publicados</option>
            <option value="rascunhos">Rascunhos</option>
          </select>
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
          Filtrar
        </button>
      </form>

      {rows.length ? (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(d) => d.id} caption="Lista de devocionais" />
          <Pagination page={page} total={total} basePath="/painel/devocionais" params={{ q, situacao: sp.situacao }} />
        </>
      ) : (
        <EmptyState title="Nenhum devocional encontrado" description="Cadastre o primeiro ou ajuste os filtros." />
      )}
    </>
  );
}
