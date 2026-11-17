import Link from "next/link";

import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { PageHeader } from "@/components/painel/PageHeader";
import { Pagination, parsePage } from "@/components/painel/Pagination";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { listMessages, MESSAGE_KINDS, MESSAGE_STATUSES, type MessageKind, type MessageStatus } from "@/lib/messages/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Mensagens" };

type Row = Awaited<ReturnType<typeof listMessages>>["rows"][number];

const KIND_LABEL: Record<MessageKind, string> = { contato: "Contato", servir: "Quero servir" };
const STATUS_LABEL: Record<MessageStatus, { label: string; tone: "brand" | "neutral" | "warning" }> = {
  new: { label: "Nova", tone: "brand" },
  read: { label: "Lida", tone: "neutral" },
  archived: { label: "Arquivada", tone: "neutral" },
};

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tipo?: string; situacao?: string; page?: string }> }) {
  await requirePermission("mensagens.ver");
  const sp = await searchParams;
  const kind = MESSAGE_KINDS.find((k) => k === sp.tipo);
  const status = MESSAGE_STATUSES.find((s) => s === sp.situacao);
  const page = parsePage(sp.page);
  const { rows, total } = await listMessages({ kind, status, page });

  const href = (extra: { tipo?: string; situacao?: string }) => {
    const p = new URLSearchParams();
    const t = "tipo" in extra ? extra.tipo : kind;
    const s = "situacao" in extra ? extra.situacao : status;
    if (t) p.set("tipo", t);
    if (s) p.set("situacao", s);
    const qs = p.toString();
    return qs ? `/painel/mensagens?${qs}` : "/painel/mensagens";
  };
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
      active ? "border-primary bg-purple-tint text-purple-dark" : "border-border bg-card text-text-2 hover:bg-muted",
    );

  const columns: Column<Row>[] = [
    {
      key: "from",
      header: "De",
      cell: (m) => (
        <Link href={`/painel/mensagens/${m.id}`} className={cn("text-foreground underline-offset-2 hover:underline", m.status === "new" ? "font-bold" : "font-medium")}>
          {m.name}
        </Link>
      ),
    },
    { key: "kind", header: "Tipo", cell: (m) => KIND_LABEL[m.kind] },
    {
      key: "preview",
      header: "Resumo",
      hideOnMobile: true,
      cell: (m) => <span className="line-clamp-1 max-w-xs text-text-2">{m.body ?? m.ministry ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Situação",
      cell: (m) => (
        <div className="flex flex-wrap gap-1">
          <StatusBadge tone={STATUS_LABEL[m.status].tone}>{STATUS_LABEL[m.status].label}</StatusBadge>
          {m.emailError ? <StatusBadge tone="danger">E-mail não enviado</StatusBadge> : null}
        </div>
      ),
    },
    { key: "date", header: "Recebida em", cell: (m) => formatDateTime(m.createdAt) },
  ];

  return (
    <>
      <PageHeader title="Mensagens" description="Contatos e interessados em servir, recebidos pelo site." />

      <div className="mb-4 grid gap-3">
        <nav aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
          <Link href={href({ tipo: undefined })} aria-current={!kind ? "page" : undefined} className={chip(!kind)}>
            Todos os tipos
          </Link>
          {MESSAGE_KINDS.map((k) => (
            <Link key={k} href={href({ tipo: k })} aria-current={kind === k ? "page" : undefined} className={chip(kind === k)}>
              {KIND_LABEL[k]}
            </Link>
          ))}
        </nav>
        <nav aria-label="Filtrar por situação" className="flex flex-wrap gap-2">
          <Link href={href({ situacao: undefined })} aria-current={!status ? "page" : undefined} className={chip(!status)}>
            Todas
          </Link>
          {MESSAGE_STATUSES.map((s) => (
            <Link key={s} href={href({ situacao: s })} aria-current={status === s ? "page" : undefined} className={chip(status === s)}>
              {STATUS_LABEL[s].label}
            </Link>
          ))}
        </nav>
      </div>

      {rows.length ? (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(m) => m.id} caption="Mensagens recebidas" />
          <Pagination page={page} total={total} basePath="/painel/mensagens" params={{ tipo: kind, situacao: status }} />
        </>
      ) : (
        <EmptyState title="Nenhuma mensagem" description="Quando alguém escrever pelo site, aparece aqui." />
      )}
    </>
  );
}
