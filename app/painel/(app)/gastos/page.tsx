import { z } from "zod";

import { EmptyState } from "@/components/painel/EmptyState";
import { EventPicker } from "@/components/painel/EventPicker";
import { DeleteExpense } from "@/components/painel/gastos/DeleteExpense";
import { ExpenseForm } from "@/components/painel/gastos/ExpenseForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { can, requirePermission } from "@/lib/auth/guard";
import { listExpenses } from "@/lib/expenses/queries";
import { formatCurrency } from "@/lib/format";
import { getEventPaymentSummary, listEventsWithRegistrations } from "@/lib/registrations/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Gastos" };

function Figure({ label, value, hint, negative }: { label: string; value: string; hint: string; negative?: boolean }) {
  return (
    <div className="grid content-start gap-1 rounded-2xl border border-border bg-card p-4">
      <dt className="text-sm text-text-2">{label}</dt>
      <dd className={cn("m-0 break-words font-display text-2xl font-semibold leading-tight tracking-[-0.02em] tabular-nums", negative && "text-destructive")}>
        {value}
      </dd>
      <dd className="m-0 text-xs text-text-3">{hint}</dd>
    </div>
  );
}

/** `spentOn` é só a data (AAAA-MM-DD): formatar sem passar por fuso. */
const shortDate = (date: string) => date.split("-").reverse().join("/");

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ evento?: string }> }) {
  const user = await requirePermission("gastos.ver");
  const sp = await searchParams;

  const events = await listEventsWithRegistrations();
  if (!events.length) {
    return (
      <>
        <PageHeader title="Gastos" />
        <EmptyState title="Nenhum evento ainda" description="Crie um evento para controlar os gastos." />
      </>
    );
  }

  const requested = z.string().uuid().safeParse(sp.evento).success ? events.find((e) => e.id === sp.evento) : undefined;
  const event = requested ?? events.find((e) => e.formModel) ?? events[0];
  const [{ rows, totalCents }, payments] = await Promise.all([listExpenses(event.id), getEventPaymentSummary(event.id)]);

  // Dinheiro de inscrições canceladas fica fora: pode ter sido devolvido.
  const balance = payments.receivedCents - totalCents;
  const canManage = can(user, "gastos.gerenciar");

  return (
    <>
      <PageHeader title="Gastos" description="Quanto o evento arrecadou nas inscrições e quanto já foi gasto." />
      <EventPicker events={events} selected={event.id} />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure label="Arrecadado" value={formatCurrency(payments.receivedCents)} hint="pagamentos com baixa" />
        <Figure label="A receber" value={formatCurrency(payments.pendingCents)} hint="ainda em aberto" />
        <Figure label="Gasto" value={formatCurrency(totalCents)} hint={`${rows.length} lançamento(s)`} />
        <Figure label="Saldo" value={formatCurrency(balance)} hint="arrecadado menos gasto" negative={balance < 0} />
      </dl>

      <div className="grid max-w-3xl gap-6">
        {canManage ? <ExpenseForm key={event.id} eventId={event.id} /> : null}

        {rows.length ? (
          <section aria-labelledby="lancamentos-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 id="lancamentos-titulo" className="font-display text-lg font-semibold">
              Lançamentos
            </h2>
            <ul className="grid divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 last:pb-0">
                  <div className="min-w-0">
                    <p className="break-words font-semibold">{r.description}</p>
                    <p className="text-xs text-text-3">
                      {[
                        r.spentOn ? shortDate(r.spentOn) : null,
                        r.paidBy ? `pago por ${r.paidBy}` : null,
                        r.createdByLabel ? `lançado por ${r.createdByLabel}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-semibold tabular-nums">{formatCurrency(r.amountCents)}</span>
                    {canManage ? <DeleteExpense id={r.id} description={r.description} /> : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <EmptyState title="Nenhum gasto lançado" description="Anote aqui as compras do evento para acompanhar o saldo." />
        )}
      </div>
    </>
  );
}
