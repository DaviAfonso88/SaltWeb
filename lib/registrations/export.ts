import { asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { events, registrations } from "@/lib/db/schema";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getFormModel } from "@/lib/forms/registry";
import type { ExportColumn } from "@/lib/forms/types";

import { registrationWhere, type RegistrationFilters } from "./queries";

type Row = typeof registrations.$inferSelect;

const STATUS = { pending: "Pendente", confirmed: "Confirmada", cancelled: "Cancelada" } as const;

export type ExportTable = {
  title: string;
  subtitle: string;
  slug: string;
  headers: string[];
  rows: string[][];
};

/** Colunas comuns + colunas do modelo + pagamento, na mesma ordem para CSV e PDF. */
export async function buildRegistrationExport(filters: RegistrationFilters): Promise<ExportTable | null> {
  const db = getDb();
  const [event] = await db.select().from(events).where(eq(events.id, filters.eventId)).limit(1);
  if (!event) return null;

  const model = getFormModel(event.formModel);
  const modelColumns: ExportColumn[] = model ? model.columns(event.formConfig) : [];

  const rows = await db
    .select()
    .from(registrations)
    .where(registrationWhere(filters))
    .orderBy(asc(registrations.number));

  const common: { header: string; value: (r: Row) => string }[] = [
    { header: "Nº", value: (r) => String(r.number) },
    { header: "Nome", value: (r) => r.name },
    { header: "Telefone", value: (r) => r.phone },
    { header: "E-mail", value: (r) => r.email ?? "" },
    { header: "Situação", value: (r) => STATUS[r.status] },
    { header: "Valor", value: (r) => (r.amountCents ? formatCurrency(r.amountCents) : "") },
    { header: "Inscrito em", value: (r) => formatDateTime(r.createdAt) },
  ];

  const headers = [...common.map((c) => c.header), ...modelColumns.map((c) => c.header)];
  const table = rows.map((r) => [
    ...common.map((c) => c.value(r)),
    ...modelColumns.map((c) => c.value(r.answers, r.payment)),
  ]);

  const filterText = [
    filters.status ? `Situação: ${STATUS[filters.status]}` : null,
    filters.q ? `Busca: “${filters.q}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: `Inscrições — ${event.title}`,
    subtitle: [`${rows.length} inscrição(ões)`, filterText].filter(Boolean).join(" · "),
    slug: event.slug,
    headers,
    rows: table,
  };
}
