import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Número principal de uma área; leva para onde se resolve. */
export function StatTile({
  label,
  value,
  hint,
  href,
  icon: Icon,
  attention = false,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  icon: LucideIcon;
  /** Há algo esperando ação: o ícone ganha destaque. */
  attention?: boolean;
}) {
  return (
    <Link href={href} className="group grid content-start gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5">
      <span className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-text-2">{label}</span>
        <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", attention ? "bg-purple-tint text-purple-dark" : "bg-muted text-text-3")}>
          <Icon className="size-[18px]" aria-hidden />
        </span>
      </span>
      <span className="font-display text-4xl font-semibold leading-none tracking-tight">{value}</span>
      <span className="flex items-end justify-between gap-2 text-xs text-text-3">
        {hint}
        <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

/** Cartão com título e atalho para a área completa. */
export function Panel({
  id,
  title,
  link,
  children,
  className,
}: {
  id: string;
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5", className)}>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-3">
        <h2 id={id} className="font-display text-lg font-semibold">
          {title}
        </h2>
        {link ? (
          <Link href={link.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
            {link.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export type ActivityItem = { key: string; title: string; detail: string; meta?: string; href?: string };

export function ActivityList({ items, empty }: { items: ActivityItem[]; empty: string }) {
  if (!items.length) return <p className="py-2 text-sm text-text-3">{empty}</p>;
  return (
    <ul className="grid divide-y divide-border">
      {items.map((item) => {
        const content = (
          <>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{item.title}</span>
              <span className="block truncate text-xs text-text-3">{item.detail}</span>
            </span>
            {item.meta ? <span className="shrink-0 text-xs font-medium text-text-2">{item.meta}</span> : null}
          </>
        );
        const row = "flex min-h-14 items-center justify-between gap-3 py-2";
        return (
          <li key={item.key}>
            {item.href ? (
              <Link href={item.href} className={cn(row, "-mx-2 rounded-xl px-2 hover:bg-muted")}>
                {content}
              </Link>
            ) : (
              <div className={row}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
