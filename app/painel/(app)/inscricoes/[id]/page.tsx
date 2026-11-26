import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ReminderButton } from "@/components/painel/estoque/ReminderButton";
import { PageHeader } from "@/components/painel/PageHeader";
import { RegistrationActions } from "@/components/painel/inscricoes/RegistrationActions";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { Button } from "@/components/ui/button";
import { can, requirePermission } from "@/lib/auth/guard";
import { describeEventDates, formatCurrency, formatDateTime } from "@/lib/format";
import { festaContribuicao, festaReminderUrl } from "@/lib/forms/festa-lembrete";
import { getFormModel } from "@/lib/forms/registry";
import { paymentInstallments, paymentProgress } from "@/lib/registrations/payment";
import { getRegistration } from "@/lib/registrations/queries";

export const metadata = { title: "Inscrição" };

const STATUS = {
  pending: { label: "Pendente", tone: "warning" },
  confirmed: { label: "Confirmada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "neutral" },
} as const;

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-text-3">{label}</dt>
      <dd className="m-0 font-medium">{children || "—"}</dd>
    </div>
  );
}

export default async function RegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("inscricoes.ver");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const data = await getRegistration(id);
  if (!data) notFound();
  const { registration: r, eventTitle, eventStartsAt, eventEndsAt, eventLocation, formModel, formConfig, history } = data;
  const model = getFormModel(formModel);
  const columns = model ? model.columns(formConfig) : [];
  const progress = paymentProgress(r.payment);
  // Festa: lembrete do que a pessoa ficou de levar (inscrição cancelada não recebe).
  const reminderUrl =
    formModel === "festa" && r.status !== "cancelled"
      ? festaReminderUrl({
          de: "equipe",
          telefone: r.phone,
          nome: r.name,
          numero: r.number,
          evento: eventTitle,
          quando: describeEventDates(eventStartsAt, eventEndsAt).long,
          local: eventLocation,
          contribuicao: festaContribuicao(r.answers, r.payment?.valorFinalCentavos ?? 0),
          pago: progress.installments > 0 && progress.paidInstallments === progress.installments,
        })
      : null;

  return (
    <>
      <PageHeader
        title={`${r.name} · nº ${r.number}`}
        description={eventTitle}
        actions={
          <>
            <StatusBadge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</StatusBadge>
            {formModel === "festa" && can(user, "inscricoes.gerenciar") ? (
              <Button asChild variant="outline" className="min-h-11 rounded-full">
                <Link href={`/painel/inscricoes/${r.id}/editar`}>
                  <Pencil aria-hidden /> Editar
                </Link>
              </Button>
            ) : null}
          </>
        }
      />
      <Link href={`/painel/inscricoes?evento=${r.eventId}`} className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
        ← Voltar às inscrições
      </Link>

      <div className="grid max-w-3xl gap-6">
        <section aria-labelledby="dados-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="dados-titulo" className="mb-4 font-display text-lg font-semibold">
            Dados
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Nome">{r.name}</Item>
            <Item label="Telefone">{r.phone}</Item>
            <Item label="E-mail">{r.email}</Item>
            <Item label="Inscrito em">{formatDateTime(r.createdAt)}</Item>
            <Item label="Valor">{r.amountCents ? formatCurrency(r.amountCents) : null}</Item>
            <Item label="Lote">{r.payment?.lote}</Item>
          </dl>
        </section>

        {columns.length ? (
          <section aria-labelledby="respostas-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 id="respostas-titulo" className="mb-4 font-display text-lg font-semibold">
              Respostas
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {columns.map((c) => (
                <Item key={c.key} label={c.header}>
                  {c.value(r.answers, r.payment)}
                </Item>
              ))}
            </dl>
            {reminderUrl ? (
              <div className="mt-5">
                <ReminderButton href={reminderUrl} name={r.name} label="Enviar lembrete" />
              </div>
            ) : null}
          </section>
        ) : null}

        <RegistrationActions
          id={r.id}
          name={r.name}
          status={r.status}
          installments={paymentInstallments(r.payment)}
          plan={r.payment?.plano}
          canManage={can(user, "inscricoes.gerenciar")}
        />

        <section aria-labelledby="historico-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="historico-titulo" className="mb-4 font-display text-lg font-semibold">
            Histórico
          </h2>
          {history.length ? (
            <ol className="grid gap-3">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p>
                    <strong>{h.field}</strong>: {h.oldValue ?? "—"} → {h.newValue ?? "—"}
                  </p>
                  <p className="text-xs text-text-3">
                    {formatDateTime(h.createdAt)} · {h.actorLabel ?? "sistema"}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-text-2">Nenhuma alteração registrada.</p>
          )}
        </section>
      </div>
    </>
  );
}
