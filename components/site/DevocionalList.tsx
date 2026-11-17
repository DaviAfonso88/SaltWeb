"use client";

import { ArrowUpRight, BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeKey } from "@/lib/text";
import { cn } from "@/lib/utils";

export type DevocionalItem = {
  id: string;
  title: string;
  url: string;
  /** Primeiro dia do mês de referência, YYYY-MM-DD. */
  month: string;
};

const monthName = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", month: "long" });
const monthShort = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", month: "short" });
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const asDate = (month: string) => new Date(`${month}T00:00:00Z`);

export function DevocionalList({ items }: { items: DevocionalItem[] }) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState<string | null>(null);

  const months = useMemo(() => [...new Set(items.map((i) => i.month))].sort().reverse(), [items]);
  const multiYear = new Set(months.map((m) => m.slice(0, 4))).size > 1;
  const labelOf = (m: string, long = false) => {
    const d = asDate(m);
    const name = capitalize((long ? monthName : monthShort).format(d).replace(".", ""));
    return multiYear ? `${name}/${m.slice(0, 4)}` : name;
  };

  const latest = items[0];
  const filtered = useMemo(() => {
    const q = normalizeKey(query);
    return items.filter((i) => (!month || i.month === month) && (!q || normalizeKey(i.title).includes(q)));
  }, [items, query, month]);

  const filtering = Boolean(query || month);
  const count = filtered.length === 1 ? "1 devocional" : `${filtered.length} devocionais`;

  if (!items.length) {
    return (
      <div className="container-site pb-[clamp(64px,8vw,112px)]">
        <div className="rounded-xl border border-dashed border-line-strong bg-sand px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold">Nenhum devocional publicado ainda</p>
          <p className="mt-2 text-text-2">Volte em breve: novos devocionais são publicados todo mês.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {latest ? (
        <section aria-label="Devocional mais recente">
          <div className="container-site">
            <a
              href={latest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 rounded-xl bg-purple-tint p-[clamp(24px,3.5vw,40px)] text-foreground no-underline"
            >
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2.5">
                <p className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-purple-dark">
                  <BookOpen className="size-4" strokeWidth={1.75} aria-hidden /> Mais recente · {labelOf(latest.month, true)}
                </p>
                <p className="font-display text-[clamp(24px,2.6vw,32px)] font-semibold leading-tight tracking-[-0.02em]">{latest.title}</p>
              </div>
              <span className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg bg-primary px-[22px] text-[15px] font-semibold text-primary-foreground">
                Ler devocional <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only"> (abre em nova aba)</span>
              </span>
            </a>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="todos-titulo" className="pb-[clamp(64px,8vw,112px)] pt-[clamp(48px,6vw,64px)]">
        <div className="container-site">
          <h2 id="todos-titulo" className="mb-5 font-display text-[clamp(22px,2.2vw,26px)] font-semibold leading-tight tracking-[-0.015em]">
            Todos os devocionais
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-line pb-5">
            <div className="relative max-w-[400px] flex-[1_1_300px]">
              <Label htmlFor="busca" className="sr-only">
                Pesquisar por título
              </Label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-3" strokeWidth={1.75} aria-hidden />
              <Input
                id="busca"
                type="search"
                placeholder="Pesquisar por título"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-12 rounded-lg bg-white pl-[42px] text-[15px] placeholder:text-[#77737e]"
              />
            </div>

            <div role="group" aria-label="Filtrar por mês" className="flex flex-wrap gap-1.5">
              {[null, ...months].map((m) => (
                <button
                  key={m ?? "todos"}
                  type="button"
                  aria-pressed={month === m}
                  onClick={() => setMonth(m)}
                  className={cn(
                    "inline-flex min-h-11 min-w-[52px] items-center justify-center rounded-lg border px-3.5 text-sm transition-colors",
                    month === m
                      ? "border-primary bg-primary font-semibold text-primary-foreground"
                      : "border-line-strong bg-white font-medium text-foreground hover:bg-sand",
                  )}
                >
                  {m ? labelOf(m) : "Todos"}
                </button>
              ))}
            </div>
          </div>

          <p role="status" aria-live="polite" className="my-4 text-sm text-text-3">
            {count}
          </p>

          {filtered.length ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4">
              {filtered.map((d) => (
                <li key={d.id} className="flex">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[164px] flex-1 flex-col gap-2.5 rounded-xl border border-line bg-white px-6 py-[22px] text-foreground no-underline transition-colors hover:border-line-strong hover:bg-sand"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-3">{labelOf(d.month, true)}</span>
                    <span className="font-display text-[19px] font-semibold leading-[1.3] tracking-[-0.01em]">{d.title}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-purple">
                      Ler devocional <ArrowUpRight className="size-3.5" aria-hidden />
                      <span className="sr-only"> (abre em nova aba): {d.title}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-line-strong px-6 py-14 text-center text-text-2">
              <Search className="size-7" strokeWidth={1.75} aria-hidden />
              <p className="font-semibold text-foreground">Nenhum devocional encontrado</p>
              <p className="text-[15px]">Tente outro termo ou limpe os filtros.</p>
              {filtering ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMonth(null);
                  }}
                  className="mt-1.5 inline-flex min-h-11 items-center rounded-lg border border-line-strong bg-white px-[18px] text-sm font-semibold text-foreground hover:bg-sand"
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
