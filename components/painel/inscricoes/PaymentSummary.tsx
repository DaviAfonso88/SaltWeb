import { formatCurrency } from "@/lib/format";
import type { EventPaymentSummary } from "@/lib/registrations/payment";
import { cn } from "@/lib/utils";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function Figure({ label, cents, dot }: { label: string; cents: number; dot?: string }) {
  return (
    <div className="grid gap-1">
      <dt className="flex items-center gap-2 text-sm text-text-2">
        {dot ? <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", dot)} /> : null}
        {label}
      </dt>
      <dd className="m-0 font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] tabular-nums sm:text-[28px]">
        {formatCurrency(cents)}
      </dd>
    </div>
  );
}

/** Arrecadado × falta receber do evento inteiro, a partir das baixas dadas em cada inscrição. */
export function PaymentSummary({ summary }: { summary: EventPaymentSummary }) {
  const { expectedCents, receivedCents, pendingCents, registrations, settled, byKind } = summary;
  // Arredonda para baixo: só mostra 100% quando tudo foi recebido.
  const percent = expectedCents ? Math.floor((receivedCents / expectedCents) * 100) : 0;
  const open = registrations - settled;

  return (
    <section aria-labelledby="pagamentos-titulo" className="mb-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="grid gap-1">
        <h2 id="pagamentos-titulo" className="font-display text-lg font-semibold">
          Pagamentos do evento
        </h2>
        <p className="text-sm text-text-3">Soma das baixas dadas em cada inscrição. Inscrições canceladas não entram.</p>
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <Figure label="Arrecadado" cents={receivedCents} dot="bg-success" />
        <Figure label="Falta receber" cents={pendingCents} dot="bg-muted ring-1 ring-inset ring-border" />
        <Figure label="Total previsto" cents={expectedCents} />
      </dl>

      <div className="mt-5 grid gap-2">
        <div aria-hidden className="h-2.5 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border">
          <div className="h-full rounded-full bg-success" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm text-text-2">
          <strong className="font-semibold text-foreground">{percent}% recebido</strong>
          {" · "}
          {settled} de {plural(registrations, "inscrição quitada", "inscrições quitadas")}
          {open ? ` · ${plural(open, "com pagamento em aberto", "com pagamento em aberto")}` : ""}
        </p>
      </div>

      {byKind.length > 1 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Pagamentos por forma de pagamento</caption>
            <thead>
              <tr className="border-b border-border text-left text-text-3">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Forma
                </th>
                <th scope="col" className="hidden py-2 pr-3 text-right font-medium sm:table-cell">
                  Inscrições
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Arrecadado
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Falta receber
                </th>
              </tr>
            </thead>
            <tbody>
              {byKind.map((k) => (
                <tr key={k.kind} className="border-b border-border last:border-0">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    {k.label}
                  </th>
                  <td className="hidden py-2.5 pr-3 text-right tabular-nums text-text-2 sm:table-cell">{k.registrations}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatCurrency(k.receivedCents)}</td>
                  <td className="py-2.5 text-right tabular-nums text-text-2">{formatCurrency(k.expectedCents - k.receivedCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {summary.cancelledPaidCents ? (
        <p role="note" className="mt-5 rounded-xl bg-warning-tint px-4 py-3 text-sm">
          {formatCurrency(summary.cancelledPaidCents)} foram pagos em{" "}
          {plural(summary.cancelledPaidRegistrations, "inscrição que depois foi cancelada", "inscrições que depois foram canceladas")}. Esse
          valor não entra no arrecadado acima; confira se houve reembolso.
        </p>
      ) : null}
    </section>
  );
}
