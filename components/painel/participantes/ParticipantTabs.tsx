import Link from "next/link";

import { cn } from "@/lib/utils";

export type ParticipantTab = "cadastro" | "responsaveis" | "saude" | "historico";

export type TabItem = { key: ParticipantTab; label: string; flag?: string };

/**
 * Abas do participante. Cada aba é um link (`?aba=`): a página só carrega o que a aba mostra, então a consulta
 * à ficha de saúde (dado sensível, auditada) acontece apenas quando a aba “Ficha de saúde” é aberta.
 */
export function ParticipantTabs({ participantId, tabs, active }: { participantId: string; tabs: TabItem[]; active: ParticipantTab }) {
  return (
    <nav aria-label="Seções do participante" className="mb-6 overflow-x-auto border-b border-border">
      <ul className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const current = tab.key === active;
          return (
            <li key={tab.key}>
              <Link
                href={`/painel/participantes/${participantId}?aba=${tab.key}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                  current ? "border-primary text-foreground" : "border-transparent text-text-2 hover:text-foreground",
                )}
              >
                {tab.label}
                {tab.flag ? <span className="rounded-md bg-warning-tint px-1.5 py-0.5 text-xs font-semibold text-warning">{tab.flag}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
