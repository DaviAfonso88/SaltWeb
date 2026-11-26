import { MapPin } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/painel/StatusBadge";
import type { EventOverviewData } from "@/lib/dashboard/queries";
import { countdown } from "@/lib/dashboard/time";
import { describeEventDates, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type EventLinks = { label: string; href: string }[];

function Meter({ value, max }: { value: number; max: number }) {
  return (
    <div aria-hidden className="h-2 overflow-hidden rounded-full bg-purple-tint">
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

function Metric({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="grid content-start gap-1.5">
      <dt className="text-xs text-text-3">{label}</dt>
      <dd className="m-0 break-words font-display text-xl font-semibold leading-tight tracking-tight">{value}</dd>
      {children ? <dd className="m-0 grid gap-1.5 text-xs text-text-2">{children}</dd> : null}
    </div>
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function EventOverview({ event, links }: { event: EventOverviewData; links: EventLinks }) {
  const { attendance, stock, money } = event;
  const date = describeEventDates(event.startsAt, event.endsAt);
  const missing = stock?.missing.slice(0, 3) ?? [];
  const others = (stock?.missing.length ?? 0) - missing.length;

  return (
    <li className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div aria-hidden className="grid w-16 shrink-0 justify-items-center rounded-xl bg-purple-tint px-1 py-2 text-purple-dark">
          <span className={cn("font-display font-semibold leading-tight", date.days.length > 2 ? "text-base" : "text-2xl")}>{date.days}</span>
          <span className="text-[11px] font-semibold tracking-wide">{date.month}</span>
        </div>
        <div className="grid min-w-0 flex-1 gap-1">
          <h3 className="break-words font-display text-lg font-semibold leading-snug">{event.title}</h3>
          <p className="text-sm text-text-2">
            <span className="sr-only">{date.long}, </span>
            <strong className="font-semibold text-foreground">{countdown(event.startsAt)}</strong>
            {date.startTime ? ` · ${date.startTime}` : ""}
          </p>
          {event.locationName ? (
            <p className="flex items-start gap-1.5 text-sm text-text-3">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="min-w-0 break-words">{event.locationName}</span>
            </p>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-2">
            {event.publication === "draft" ? <StatusBadge tone="neutral">Rascunho</StatusBadge> : null}
            {event.formModel ? (
              <StatusBadge tone={event.open ? "success" : "warning"}>{event.open ? "Inscrições abertas" : "Inscrições fechadas"}</StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Sem inscrição</StatusBadge>
            )}
          </div>
        </div>
      </div>

      {(attendance && event.formModel) || stock || money ? (
        <dl className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {attendance && event.formModel ? (
            <Metric label="Participantes" value={plural(attendance.people, "pessoa", "pessoas")}>
              {attendance.capacity ? (
                <>
                  <Meter value={attendance.people} max={attendance.capacity} />
                  <span>
                    {attendance.people >= attendance.capacity
                      ? `Lotado (${attendance.capacity} vagas)`
                      : `${plural(attendance.capacity - attendance.people, "vaga livre", "vagas livres")} de ${attendance.capacity}`}
                  </span>
                </>
              ) : null}
              <span>
                {plural(attendance.registrations, "inscrição", "inscrições")}
                {attendance.pending ? ` · ${plural(attendance.pending, "pendente", "pendentes")}` : ""}
              </span>
            </Metric>
          ) : null}

          {stock ? (
            <Metric label="Itens para levar" value={`${stock.used} de ${stock.total}`}>
              <Meter value={stock.used} max={stock.total || 1} />
              <span>
                {missing.length
                  ? `Falta: ${missing.map((i) => `${i.nome} (${i.restante})`).join(", ")}${others > 0 ? ` e mais ${others}` : ""}`
                  : "Todos os itens foram escolhidos."}
              </span>
            </Metric>
          ) : null}

          {money ? (
            money.receivedCents !== null ? (
              <Metric label="Arrecadado" value={formatCurrency(money.receivedCents)}>
                <span>{formatCurrency(money.pendingCents ?? 0)} a receber</span>
                {money.spentCents !== null ? (
                  <span>
                    Gasto {formatCurrency(money.spentCents)} · saldo{" "}
                    <strong className={cn("font-semibold", money.receivedCents < money.spentCents ? "text-destructive" : "text-foreground")}>
                      {formatCurrency(money.receivedCents - money.spentCents)}
                    </strong>
                  </span>
                ) : null}
              </Metric>
            ) : (
              <Metric label="Gasto" value={formatCurrency(money.spentCents ?? 0)} />
            )
          ) : null}
        </dl>
      ) : null}

      {links.length ? (
        <ul className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold hover:bg-muted">
                {link.label}
                <span className="sr-only">: {event.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
