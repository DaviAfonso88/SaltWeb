import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { fail, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";

import type { Permission } from "./permissions";
import { getSessionUser, type SessionUser } from "./session";

export type { SessionUser };

export const LOGIN_PATH = "/painel/login";
export const CHANGE_PASSWORD_PATH = "/painel/conta/senha";
export const NO_ACCESS_PATH = "/painel/sem-acesso";

export const can = (user: SessionUser, permission: Permission) =>
  user.permissions.includes(permission);

export const canAny = (user: SessionUser, permissions: Permission[]) =>
  permissions.some((p) => can(user, p));

const audit = (user: SessionUser, permission: Permission | Permission[], where: string) =>
  logAudit({
    actor: user,
    action: "auth.forbidden",
    summary: `Acesso negado a ${where}`,
    metadata: { permission },
  });

/** Páginas: exige login (e senha definitiva). Redireciona quando não atende. */
export async function requireUser(options: { allowPasswordChange?: boolean } = {}) {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  if (user.mustChangePassword && !options.allowPasswordChange) redirect(CHANGE_PASSWORD_PATH);
  return user;
}

/** Páginas: exige login + permissão (todas as listadas). */
export async function requirePermission(permission: Permission | Permission[]) {
  const user = await requireUser();
  const needed = Array.isArray(permission) ? permission : [permission];
  if (!needed.every((p) => can(user, p))) {
    await audit(user, permission, "uma página do painel");
    redirect(NO_ACCESS_PATH);
  }
  return user;
}

/** Páginas: exige login + ao menos uma das permissões. */
export async function requireAnyPermission(permissions: Permission[]) {
  const user = await requireUser();
  if (!canAny(user, permissions)) {
    await audit(user, permissions, "uma página do painel");
    redirect(NO_ACCESS_PATH);
  }
  return user;
}

/** Server Actions: devolve o usuário ou um ActionResult de erro. */
export async function authorizeAction(
  permission: Permission | Permission[],
): Promise<{ ok: true; user: SessionUser } | { ok: false; result: ActionResult<never> }> {
  const user = await getSessionUser();
  if (!user) return { ok: false, result: fail("Sua sessão expirou. Entre novamente.") };
  if (user.mustChangePassword) {
    return { ok: false, result: fail("Defina uma nova senha antes de continuar.") };
  }
  const needed = Array.isArray(permission) ? permission : [permission];
  if (!needed.every((p) => can(user, p))) {
    await audit(user, permission, "uma ação do painel");
    return { ok: false, result: fail("Você não tem permissão para esta ação.") };
  }
  return { ok: true, user };
}

/** Route Handlers: 401/403 JSON sem detalhes do recurso. */
export async function authorizeRoute(
  permission: Permission | Permission[],
): Promise<{ ok: true; user: SessionUser } | { ok: false; response: NextResponse }> {
  const user = await getSessionUser();
  if (!user || user.mustChangePassword) {
    return { ok: false, response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };
  }
  const needed = Array.isArray(permission) ? permission : [permission];
  if (!needed.every((p) => can(user, p))) {
    await audit(user, permission, "uma rota do painel");
    return { ok: false, response: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) };
  }
  return { ok: true, user };
}
