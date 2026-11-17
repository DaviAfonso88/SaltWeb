import { NextResponse } from "next/server";
import { z } from "zod";

import { logAudit } from "@/lib/audit";
import { authorizeRoute } from "@/lib/auth/guard";
import { toCsv } from "@/lib/export/csv";
import { toPdf } from "@/lib/export/pdf";
import { todayInSaoPaulo } from "@/lib/format";
import { buildRegistrationExport } from "@/lib/registrations/export";
import { REGISTRATION_STATUSES } from "@/lib/registrations/queries";

const querySchema = z.object({
  evento: z.string().uuid(),
  formato: z.enum(["csv", "pdf"]),
  situacao: z.enum(REGISTRATION_STATUSES as [string, ...string[]]).optional(),
  q: z.string().max(100).optional(),
});

export async function GET(request: Request) {
  const auth = await authorizeRoute("inscricoes.exportar");
  if (!auth.ok) return auth.response;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = querySchema.safeParse({ ...params, situacao: params.situacao || undefined, q: params.q || undefined });
  if (!parsed.success) return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  const { evento, formato, situacao, q } = parsed.data;

  const table = await buildRegistrationExport({
    eventId: evento,
    status: situacao as (typeof REGISTRATION_STATUSES)[number] | undefined,
    q,
  });
  if (!table) return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });

  await logAudit({
    actor: auth.user,
    action: "registration.export",
    entityType: "event",
    entityId: evento,
    summary: `Exportação ${formato.toUpperCase()} de inscrições: ${table.title} (${table.rows.length} linhas)`,
    metadata: { formato, situacao: situacao ?? null, q: q ?? null, linhas: table.rows.length },
  });

  const filename = `inscricoes-${table.slug}-${todayInSaoPaulo()}.${formato}`;
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
