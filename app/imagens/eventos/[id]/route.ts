import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { eventImages } from "@/lib/db/schema";

/** Imagens de eventos são públicas (fazem parte das páginas públicas) e imutáveis por id. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return new Response(null, { status: 404 });

  const [image] = await getDb()
    .select({ data: eventImages.data, mime: eventImages.mime })
    .from(eventImages)
    .where(eq(eventImages.id, id))
    .limit(1);
  if (!image) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
