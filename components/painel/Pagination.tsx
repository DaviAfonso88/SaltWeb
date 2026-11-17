import Link from "next/link";

import { cn } from "@/lib/utils";

export const PAGE_SIZE = 50;

type Props = {
  page: number;
  total: number;
  pageSize?: number;
  basePath: string;
  /** Demais parâmetros de busca a preservar. */
  params?: Record<string, string | undefined>;
};

function href(basePath: string, params: Props["params"], page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v) sp.set(k, v);
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({ page, total, pageSize = PAGE_SIZE, basePath, params }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const linkClass =
    "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-inset ring-border bg-card hover:bg-muted";

  return (
    <nav aria-label="Paginação" className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-text-2">
        Página {page} de {pages} · {total} {total === 1 ? "registro" : "registros"}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className={linkClass} href={href(basePath, params, page - 1)} rel="prev">
            Anterior
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-50")} aria-disabled="true">
            Anterior
          </span>
        )}
        {page < pages ? (
          <Link className={linkClass} href={href(basePath, params, page + 1)} rel="next">
            Próxima
          </Link>
        ) : (
          <span className={cn(linkClass, "pointer-events-none opacity-50")} aria-disabled="true">
            Próxima
          </span>
        )}
      </div>
    </nav>
  );
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
