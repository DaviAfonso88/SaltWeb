"use server";

import crypto from "node:crypto";
import { count, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { fail, fromZodError, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { getDb } from "@/lib/db";
import { roles, users } from "@/lib/db/schema";

import { DEFAULT_ROLES, ADMIN_ROLE_NAME } from "./permissions";
import { hashPassword, passwordSchema, verifyPassword } from "./password";
import {
  allowLoginByIp,
  clearLoginFailures,
  getClientIp,
  isLoginLocked,
  registerLoginFailure,
} from "./rate-limit";
import { createSession, destroySession, destroyUserSessions, getSessionUser } from "./session";

const GENERIC_LOGIN_ERROR =
  "E-mail ou senha incorretos, ou conta temporariamente bloqueada. Tente novamente em alguns minutos.";

// Hash válido para igualar o tempo de resposta quando o e-mail não existe.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(crypto.randomBytes(16).toString("hex")));

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

function safeFrom(value: FormDataEntryValue | null): string {
  const from = typeof value === "string" ? value : "";
  return from.startsWith("/painel") && !from.startsWith("//") ? from : "/painel";
}

export async function login(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fromZodError(parsed.error);
  const { email, password } = parsed.data;

  const ip = getClientIp(await headers());
  if (!(await allowLoginByIp(ip))) return fail(GENERIC_LOGIN_ERROR);
  if (await isLoginLocked(email)) return fail(GENERIC_LOGIN_ERROR);

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));

  if (!user || !valid || !user.active) {
    const { locked } = await registerLoginFailure(email);
    await logAudit({
      actor: null,
      actorLabel: email,
      action: locked ? "auth.login_locked" : "auth.login_failed",
      summary: locked ? `Conta bloqueada por 15 min após 5 falhas: ${email}` : `Login com falha: ${email}`,
    });
    return fail(GENERIC_LOGIN_ERROR);
  }

  await clearLoginFailures(email);
  await createSession(user.id);
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  redirect(safeFrom(formData.get("from")));
}

export async function logout() {
  await destroySession();
  redirect("/painel/login");
}

const setupSchema = z.object({
  code: z.string().min(1, "Informe o código de configuração."),
  name: z.string().trim().min(2, "Informe o nome.").max(100),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: passwordSchema,
});

const sameSecret = (a: string, b: string) => {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

export async function setupFirstAdmin(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const expected = process.env.SETUP_TOKEN;
  if (!expected) {
    return fail("A configuração inicial está desativada: defina SETUP_TOKEN no ambiente do servidor.");
  }

  const parsed = setupSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const ip = getClientIp(await headers());
  if (!(await allowLoginByIp(ip))) return fail("Muitas tentativas. Aguarde alguns minutos.");

  if (!sameSecret(parsed.data.code, expected)) {
    await logAudit({ actor: null, actorLabel: parsed.data.email, action: "auth.setup_failed", summary: "Código de configuração incorreto" });
    return fail("Código de configuração incorreto.");
  }

  const db = getDb();
  const userId = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(7001)`);
    const [{ total }] = await tx.select({ total: count() }).from(users);
    if (total > 0) return null;

    for (const role of DEFAULT_ROLES) {
      await tx
        .insert(roles)
        .values({ name: role.name, description: role.description, permissions: role.permissions, isSystem: true })
        .onConflictDoNothing({ target: roles.name });
    }
    const [adminRole] = await tx.select().from(roles).where(eq(roles.name, ADMIN_ROLE_NAME)).limit(1);

    const [created] = await tx
      .insert(users)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hashPassword(parsed.data.password),
        roleId: adminRole.id,
        mustChangePassword: false,
      })
      .returning({ id: users.id });
    return created.id;
  });

  if (!userId) return fail("A configuração inicial já foi feita.");

  await logAudit({
    actor: { id: userId, name: parsed.data.name },
    action: "auth.setup",
    entityType: "user",
    entityId: userId,
    summary: "Primeiro administrador criado",
  });
  await createSession(userId);
  redirect("/painel");
}

const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    next: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "As senhas não conferem." });

export async function changePassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) return fail("Sua sessão expirou. Entre novamente.");

  const parsed = changePasswordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return fromZodError(parsed.error);

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return fail("A senha atual está incorreta.", { fieldErrors: { current: ["Senha atual incorreta."] } });
  }
  if (parsed.data.current === parsed.data.next) {
    return fail("A nova senha deve ser diferente da atual.", {
      fieldErrors: { next: ["Escolha uma senha diferente da atual."] },
    });
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.next), mustChangePassword: false })
    .where(eq(users.id, user.id));
  await destroyUserSessions(user.id, session.sessionId);
  await logAudit({
    actor: session,
    action: "auth.password_changed",
    entityType: "user",
    entityId: user.id,
    summary: "Senha alterada pelo próprio usuário",
  });
  redirect("/painel");
}
