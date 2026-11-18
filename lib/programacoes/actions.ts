"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { fail, fromZodError, ok, type ActionResult } from "@/lib/action-result";
import { logAudit } from "@/lib/audit";
import { authorizeAction } from "@/lib/auth/guard";
import { expireTag, TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { programacoes } from "@/lib/db/schema";

import { PROGRAMACOES } from "./catalog";
import { describeSchedule, scheduleSchema, type Schedule } from "./schedule";

function refresh() {
  expireTag(TAGS.programacoes);
  // Home, rodapé (todas as páginas do site), /eventos e /sobre mostram esses horários.
  revalidatePath("/", "layout");
}

const describe = (schedule: Schedule) => describeSchedule(schedule).long || "(vazio)";

/** Salva dia e horário de uma programação fixa (cria a linha na primeira edição). */
export async function saveProgramacao(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const auth = await authorizeAction("eventos.gerenciar");
  if (!auth.ok) return auth.result;

  const slug = String(formData.get("slug") ?? "");
  const info = PROGRAMACOES.find((p) => p.slug === slug);
  if (!info) return fail("Programação não encontrada.");

  const parsed = scheduleSchema.safeParse({
    kind: formData.get("kind"),
    weekday: formData.get("weekday") ?? 5,
    nth: formData.get("nth") ?? 1,
    time: formData.get("time") ?? "",
    customDay: formData.get("customDay") ?? "",
    customTime: formData.get("customTime") ?? "",
  });
  if (!parsed.success) return fromZodError(parsed.error);
  const next = parsed.data;
  const version = Number(formData.get("version") ?? 0);

  const db = getDb();
  const result = await db.transaction(async (tx): Promise<ActionResult<{ before: Schedule }>> => {
    const [current] = await tx.select().from(programacoes).where(eq(programacoes.slug, slug)).limit(1);
    const values = {
      kind: next.kind,
      weekday: next.weekday,
      nth: next.nth,
      time: next.time,
      customDay: next.customDay || null,
      customTime: next.customTime || null,
    };

    if (!current) {
      // Ainda sem linha no banco: quem editou viu o padrão (versão 0).
      if (version !== 0) return fail("Esta programação foi alterada por outra pessoa. Recarregue a página.", { conflict: true });
      const [created] = await tx.insert(programacoes).values({ slug, ...values }).onConflictDoNothing().returning({ slug: programacoes.slug });
      if (!created) return fail("Esta programação foi alterada por outra pessoa. Recarregue a página.", { conflict: true });
      return ok({ before: info.padrao }, "Salvo.");
    }

    if (current.version !== version) {
      return fail("Esta programação foi alterada por outra pessoa. Recarregue a página para ver a versão atual.", { conflict: true });
    }
    const [updated] = await tx
      .update(programacoes)
      .set({ ...values, version: current.version + 1, updatedAt: new Date() })
      .where(and(eq(programacoes.slug, slug), eq(programacoes.version, current.version)))
      .returning({ slug: programacoes.slug });
    if (!updated) return fail("Esta programação foi alterada por outra pessoa.", { conflict: true });
    return ok(
      {
        before: {
          kind: current.kind,
          weekday: current.weekday,
          nth: current.nth,
          time: current.time,
          customDay: current.customDay ?? "",
          customTime: current.customTime ?? "",
        },
      },
      "Salvo.",
    );
  });

  if (!result.ok) return result;

  await logAudit({
    actor: auth.user,
    action: "programacao.update",
    entityType: "programacao",
    entityId: slug,
    summary: `${info.titulo}: ${describe(result.data!.before)} → ${describe(next)}`,
  });
  refresh();
  return ok(undefined, `${info.titulo} atualizado. O site já mostra o novo horário.`);
}
