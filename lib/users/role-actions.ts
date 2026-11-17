"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { ADMIN_PERMISSION, isPermission } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

import { countActiveAdmins, getRole } from "./queries";

const roleSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do papel.").max(60),
  description: z.string().trim().max(200).optional(),
  permissions: z
    .array(z.string())
    .refine((list) => list.every(isPermission), "Permissão desconhecida.")
    .refine((list) => list.length > 0, "Escolha ao menos uma permissão."),
});

function parse(formData: FormData) {
  const permissions = formData.getAll("permissions").map(String);
  // A ficha de saúde só pode ser editada por quem também pode vê-la.
  if (permissions.includes("participantes.saude.editar") && !permissions.includes("participantes.saude.ver")) {
    permissions.push("participantes.saude.ver");
  }
  return roleSchema.safeParse({
    name: formData.get("name"),
    description: (formData.get("description") as string) || undefined,
    permissions,
  });
}

export async function createRole(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;

  const parsed = parse(formData);
  if (!parsed.success) return fromZodError(parsed.error);

  const db = getDb();
  const [clash] = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, parsed.data.name)).limit(1);
  if (clash) return fail("Já existe um papel com este nome.", { fieldErrors: { name: ["Nome já usado."] } });

  const [created] = await db
    .insert(roles)
    .values({ ...parsed.data, description: parsed.data.description ?? null })
    .returning({ id: roles.id });

  await logAudit({
    actor: auth.user,
    action: "role.create",
    entityType: "role",
    entityId: created.id,
    summary: `Papel criado: ${parsed.data.name}`,
    metadata: { permissions: parsed.data.permissions },
  });
  revalidatePath("/painel/papeis");
  return ok(undefined, "Papel criado.");
}

export async function updateRole(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;

  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = parse(formData);
  if (!id.success) return fail("Papel inválido.");
  if (!parsed.success) return fromZodError(parsed.error);

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7002)`);
    const role = await getRole(id.data, tx);
    if (!role) return fail("Papel não encontrado.");
    if (role.name === "Administrador" && role.isSystem) return fail("O papel Administrador não pode ser editado.");

    const [clash] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.name, parsed.data.name)).limit(1);
    if (clash && clash.id !== id.data) {
      return fail("Já existe um papel com este nome.", { fieldErrors: { name: ["Nome já usado."] } });
    }

    const losesAdmin = role.permissions.includes(ADMIN_PERMISSION) && !parsed.data.permissions.includes(ADMIN_PERMISSION);
    if (losesAdmin && (await countActiveAdmins(tx, { roleId: id.data })) === 0) {
      return fail("Remover esta permissão deixaria o sistema sem administrador ativo.");
    }

    await tx
      .update(roles)
      .set({ ...parsed.data, description: parsed.data.description ?? null })
      .where(eq(roles.id, id.data));
    return ok(undefined, "Papel atualizado.");
  });

  if (result.ok) {
    await logAudit({
      actor: auth.user,
      action: "role.update",
      entityType: "role",
      entityId: id.data,
      summary: `Papel atualizado: ${parsed.data.name}`,
      metadata: { permissions: parsed.data.permissions },
    });
    revalidatePath("/painel/papeis");
  }
  return result;
}

export async function deleteRole(roleId: string): Promise<ActionResult> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;

  const db = getDb();
  const role = await getRole(roleId);
  if (!role) return fail("Papel não encontrado.");
  if (role.name === "Administrador" && role.isSystem) return fail("O papel Administrador não pode ser excluído.");

  const [inUse] = await db.select({ id: users.id }).from(users).where(eq(users.roleId, roleId)).limit(1);
  if (inUse) return fail("Há usuários com este papel. Mude o papel deles antes de excluir.");

  await db.delete(roles).where(eq(roles.id, roleId));
  await logAudit({
    actor: auth.user,
    action: "role.delete",
    entityType: "role",
    entityId: roleId,
    summary: `Papel excluído: ${role.name}`,
  });
  revalidatePath("/painel/papeis");
  return ok(undefined, "Papel excluído.");
}
