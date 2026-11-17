import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/painel/PageHeader";
import { RegistrationActions } from "@/components/painel/inscricoes/RegistrationActions";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { can, requirePermission } from "@/lib/auth/guard";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getFormModel } from "@/lib/forms/registry";
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
  const { registration: r, eventTitle, formModel, formConfig, history } = data;
  const model = getFormModel(formModel);
  const columns = model ? model.columns(formConfig) : [];

  return (
    <>
      <PageHeader
        title={`${r.name} · nº ${r.number}`}
        description={eventTitle}
        actions={<StatusBadge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</StatusBadge>}
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
          </section>
        ) : null}

        <RegistrationActions
          id={r.id}
          name={r.name}
          status={r.status}
          installments={r.payment?.parcelas ?? []}
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
