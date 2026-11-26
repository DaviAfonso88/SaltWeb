import Link from "next/link";

import { StatusBadge, REGISTRATION_STATUS } from "@/components/painel/StatusBadge";
import type { StockLine } from "@/lib/forms/festa-estoque";
import { cn } from "@/lib/utils";

import { ReminderButton } from "./ReminderButton";

export type StockPerson = {
  id: string;
  name: string;
  /** null quando quem está vendo não pode ver telefones. */
  phone: string | null;
  status: "pending" | "confirmed" | "cancelled";
  /** Unidades que esta pessoa escolheu do item. */
  quantity: number;
  /** Texto extra abaixo do nome (ex.: situação do pagamento). */
  detail?: string | null;
  /** Ficha da inscrição; null para quem não pode ver inscrições. */
  href: string | null;
  /** Omitido esconde o botão; null indica telefone sem DDD. */
  reminderUrl?: string | null;
};

export function PeopleList({ people }: { people: StockPerson[] }) {
  return (
    <ul className="grid divide-y divide-border">
      {people.map((p) => {
        const name = p.quantity > 1 ? `${p.name} (${p.quantity}×)` : p.name;
        return (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 last:pb-0">
            <div className="min-w-0">
              {p.href ? (
                <Link href={p.href} className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-2 hover:underline">
                  {name}
                </Link>
              ) : (
                <p className="text-sm font-semibold">{name}</p>
              )}
              {p.phone || p.detail ? <p className="text-xs text-text-3">{[p.phone, p.detail].filter(Boolean).join(" · ")}</p> : null}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge tone={REGISTRATION_STATUS[p.status].tone}>{REGISTRATION_STATUS[p.status].label}</StatusBadge>
              {p.reminderUrl !== undefined ? <ReminderButton href={p.reminderUrl} name={p.name} /> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Um item (ou as vagas em valor): quanto resta e quem escolheu. */
export function StockCard({ title, line, people }: { title: string; line: StockLine<unknown>; people: StockPerson[] }) {
  const { quantidade, usado, restante, excedente } = line;
  const percent = quantidade ? Math.min(100, Math.round((usado / quantidade) * 100)) : usado ? 100 : 0;

  return (
    <li className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-display text-base font-semibold">{title}</h3>
          <p className="text-sm text-text-2">
            {usado} de {quantidade} {usado === 1 ? "escolhido" : "escolhidos"}
          </p>
        </div>
        {excedente ? (
          <StatusBadge tone="danger">{excedente} a mais</StatusBadge>
        ) : restante ? (
          <StatusBadge tone="success">{restante === 1 ? "Resta 1" : `Restam ${restante}`}</StatusBadge>
        ) : (
          <StatusBadge tone="warning">Esgotado</StatusBadge>
        )}
      </div>

      <div aria-hidden className="mt-3 h-2 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border">
        <div className={cn("h-full rounded-full", excedente ? "bg-destructive" : "bg-primary")} style={{ width: `${percent}%` }} />
      </div>

      <div className="mt-2">
        {people.length ? <PeopleList people={people} /> : <p className="pt-2 text-sm text-text-3">Ninguém escolheu ainda.</p>}
      </div>
    </li>
  );
}
