import { NextResponse } from "next/server";

import { redis } from "@/lib/redis";
import { AUTH_USER_PREFIX, AUTH_USERS_KEY } from "@/lib/participant/constants";

export async function GET() {
  try {
    const usernames = await redis.lrange(AUTH_USERS_KEY, 0, -1);

    const result: {
      usernamesInList: string[];
      userKeys: string[];
      users: Array<Record<string, unknown>>;
    } = {
      usernamesInList: usernames,
      userKeys: [],
      users: [],
    };

    for (const uname of usernames) {
      const key = `${AUTH_USER_PREFIX}${uname}`;
      result.userKeys.push(key);

      const raw = await redis.get(key);

      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          result.users.push({
            username: parsed.username,
            hasPasswordHash: !!parsed.passwordHash,
            passwordHashPrefix: parsed.passwordHash
              ? String(parsed.passwordHash).substring(0, 10) + "..."
              : null,
            role: parsed.role,
          });
        } catch {
          result.users.push({ key, error: "JSON parse failed", rawPreview: String(raw).substring(0, 100) });
        }
      } else if (raw && typeof raw === "object") {
        const obj = raw as Record<string, unknown>;
        result.users.push({
          username: obj.username,
          hasPasswordHash: !!obj.passwordHash,
          passwordHashPrefix: obj.passwordHash
            ? String(obj.passwordHash).substring(0, 10) + "..."
            : null,
          role: obj.role,
          storageType: "object",
        });
      } else {
        result.users.push({ key, rawType: typeof raw, rawValue: String(raw) });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
