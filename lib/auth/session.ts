import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { redis } from "@/lib/redis";
import {
  AUTH_SESSION_PREFIX,
  AUTH_USER_PREFIX,
  AUTH_USERS_KEY,
} from "@/lib/participant/constants";

import { Role, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "./config";

export interface UserAccount {
  username: string;
  passwordHash: string;
  role: Role;
  displayName: string;
  createdAt: string;
}

export interface Session {
  token: string;
  username: string;
  role: Role;
  displayName: string;
  createdAt: string;
  expiresAt: string;
}

function parseJson<T>(raw: unknown): T | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") {
    return raw as T;
  }
  return null;
}

export async function createUser(
  username: string,
  password: string,
  role: Role,
  displayName: string
): Promise<UserAccount | null> {
  const existing = await redis.get(`${AUTH_USER_PREFIX}${username}`);
  if (existing) return null;

  const passwordHash = await bcrypt.hash(password, 12);
  const user: UserAccount = {
    username,
    passwordHash,
    role,
    displayName,
    createdAt: new Date().toISOString(),
  };

  // Explicit JSON.stringify to avoid Upstash auto-serialization issues
  await redis.set(`${AUTH_USER_PREFIX}${username}`, JSON.stringify(user));
  await redis.lpush(AUTH_USERS_KEY, username);

  return user;
}

export async function validateUser(
  username: string,
  password: string
): Promise<UserAccount | null> {
  const raw = await redis.get<string>(`${AUTH_USER_PREFIX}${username}`);
  if (!raw) return null;

  let user: UserAccount | null = null;

  if (typeof raw === "string") {
    try {
      user = JSON.parse(raw) as UserAccount;
    } catch {
      return null;
    }
  } else if (typeof raw === "object") {
    // Upstash sometimes auto-parses, handle the object directly
    const obj = raw as Record<string, unknown>;
    user = {
      username: String(obj.username || ""),
      passwordHash: String(obj.passwordHash || ""),
      role: String(obj.role || "") as Role,
      displayName: String(obj.displayName || ""),
      createdAt: String(obj.createdAt || ""),
    };
  }

  if (!user || !user.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return user;
}

export async function createSession(user: UserAccount): Promise<Session> {
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);

  const session: Session = {
    token,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await redis.set(`${AUTH_SESSION_PREFIX}${token}`, JSON.stringify(session));
  return session;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const raw = await redis.get<string>(`${AUTH_SESSION_PREFIX}${token}`);
  if (!raw) return null;

  let session: Session | null = null;

  if (typeof raw === "string") {
    try {
      session = JSON.parse(raw) as Session;
    } catch {
      return null;
    }
  } else if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    session = {
      token: String(obj.token || ""),
      username: String(obj.username || ""),
      role: String(obj.role || "") as Role,
      displayName: String(obj.displayName || ""),
      createdAt: String(obj.createdAt || ""),
      expiresAt: String(obj.expiresAt || ""),
    };
  }

  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    await redis.del(`${AUTH_SESSION_PREFIX}${token}`);
    return null;
  }

  return session;
}

export async function destroySession(token: string): Promise<void> {
  await redis.del(`${AUTH_SESSION_PREFIX}${token}`);
}

export async function listUsers(): Promise<Omit<UserAccount, "passwordHash">[]> {
  const usernames = await redis.lrange(AUTH_USERS_KEY, 0, -1);
  if (usernames.length === 0) return [];

  const users: Omit<UserAccount, "passwordHash">[] = [];
  for (const uname of usernames) {
    const raw = await redis.get<string>(`${AUTH_USER_PREFIX}${uname}`);
    if (!raw) continue;

    let user: UserAccount | null = null;

    if (typeof raw === "string") {
      try {
        user = JSON.parse(raw) as UserAccount;
      } catch {
        continue;
      }
    } else if (typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      user = {
        username: String(obj.username || ""),
        passwordHash: String(obj.passwordHash || ""),
        role: String(obj.role || "") as Role,
        displayName: String(obj.displayName || ""),
        createdAt: String(obj.createdAt || ""),
      };
    }

    if (!user) continue;

    users.push({
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      createdAt: user.createdAt,
    });
  }

  return users;
}

export async function deleteUser(username: string): Promise<boolean> {
  const existing = await redis.get(`${AUTH_USER_PREFIX}${username}`);
  if (!existing) return false;

  await redis.del(`${AUTH_USER_PREFIX}${username}`);
  await redis.lrem(AUTH_USERS_KEY, 0, username);
  return true;
}
