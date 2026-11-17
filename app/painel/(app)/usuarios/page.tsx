import { DataTable, type Column } from "@/components/painel/DataTable";
import { PageHeader } from "@/components/painel/PageHeader";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { UserFormDialog } from "@/components/painel/usuarios/UserFormDialog";
import { UserRowActions } from "@/components/painel/usuarios/UserRowActions";
import { requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { listRoles, listUsers } from "@/lib/users/queries";

export const metadata = { title: "Usuários" };

type Row = Awaited<ReturnType<typeof listUsers>>[number];

export default async function UsersPage() {
  const me = await requirePermission("usuarios.gerenciar");
  const [users, roles] = await Promise.all([listUsers(), listRoles()]);
  const roleOptions = roles.map((r) => ({ id: r.id, name: r.name }));

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Nome",
      cell: (u) => (
        <div>
          <p className="font-semibold">{u.name}</p>
          <p className="text-xs text-text-3">{u.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Papel", cell: (u) => u.roleName },
    {
      key: "status",
      header: "Situação",
      cell: (u) => (
        <div className="flex flex-wrap justify-end gap-1 sm:justify-start">
          <StatusBadge tone={u.active ? "success" : "neutral"}>{u.active ? "Ativo" : "Inativo"}</StatusBadge>
          {u.mustChangePassword ? <StatusBadge tone="warning">Senha provisória</StatusBadge> : null}
        </div>
      ),
    },
    {
      key: "last",
      header: "Último acesso",
      cell: (u) => (u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Nunca"),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      cell: (u) => (
        <UserRowActions
          user={{ id: u.id, name: u.name, email: u.email, roleId: u.roleId, active: u.active }}
          roles={roleOptions}
          isSelf={u.id === me.id}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Pessoas da equipe com acesso ao painel e o papel de cada uma."
        actions={<UserFormDialog roles={roleOptions} />}
      />
      <DataTable columns={columns} rows={users} rowKey={(u) => u.id} caption="Lista de usuários do painel" />
    </>
  );
}
