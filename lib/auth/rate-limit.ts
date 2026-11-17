import { Ratelimit } from "@upstash/ratelimit";
import crypto from "node:crypto";

import { redis } from "@/lib/redis";
import { describeError } from "@/lib/safe-error";

const FAIL_WINDOW_SECONDS = 15 * 60;
const MAX_FAILURES = 5;

const sha = (text: string) => crypto.createHash("sha256").update(text).digest("hex").slice(0, 32);
const failKey = (email: string) => `salt:fail:login:${sha(email)}`;
const lockKey = (email: string) => `salt:lock:login:${sha(email)}`;

function limiter(prefix: string, requests: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]) {
  return new Ratelimit({
    redis,
    prefix: `salt:rl:${prefix}`,
    limiter: Ratelimit.slidingWindow(requests, window),
  });
}

let cache: { loginIp: Ratelimit; publicSubmit: Ratelimit; contactSubmit: Ratelimit } | null = null;
function limiters() {
  cache ??= {
    loginIp: limiter("login-ip", 20, "15 m"),
    publicSubmit: limiter("public-submit", 5, "1 m"),
    contactSubmit: limiter("contact-submit", 3, "1 m"),
  };
  return cache;
}

/**
 * Retorna `true` se a requisição pode seguir. Se o Redis estiver indisponível,
 * deixa passar (para não perder inscrições) e registra no log.
 */
async function allow(name: "loginIp" | "publicSubmit" | "contactSubmit", key: string) {
  try {
    const { success } = await limiters()[name].limit(key);
    return success;
  } catch (error) {
    console.error(`[rate-limit] ${name} indisponível`, describeError(error));
    return true;
  }
}

export const allowLoginByIp = (ip: string) => allow("loginIp", ip);
export const allowPublicSubmit = (ip: string) => allow("publicSubmit", ip);
export const allowContactSubmit = (ip: string) => allow("contactSubmit", ip);

export async function isLoginLocked(email: string): Promise<boolean> {
  try {
    return (await redis.exists(lockKey(email))) === 1;
  } catch (error) {
    console.error("[rate-limit] bloqueio indisponível", describeError(error));
    return false;
  }
}

/** Conta uma falha; na 5ª em 15 min grava o bloqueio de 15 min. Retorna se ficou bloqueado. */
export async function registerLoginFailure(email: string): Promise<{ locked: boolean }> {
  try {
    const key = failKey(email);
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, FAIL_WINDOW_SECONDS);
    if (count >= MAX_FAILURES) {
      await redis.set(lockKey(email), "1", { ex: FAIL_WINDOW_SECONDS });
      await redis.del(key);
      return { locked: true };
    }
  } catch (error) {
    console.error("[rate-limit] falha ao registrar", describeError(error));
  }
  return { locked: false };
}

export async function clearLoginFailures(email: string) {
  try {
    await redis.del(failKey(email));
  } catch {
    /* ignora */
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
