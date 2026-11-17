import crypto from "node:crypto";
import { and, eq, gt, ne } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { cache } from "react";

import { getDb } from "@/lib/db";
import { roles, sessions, users } from "@/lib/db/schema";

import type { Permission } from "./permissions";

export const SESSION_COOKIE = "salt-session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export type SessionUser = {
  sessionId: string;
  id: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
  roleId: string;
  roleName: string;
  permissions: Permission[];
};

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("base64url");
  const h = await headers();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
    ip: h.get("x-forwarded-for")?.split(",")[0].trim() ?? null,
    userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Carrega sessão + usuário + papel numa consulta; rejeita sessão expirada ou usuário inativo. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = getDb();
  const id = hashToken(token);
  const [row] = await db
    .select({
      sessionId: sessions.id,
      lastSeenAt: sessions.lastSeenAt,
      userId: users.id,
      name: users.name,
      email: users.email,
      mustChangePassword: users.mustChangePassword,
      roleId: roles.id,
      roleName: roles.name,
      permissions: roles.permissions,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(roles, eq(roles.id, users.roleId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date()), eq(users.active, true)))
    .limit(1);

  if (!row) return null;

  if (Date.now() - row.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, id));
  }

  return {
    sessionId: row.sessionId,
    id: row.userId,
    name: row.name,
    email: row.email,
    mustChangePassword: row.mustChangePassword,
    roleId: row.roleId,
    roleName: row.roleName,
    permissions: row.permissions as Permission[],
  };
});

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb().delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  store.delete(SESSION_COOKIE);
}

export async function destroyUserSessions(userId: string, exceptSessionId?: string) {
  const db = getDb();
  await db
    .delete(sessions)
    .where(
      exceptSessionId
        ? and(eq(sessions.userId, userId), ne(sessions.id, exceptSessionId))
        : eq(sessions.userId, userId),
    );
}
