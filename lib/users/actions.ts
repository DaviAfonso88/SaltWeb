"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { generateProvisionalPassword, hashPassword } from "@/lib/auth/password";
import { authorizeAction } from "@/lib/auth/guard";
import { destroyUserSessions } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

import { countActiveAdmins, isActiveAdmin } from "./queries";

const LAST_ADMIN_ERROR = "Este é o último administrador ativo. Crie ou promova outro antes de continuar.";

const userSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome.").max(100),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  roleId: z.string().uuid("Escolha um papel."),
});

const parse = (formData: FormData) =>
  userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
  });

export type ProvisionalPassword = { password: string; email: string };

export async function createUser(
  _prev: ActionResult<ProvisionalPassword> | undefined,
  formData: FormData,
): Promise<ActionResult<ProvisionalPassword>> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;

  const parsed = parse(formData);
  if (!parsed.success) return fromZodError(parsed.error);

  const db = getDb();
  const [duplicate] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (duplicate) return fail("Já existe um usuário com este e-mail.", { fieldErrors: { email: ["E-mail já cadastrado."] } });

  const password = generateProvisionalPassword();
  const [created] = await db
    .insert(users)
    .values({ ...parsed.data, passwordHash: await hashPassword(password), mustChangePassword: true })
    .returning({ id: users.id });

  await logAudit({
    actor: auth.user,
    action: "user.create",
    entityType: "user",
    entityId: created.id,
    summary: `Usuário criado: ${parsed.data.email}`,
  });
  revalidatePath("/painel/usuarios");
  return ok({ password, email: parsed.data.email }, "Usuário criado.");
}

export async function updateUser(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;

  const id = z.string().uuid().safeParse(formData.get("id"));
  const parsed = parse(formData);
  if (!id.success) return fail("Usuário inválido.");
  if (!parsed.success) return fromZodError(parsed.error);

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7002)`);
    const [current] = await tx.select().from(users).where(eq(users.id, id.data)).limit(1);
    if (!current) return fail("Usuário não encontrado.");

    const [clash] = await tx.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (clash && clash.id !== id.data) {
      return fail("Já existe um usuário com este e-mail.", { fieldErrors: { email: ["E-mail já cadastrado."] } });
    }

    if (current.roleId !== parsed.data.roleId && (await isActiveAdmin(tx, id.data))) {
      const [newRole] = await tx.select().from(roles).where(eq(roles.id, parsed.data.roleId)).limit(1);
      if (!newRole) return fail("Papel não encontrado.");
      if (!newRole.permissions.includes("usuarios.gerenciar") && (await countActiveAdmins(tx, { userId: id.data })) === 0) {
        return fail(LAST_ADMIN_ERROR);
      }
    }

    await tx.update(users).set(parsed.data).where(eq(users.id, id.data));
    return ok(undefined, "Usuário atualizado.");
  });

  if (result.ok) {
    await logAudit({
      actor: auth.user,
      action: "user.update",
      entityType: "user",
      entityId: id.data,
      summary: `Usuário atualizado: ${parsed.data.email}`,
      metadata: { roleId: parsed.data.roleId },
    });
    revalidatePath("/painel/usuarios");
  }
  return result;
}

export async function setUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;
  if (userId === auth.user.id) return fail("Você não pode desativar a sua própria conta.");

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7002)`);
    if (!active && (await isActiveAdmin(tx, userId)) && (await countActiveAdmins(tx, { userId })) === 0) {
      return fail(LAST_ADMIN_ERROR);
    }
    await tx.update(users).set({ active }).where(eq(users.id, userId));
    return ok(undefined, active ? "Usuário reativado." : "Usuário desativado.");
  });

  if (result.ok) {
    if (!active) await destroyUserSessions(userId);
    await logAudit({
      actor: auth.user,
      action: active ? "user.activate" : "user.deactivate",
      entityType: "user",
      entityId: userId,
      summary: active ? "Usuário reativado" : "Usuário desativado",
    });
    revalidatePath("/painel/usuarios");
  }
  return result;
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;
  if (userId === auth.user.id) return fail("Você não pode excluir a sua própria conta.");

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7002)`);
    const [target] = await tx.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return fail("Usuário não encontrado.");
    if ((await isActiveAdmin(tx, userId)) && (await countActiveAdmins(tx, { userId })) === 0) {
      return fail(LAST_ADMIN_ERROR);
    }
    await tx.delete(users).where(eq(users.id, userId));
    return ok(target.email, "Usuário excluído.");
  });

  if (result.ok) {
    await logAudit({
      actor: auth.user,
      action: "user.delete",
      entityType: "user",
      entityId: userId,
      summary: `Usuário excluído: ${String(result.data)}`,
    });
    revalidatePath("/painel/usuarios");
  }
  return result.ok ? ok(undefined, result.message) : result;
}

export async function resetUserPassword(userId: string): Promise<ActionResult<ProvisionalPassword>> {
  const auth = await authorizeAction("usuarios.gerenciar");
  if (!auth.ok) return auth.result;

  const db = getDb();
  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return fail("Usuário não encontrado.");

  const password = generateProvisionalPassword();
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), mustChangePassword: true })
    .where(eq(users.id, userId));
  await destroyUserSessions(userId);

  await logAudit({
    actor: auth.user,
    action: "user.reset_password",
    entityType: "user",
    entityId: userId,
    summary: `Senha redefinida: ${target.email}`,
  });
  revalidatePath("/painel/usuarios");
  return ok({ password, email: target.email }, "Senha redefinida.");
}
