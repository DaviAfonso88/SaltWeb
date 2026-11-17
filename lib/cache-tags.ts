import { revalidateTag } from "next/cache";

export const TAGS = {
  eventos: "eventos",
  devocionais: "devocionais",
} as const;

/** Expira imediatamente os dados em cache com a tag (funciona com `unstable_cache`). */
export function expireTag(tag: (typeof TAGS)[keyof typeof TAGS]) {
  revalidateTag(tag, { expire: 0 });
}
