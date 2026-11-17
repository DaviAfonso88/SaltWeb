import { and, asc, count, eq, ne, sql } from "drizzle-orm";

import { ADMIN_PERMISSION } from "@/lib/auth/permissions";
import { getDb, type Db, type Tx } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

export async function listUsers() {
  return getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      active: users.active,
      mustChangePassword: users.mustChangePassword,
      lastLoginAt: users.lastLoginAt,
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .orderBy(asc(users.name));
}

export async function listRoles() {
  const rows = await getDb()
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      permissions: roles.permissions,
      isSystem: roles.isSystem,
      userCount: count(users.id),
    })
    .from(roles)
    .leftJoin(users, eq(users.roleId, roles.id))
    .groupBy(roles.id)
    .orderBy(asc(roles.name));
  return rows;
}

export async function getRole(id: string, db: Db | Tx = getDb()) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return role ?? null;
}

const hasAdminPermission = sql`${roles.permissions} @> ARRAY[${ADMIN_PERMISSION}]::text[]`;

/** Usuários ativos cujo papel contém `usuarios.gerenciar`, opcionalmente excluindo um usuário ou um papel. */
export async function countActiveAdmins(
  db: Db | Tx,
  exclude: { userId?: string; roleId?: string } = {},
): Promise<number> {
  const filters = [eq(users.active, true), hasAdminPermission];
  if (exclude.userId) filters.push(ne(users.id, exclude.userId));
  if (exclude.roleId) filters.push(ne(roles.id, exclude.roleId));
  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(and(...filters));
  return total;
}

export async function isActiveAdmin(db: Db | Tx, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(and(eq(users.id, userId), eq(users.active, true), hasAdminPermission))
    .limit(1);
  return Boolean(row);
}
