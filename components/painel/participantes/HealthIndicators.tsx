import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HEALTH_CONDITIONS } from "@/lib/participants/import/aliases";
import type { HealthListItem, HealthStats } from "@/lib/participants/health";

const GROUPS: { key: keyof HealthStats; label: string }[] = [
  { key: "allergies", label: "Alergias" },
  { key: "medications", label: "Medicamentos" },
  { key: "dietary", label: "Restrições alimentares" },
  { key: "conditions", label: "Condições de saúde" },
  { key: "specialNeeds", label: "Necessidades especiais" },
];

function NameList({ items }: { items: HealthListItem[] }) {
  return (
    <ul className="grid gap-1.5 pt-2 text-sm">
      {items.map((p) => (
        <li key={p.id} className="flex flex-wrap gap-x-2">
          <Link href={`/painel/participantes/${p.id}`} className="font-semibold underline-offset-2 hover:underline">
            {p.name}
          </Link>
          {p.details.length ? <span className="text-text-2">{p.details.join("; ")}</span> : null}
        </li>
      ))}
    </ul>
  );
}

/** Bloco de saúde da lista de participantes. Só é renderizado com `participantes.saude.ver`; abrir registra auditoria. */
export function HealthIndicators({
  stats,
  byCondition,
  condition,
  eventId,
  openHref,
  closeHref,
}: {
  stats: HealthStats | null;
  byCondition: HealthListItem[] | null;
  condition?: string;
  eventId: string;
  openHref: string;
  closeHref: string;
}) {
  if (!stats) {
    return (
      <section aria-labelledby="saude-titulo" className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 text-text-3" aria-hidden />
          <div>
            <h2 id="saude-titulo" className="font-semibold">
              Indicadores de saúde
            </h2>
            <p className="text-sm text-text-2">Dados sensíveis. Abrir a lista com nomes fica registrado na auditoria.</p>
          </div>
        </div>
        <Button asChild variant="outline" className="min-h-11 rounded-full">
          <Link href={openHref}>Ver indicadores</Link>
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="saude-titulo" className="mb-8 rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 text-warning" aria-hidden />
          <div>
            <h2 id="saude-titulo" className="font-semibold">
              Indicadores de saúde
            </h2>
            <p className="text-sm text-text-2">Confidencial. Não compartilhe fora da equipe de saúde.</p>
          </div>
        </div>
        <Button asChild variant="outline" className="min-h-11 rounded-full">
          <Link href={closeHref}>Ocultar</Link>
        </Button>
      </div>

      <div className="grid gap-2">
        {GROUPS.map(({ key, label }) => (
          <details key={key} className="rounded-xl border border-border px-4 py-1">
            <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 font-medium">
              {label}
              <span className="tabular-nums text-text-2">{stats[key].length}</span>
            </summary>
            {stats[key].length ? <NameList items={stats[key]} /> : <p className="pb-2 text-sm text-text-3">Ninguém registrado.</p>}
          </details>
        ))}
      </div>

      <form method="get" action="/painel/participantes" className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="evento" value={eventId} />
        <input type="hidden" name="saude" value="1" />
        <div className="grid gap-1.5">
          <label htmlFor="condicao" className="text-sm font-semibold">
            Buscar por condição
          </label>
          <input
            id="condicao"
            name="condicao"
            list="condicoes-comuns"
            defaultValue={condition}
            placeholder="Ex.: Asma"
            className="min-h-11 w-60 max-w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
          <datalist id="condicoes-comuns">
            {HEALTH_CONDITIONS.map((c) => (
              <option key={c.value} value={c.label} />
            ))}
          </datalist>
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
          Buscar
        </button>
      </form>

      {byCondition ? (
        <div className="mt-3" role="status">
          <p className="text-sm text-text-2">
            {byCondition.length} {byCondition.length === 1 ? "participante" : "participantes"} com “{condition}”.
          </p>
          {byCondition.length ? <NameList items={byCondition} /> : null}
        </div>
      ) : null}
    </section>
  );
}
