import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { PageHeader } from "@/components/painel/PageHeader";
import { Pagination, parsePage } from "@/components/painel/Pagination";
import { requirePermission } from "@/lib/auth/guard";
import { listAudit, listAuditActors } from "@/lib/audit-queries";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Auditoria" };

const ACTION_GROUPS = [
  { value: "", label: "Todas as ações" },
  { value: "auth.", label: "Acesso e login" },
  { value: "user.", label: "Usuários" },
  { value: "role.", label: "Papéis" },
  { value: "registration.", label: "Inscrições" },
  { value: "participant.", label: "Participantes" },
  { value: "event.", label: "Eventos" },
  { value: "expense.", label: "Gastos" },
  { value: "message.", label: "Mensagens" },
  { value: "devotional.", label: "Devocionais" },
  { value: "cutover.", label: "Virada" },
];

type Row = Awaited<ReturnType<typeof listAudit>>["rows"][number];

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ acao?: string; usuario?: string; page?: string }>;
}) {
  await requirePermission("auditoria.ver");
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const [{ rows, total, pageSize }, actors] = await Promise.all([
    listAudit({ action: sp.acao, actorId: sp.usuario, page }),
    listAuditActors(),
  ]);

  const columns: Column<Row>[] = [
    { key: "when", header: "Quando", cell: (r) => formatDateTime(r.createdAt) },
    { key: "who", header: "Quem", cell: (r) => r.actorLabel ?? "—" },
    { key: "summary", header: "O que aconteceu", cell: (r) => r.summary },
    { key: "action", header: "Ação", cell: (r) => <code className="text-xs">{r.action}</code> },
  ];

  return (
    <>
      <PageHeader title="Auditoria" description="Ações sensíveis feitas no painel, da mais recente para a mais antiga." />

      <form className="mb-4 flex flex-wrap items-end gap-3" method="get">
        <div className="grid gap-1.5">
          <label htmlFor="acao" className="text-sm font-semibold">
            Tipo de ação
          </label>
          <select id="acao" name="acao" defaultValue={sp.acao ?? ""} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm">
            {ACTION_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="usuario" className="text-sm font-semibold">
            Usuário
          </label>
          <select id="usuario" name="usuario" defaultValue={sp.usuario ?? ""} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm">
            <option value="">Todos</option>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
          Filtrar
        </button>
      </form>

      {rows.length ? (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Registros de auditoria" />
          <Pagination page={page} total={total} pageSize={pageSize} basePath="/painel/auditoria" params={{ acao: sp.acao, usuario: sp.usuario }} />
        </>
      ) : (
        <EmptyState title="Nada registrado" description="Nenhuma ação encontrada com esses filtros." />
      )}
    </>
  );
}
