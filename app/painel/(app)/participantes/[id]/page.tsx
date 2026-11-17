import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/painel/PageHeader";
import { EmergencyContactForm } from "@/components/painel/participantes/EmergencyContactForm";
import { Section } from "@/components/painel/participantes/Field";
import { GuardiansEditor } from "@/components/painel/participantes/GuardiansEditor";
import { HealthForm, type HealthValues } from "@/components/painel/participantes/HealthForm";
import { HistoryList } from "@/components/painel/participantes/HistoryList";
import { DeleteParticipantButton, MergeDialog } from "@/components/painel/participantes/MergeDialog";
import { NotesPanel } from "@/components/painel/participantes/NotesPanel";
import { ParticipantForm } from "@/components/painel/participantes/ParticipantForm";
import { can, requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { EMPTY_HEALTH, getParticipantHealth } from "@/lib/participants/health";
import { getParticipant } from "@/lib/participants/queries";

export const metadata = { title: "Participante" };

const pad = (n: number) => String(n).padStart(3, "0");

export default async function ParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("participantes.ver");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const p = await getParticipant(id);
  if (!p) notFound();

  const canEdit = can(user, "participantes.editar");
  const canViewHealth = can(user, "participantes.saude.ver");
  const canEditHealth = canViewHealth && can(user, "participantes.saude.editar");

  // A consulta à ficha de saúde é registrada na auditoria (dentro de getParticipantHealth).
  const healthRecord = canViewHealth ? await getParticipantHealth(id, user) : null;
  const health: HealthValues = healthRecord?.health
    ? {
        bloodType: healthRecord.health.bloodType,
        allergies: healthRecord.health.allergies,
        allergyReaction: healthRecord.health.allergyReaction,
        allergyMedication: healthRecord.health.allergyMedication,
        medications: healthRecord.health.medications,
        conditions: healthRecord.health.conditions,
        conditionDetails: healthRecord.health.conditionDetails,
        disability: healthRecord.health.disability,
        disabilityDetails: healthRecord.health.disabilityDetails,
        dietaryRestrictions: healthRecord.health.dietaryRestrictions,
        physicalRestrictions: healthRecord.health.physicalRestrictions,
        medicalNotes: healthRecord.health.medicalNotes,
        otherHealthInfo: healthRecord.health.otherHealthInfo,
        specialNeeds: healthRecord.health.specialNeeds,
        specialNeedsDetails: healthRecord.health.specialNeedsDetails,
      }
    : EMPTY_HEALTH;

  const description = [`Nº ${pad(p.number)}`, p.event.title, p.age !== null ? `${p.age} anos` : null].filter(Boolean).join(" · ");

  return (
    <>
      <PageHeader title={p.name} description={description} />
      <Link href={`/painel/participantes?evento=${p.event.id}`} className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
        ← Voltar aos participantes
      </Link>

      {p.pendingGuardian ? (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-tint p-4 text-sm">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <p>
            <strong>Menor de idade sem responsável cadastrado.</strong> Adicione ao menos um responsável antes do acampamento.
          </p>
        </div>
      ) : null}

      <div className="grid max-w-4xl gap-6">
        <Section id="dados-titulo" title="Dados pessoais">
          <ParticipantForm
            mode="edit"
            id={p.id}
            version={p.version}
            readOnly={!canEdit}
            values={{
              name: p.name,
              sex: p.sex,
              birthDate: p.birthDate,
              cpf: p.cpf,
              rg: p.rg,
              church: p.church,
              city: p.city,
              address: p.address,
              mobile: p.mobile,
              whatsapp: p.whatsapp,
              email: p.email,
              authorizationDeclared: p.authorizationDeclared,
            }}
          />
        </Section>

        <Section id="resp-titulo" title="Responsáveis" description="Obrigatório para menores de 18 anos.">
          <GuardiansEditor
            participantId={p.id}
            readOnly={!canEdit}
            initial={p.guardians.map((g) => ({ name: g.name, relationship: g.relationship, phone: g.phone, whatsapp: g.whatsapp, email: g.email, address: g.address, notes: g.notes }))}
          />
        </Section>

        <Section id="emerg-titulo" title="Contato de emergência">
          <EmergencyContactForm participantId={p.id} readOnly={!canEdit} initial={p.emergencyContact ? { nome: p.emergencyContact.nome, parentesco: p.emergencyContact.parentesco ?? null, telefone: p.emergencyContact.telefone } : null} />
        </Section>

        {canViewHealth ? (
          <Section id="saude-titulo" title="Ficha de saúde" description="Dado sensível: visível só a quem tem permissão. Esta consulta fica registrada na auditoria.">
            <HealthForm participantId={p.id} initial={health} readOnly={!canEditHealth} />
          </Section>
        ) : null}

        <Section id="obs-titulo" title="Observações">
          <NotesPanel
            participantId={p.id}
            canAdd={can(user, "participantes.observacoes")}
            notes={p.notes.map((n) => ({ id: n.id, body: n.body, author: n.authorLabel, createdAt: formatDateTime(n.createdAt) }))}
          />
        </Section>

        <Section id="hist-titulo" title="Histórico de alterações">
          <HistoryList items={p.history.map((h) => ({ id: h.id, field: h.field, oldValue: h.oldValue, newValue: h.newValue, actor: h.actorLabel, at: formatDateTime(h.createdAt) }))} />
        </Section>

        {can(user, "participantes.mesclar") || can(user, "participantes.excluir") ? (
          <div className="flex flex-wrap gap-2">
            {can(user, "participantes.mesclar") ? <MergeDialog participantId={p.id} eventId={p.event.id} name={p.name} number={p.number} /> : null}
            {can(user, "participantes.excluir") ? <DeleteParticipantButton participantId={p.id} name={p.name} eventId={p.event.id} /> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
