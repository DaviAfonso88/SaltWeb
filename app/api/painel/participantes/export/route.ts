import { NextResponse } from "next/server";
import { z } from "zod";

import { logAudit } from "@/lib/audit";
import { authorizeRoute, can } from "@/lib/auth/guard";
import { toCsv } from "@/lib/export/csv";
import { toPdf } from "@/lib/export/pdf";
import { todayInSaoPaulo } from "@/lib/format";
import { buildParticipantExport } from "@/lib/participants/export";

const querySchema = z.object({
  evento: z.string().uuid(),
  formato: z.enum(["csv", "pdf"]),
  q: z.string().max(100).optional(),
  igreja: z.string().max(160).optional(),
  cidade: z.string().max(120).optional(),
  sexo: z.enum(["M", "F"]).optional(),
  saude: z.enum(["1"]).optional(),
});

export async function GET(request: Request) {
  const auth = await authorizeRoute("participantes.exportar");
  if (!auth.ok) return auth.response;

  const params = Object.fromEntries([...new URL(request.url).searchParams].filter(([, v]) => v !== ""));
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  const { evento, formato, q, igreja, cidade, sexo, saude } = parsed.data;

  // Saúde só vai na exportação com pedido explícito e permissão própria.
  if (saude && !can(auth.user, "participantes.saude.ver")) {
    await logAudit({ actor: auth.user, action: "auth.forbidden", summary: "Exportação com dados de saúde sem permissão", metadata: { permission: "participantes.saude.ver" } });
    return NextResponse.json({ error: "Sem permissão para exportar dados de saúde." }, { status: 403 });
  }

  const table = await buildParticipantExport({ eventId: evento, q, church: igreja, city: cidade, sex: sexo }, saude ? auth.user : null);
  if (!table) return NextResponse.json({ error: "Acampamento não encontrado." }, { status: 404 });

  await logAudit({
    actor: auth.user,
    action: "participant.export",
    entityType: "event",
    entityId: evento,
    summary: `Exportação ${formato.toUpperCase()} de participantes: ${table.title} (${table.rows.length} linhas${table.includesHealth ? ", com dados de saúde" : ""})`,
    metadata: { formato, incluiuSaude: table.includesHealth, linhas: table.rows.length, filtros: { q: q ?? null, igreja: igreja ?? null, cidade: cidade ?? null, sexo: sexo ?? null } },
  });

  const filename = `participantes-${table.slug}-${todayInSaoPaulo()}${table.includesHealth ? "-saude" : ""}.${formato}`;
  const common = {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (formato === "csv") {
    const csv = toCsv(
      table.headers.map((header, i) => ({ header, value: (row: string[]) => row[i] ?? "" })),
      table.rows,
    );
    return new Response(csv, { headers: { ...common, "Content-Type": "text/csv; charset=utf-8" } });
  }

  const pdf = toPdf({ title: table.title, subtitle: table.subtitle, columns: table.headers, rows: table.rows });
  return new Response(Buffer.from(pdf), { headers: { ...common, "Content-Type": "application/pdf" } });
}
