import type { Week } from "@/lib/dashboard/time";
import { cn } from "@/lib/utils";

import { Panel } from "./blocks";

/**
 * Colunas por semana, uma série só (o título diz o que é). Rótulo direto no maior valor e na semana
 * atual; os demais aparecem ao passar o mouse, focar ou abrir a tabela.
 */
export function WeeklyBars({ id, title, weeks, unit }: { id: string; title: string; weeks: Week[]; unit: [one: string, many: string] }) {
  const max = Math.max(...weeks.map((w) => w.total));
  const total = weeks.reduce((n, w) => n + w.total, 0);
  const describe = (n: number) => `${n} ${n === 1 ? unit[0] : unit[1]}`;
  const peak = weeks.findIndex((w) => w.total === max);

  return (
    <Panel id={id} title={title}>
      <p className="text-sm text-text-2">
        {describe(total)} nas últimas {weeks.length} semanas
      </p>
      {total ? (
        <>
          <ol className="mt-4 flex h-44 items-stretch border-b border-line-strong">
            {weeks.map((w, i) => (
              <li
                key={w.start}
                tabIndex={0}
                aria-label={`Semana de ${w.label}${w.current ? " (atual)" : ""}: ${describe(w.total)}`}
                className="group relative flex min-w-0 flex-1 flex-col items-center justify-end rounded-t-lg px-px outline-none hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-0 z-10 hidden whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background group-hover:block group-focus-visible:block",
                    // Nas pontas o balão abre para dentro, para não sair do cartão.
                    i < 2 ? "left-0" : i > weeks.length - 3 ? "right-0" : "left-1/2 -translate-x-1/2",
                  )}
                >
                  <strong>{describe(w.total)}</strong> · semana de {w.label}
                </span>
                {i === peak || w.current ? (
                  <span aria-hidden className="mb-1 text-xs font-semibold tabular-nums">
                    {w.total}
                  </span>
                ) : null}
                <span
                  aria-hidden
                  className="w-full max-w-6 rounded-t-[4px] bg-primary"
                  // A altura máxima deixa espaço para o rótulo e para o balão.
                  style={{ height: w.total ? `${Math.max(3, (w.total / max) * 72)}%` : 0 }}
                />
              </li>
            ))}
          </ol>
          <div aria-hidden className="flex pt-1.5">
            {weeks.map((w) => (
              <span key={w.start} className={cn("min-w-0 flex-1 text-center text-[11px] tabular-nums", w.current ? "font-semibold text-foreground" : "text-text-3")}>
                {w.label}
              </span>
            ))}
          </div>
          <details className="mt-2">
            <summary className="flex min-h-11 w-fit cursor-pointer items-center text-sm font-semibold text-purple">Ver em tabela</summary>
            <table className="w-full text-sm">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="border-b border-border text-left text-text-3">
                  <th scope="col" className="py-1.5 font-medium">
                    Semana de
                  </th>
                  <th scope="col" className="py-1.5 text-right font-medium">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeks.map((w) => (
                  <tr key={w.start} className="border-b border-border last:border-0">
                    <td className="py-1.5">
                      {w.label}
                      {w.current ? " (atual)" : ""}
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{w.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      ) : (
        <p className="py-6 text-sm text-text-3">Nada registrado nesse período.</p>
      )}
    </Panel>
  );
}
