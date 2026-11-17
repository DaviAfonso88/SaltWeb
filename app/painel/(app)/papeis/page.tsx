import { DataTable, type Column } from "@/components/painel/DataTable";
import { PageHeader } from "@/components/painel/PageHeader";
import { RoleFormDialog } from "@/components/painel/papeis/RoleFormDialog";
import { RoleRowActions } from "@/components/painel/papeis/RoleRowActions";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { requirePermission } from "@/lib/auth/guard";
import { listRoles } from "@/lib/users/queries";

export const metadata = { title: "Papéis" };

type Row = Awaited<ReturnType<typeof listRoles>>[number];

export default async function RolesPage() {
  await requirePermission("usuarios.gerenciar");
  const roles = await listRoles();

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Papel",
      cell: (r) => (
        <div>
          <p className="font-semibold">
            {r.name} {r.isSystem ? <StatusBadge tone="brand">Padrão</StatusBadge> : null}
          </p>
          {r.description ? <p className="text-xs text-text-3">{r.description}</p> : null}
        </div>
      ),
    },
    { key: "perms", header: "Permissões", cell: (r) => r.permissions.length },
    { key: "users", header: "Usuários", cell: (r) => r.userCount },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      cell: (r) => <RoleRowActions role={r} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Papéis e permissões"
        description="Cada papel reúne o que a pessoa pode fazer no painel. Dê só o necessário."
        actions={<RoleFormDialog />}
      />
      <DataTable columns={columns} rows={roles} rowKey={(r) => r.id} caption="Lista de papéis" />
    </>
  );
}
