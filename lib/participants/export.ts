import { asc, eq, inArray } from "drizzle-orm";

import type { SessionUser } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { events, participantGuardians } from "@/lib/db/schema";
import type { ExportTable } from "@/lib/registrations/export";
import { slugify } from "@/lib/text";

import { getHealthSummaries } from "./health";
import { listParticipantsForExport, type ParticipantFilters } from "./queries";

export type ParticipantExportFilters = Omit<ParticipantFilters, "page">;

const join = (items: string[]) => items.join("; ");

/**
 * Tabela de exportação dos participantes. As colunas de saúde só entram quando `user` é informado
 * (a rota só o informa com `participantes.saude.ver` e pedido explícito).
 */
export async function buildParticipantExport(filters: ParticipantExportFilters, healthUser: SessionUser | null): Promise<(ExportTable & { includesHealth: boolean }) | null> {
  const db = getDb();
  const [event] = await db.select({ title: events.title, formModel: events.formModel }).from(events).where(eq(events.id, filters.eventId)).limit(1);
  if (!event || event.formModel !== "acampamento") return null;

  const people = await listParticipantsForExport(filters);
  const ids = people.map((p) => p.id);
  const guardians = ids.length
    ? await db.select().from(participantGuardians).where(inArray(participantGuardians.participantId, ids)).orderBy(asc(participantGuardians.position))
    : [];
  const guardiansOf = new Map<string, string[]>();
  for (const g of guardians) guardiansOf.set(g.participantId, [...(guardiansOf.get(g.participantId) ?? []), `${g.name} (${g.relationship}) ${g.phone}`]);
  const health = healthUser ? await getHealthSummaries(filters.eventId, healthUser) : null;

  const headers = ["Nº", "Nome", "Sexo", "Idade", "Nascimento", "CPF", "Igreja", "Cidade", "Celular", "WhatsApp", "E-mail", "Responsáveis", "Contato de emergência"];
  if (health) headers.push("Tipo sanguíneo", "Alergias", "Medicamentos", "Condições", "Restrições alimentares", "Necessidades especiais", "Perguntas adicionais");

  const rows = people.map((p) => {
    const emergency = p.emergencyContact ? `${p.emergencyContact.nome}${p.emergencyContact.parentesco ? ` (${p.emergencyContact.parentesco})` : ""} ${p.emergencyContact.telefone}` : "";
    const base = [
      String(p.number),
      p.name,
      p.sex ?? "",
      p.age === null ? "" : String(p.age),
      p.birthDate ?? "",
      p.cpf ?? "",
      p.church ?? "",
      p.city ?? "",
      p.mobile ?? "",
      p.whatsapp ?? "",
      p.email ?? "",
      join(guardiansOf.get(p.id) ?? []),
      emergency,
    ];
    if (!health) return base;
    const h = health.get(p.id);
    return [
      ...base,
      h?.bloodType ?? "",
      h ? join(h.allergies) : "",
      h ? join(h.medications) : "",
      h ? join(h.conditions) : "",
      h ? join(h.dietaryRestrictions) : "",
      h?.specialNeeds ? h.specialNeedsDetails || "Sim" : "",
      h ? join(h.extraAnswers.map((a) => `${a.pergunta}: ${a.tipo === "simnao" ? (a.resposta === "sim" ? "Sim" : "Não") : a.resposta}`)) : "",
    ];
  });

  const active = [filters.q && `busca "${filters.q}"`, filters.church && `igreja ${filters.church}`, filters.city && `cidade ${filters.city}`, filters.sex && `sexo ${filters.sex}`].filter(Boolean);
  return {
    title: `Participantes: ${event.title}`,
    subtitle: `${rows.length} participante(s)${active.length ? ` · filtros: ${active.join(", ")}` : ""}${health ? " · inclui dados de saúde (confidencial)" : ""}`,
    slug: slugify(event.title),
    headers,
    rows,
    includesHealth: Boolean(health),
  };
}
