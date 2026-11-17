import { eq } from "drizzle-orm";

import type { Tx } from "@/lib/db";
import { eventImages } from "@/lib/db/schema";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type Mime = "image/jpeg" | "image/png" | "image/webp";

/** Detecta o tipo real pelos bytes iniciais, ignorando o que o navegador declarou. */
function sniff(bytes: Uint8Array): Mime | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export type ValidatedImage = { data: Buffer; mime: Mime; size: number };

export async function validateImage(
  file: File,
): Promise<{ ok: true; image: ValidatedImage } | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: "Arquivo de imagem vazio." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "A imagem deve ter no máximo 5 MB." };
  const data = Buffer.from(await file.arrayBuffer());
  const mime = sniff(data);
  if (!mime) return { ok: false, error: "Use uma imagem JPG, PNG ou WebP." };
  return { ok: true, image: { data, mime, size: data.length } };
}

export async function storeImage(tx: Tx, image: ValidatedImage): Promise<string> {
  const [row] = await tx.insert(eventImages).values(image).returning({ id: eventImages.id });
  return row.id;
}

export async function deleteImage(tx: Tx, id: string): Promise<void> {
  await tx.delete(eventImages).where(eq(eventImages.id, id));
}
