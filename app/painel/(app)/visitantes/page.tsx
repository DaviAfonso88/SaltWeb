import Link from "next/link";

import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { PageHeader } from "@/components/painel/PageHeader";
import { Pagination, parsePage } from "@/components/painel/Pagination";
import { StatusBadge, VISITOR_STATUS } from "@/components/painel/StatusBadge";
import { requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AGE_GROUPS, interestLabels } from "@/lib/visitors/options";
import { listVisitors, VISITOR_STATUSES } from "@/lib/visitors/queries";

export const metadata = { title: "Visitantes" };

type Row = Awaited<ReturnType<typeof listVisitors>>["rows"][number];

const STATUS_CHIP: Record<string, string> = { new: "Novos", contacted: "Contatados", archived: "Arquivados" };
const groupShort = (value: string) => AGE_GROUPS.find((g) => g.value === value)?.short ?? value;

export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ situacao?: string; grupo?: string; page?: string }> }) {
  await requirePermission("visitantes.ver");
  const sp = await searchParams;
  const status = VISITOR_STATUSES.find((s) => s === sp.situacao);
  const group = AGE_GROUPS.find((g) => g.value === sp.grupo)?.value;
  const page = parsePage(sp.page);
  const { rows, total } = await listVisitors({ status, group, page });

  const href = (extra: { situacao?: string; grupo?: string }) => {
    const p = new URLSearchParams();
    const s = "situacao" in extra ? extra.situacao : status;
    const g = "grupo" in extra ? extra.grupo : group;
    if (s) p.set("situacao", s);
    if (g) p.set("grupo", g);
    const qs = p.toString();
    return qs ? `/painel/visitantes?${qs}` : "/painel/visitantes";
  };
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
      active ? "border-primary bg-purple-tint text-purple-dark" : "border-border bg-card text-text-2 hover:bg-muted",
    );

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Nome",
      cell: (v) => (
        <Link
          href={`/painel/visitantes/${v.id}`}
          className={cn("text-foreground underline-offset-2 hover:underline", v.status === "new" ? "font-bold" : "font-medium")}
        >
          {v.name}
        </Link>
      ),
    },
    { key: "group", header: "Grupo", cell: (v) => groupShort(v.ageGroup) },
    {
      key: "interests",
      header: "Gostaria de",
      hideOnMobile: true,
      cell: (v) => <span className="line-clamp-1 max-w-xs text-text-2">{interestLabels(v.interests).join(", ") || "—"}</span>,
    },
    {
      key: "status",
      header: "Situação",
      cell: (v) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge tone={VISITOR_STATUS[v.status].tone}>{VISITOR_STATUS[v.status].label}</StatusBadge>
          {v.emailError ? <StatusBadge tone="danger">E-mail não enviado</StatusBadge> : null}
        </div>
      ),
    },
    { key: "date", header: "Recebido em", hideOnMobile: true, cell: (v) => formatDateTime(v.createdAt) },
  ];

  return (
    <>
      <PageHeader title="Visitantes" description="Quem deixou o contato pelo cadastro de visitante do site (/visitante)." />

      <div className="mb-4 grid gap-3">
        <nav aria-label="Filtrar por situação" className="flex flex-wrap gap-2">
          <Link href={href({ situacao: undefined })} aria-current={!status ? "page" : undefined} className={chip(!status)}>
            Todos
          </Link>
          {VISITOR_STATUSES.map((s) => (
            <Link key={s} href={href({ situacao: s })} aria-current={status === s ? "page" : undefined} className={chip(status === s)}>
              {STATUS_CHIP[s]}
            </Link>
          ))}
        </nav>
        <nav aria-label="Filtrar por grupo" className="flex flex-wrap gap-2">
          <Link href={href({ grupo: undefined })} aria-current={!group ? "page" : undefined} className={chip(!group)}>
            Todos os grupos
          </Link>
          {AGE_GROUPS.map((g) => (
            <Link key={g.value} href={href({ grupo: g.value })} aria-current={group === g.value ? "page" : undefined} className={chip(group === g.value)}>
              {g.short}
            </Link>
          ))}
        </nav>
      </div>

      {rows.length ? (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(v) => v.id} caption="Visitantes cadastrados" />
          <Pagination page={page} total={total} basePath="/painel/visitantes" params={{ situacao: status, grupo: group }} />
        </>
      ) : (
        <EmptyState
          title={status || group ? "Nenhum visitante com esses filtros" : "Nenhum visitante ainda"}
          description={
            status || group
              ? "Tente trocar a situação ou o grupo."
              : "Quando alguém preencher o cadastro em /visitante (pelo QR Code da recepção, por exemplo), aparece aqui."
          }
        />
      )}
    </>
  );
}
