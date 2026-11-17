import type { ZodError } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; conflict?: boolean };

export const ok = <T = undefined>(data?: T, message?: string): ActionResult<T> => ({
  ok: true,
  data,
  message,
});

export const fail = (
  error: string,
  extra: { fieldErrors?: Record<string, string[]>; conflict?: boolean } = {},
): ActionResult<never> => ({ ok: false, error, ...extra });

export function fromZodError(error: ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fail("Confira os campos destacados.", { fieldErrors });
}
