import { Download, FileUp, Plus } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { PageHeader } from "@/components/painel/PageHeader";
import { Pagination, parsePage } from "@/components/painel/Pagination";
import { DeleteAllParticipants, GenerateFromRegistrations } from "@/components/painel/participantes/CampActions";
import { HealthIndicators } from "@/components/painel/participantes/HealthIndicators";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { Button } from "@/components/ui/button";
import { can, requirePermission } from "@/lib/auth/guard";
import { formatDate } from "@/lib/format";
import { filterByCondition, getHealthStats } from "@/lib/participants/health";
import { getCampStats, getFilterOptions, listCampEvents, listParticipants } from "@/lib/participants/queries";

export const metadata = { title: "Participantes" };

type SearchParams = { evento?: string; q?: string; igreja?: string; cidade?: string; sexo?: string; pendente?: string; saude?: string; condicao?: string; page?: string };

const pad = (n: number) => String(n).padStart(3, "0");

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <dt className="text-[13px] text-text-3">{label}</dt>
      <dd className={`m-0 mt-1 font-display text-3xl font-semibold tabular-nums ${tone === "warning" && value > 0 ? "text-warning" : ""}`}>{value}</dd>
    </div>
  );
}

function Bars({ title, items, unit }: { title: string; items: { name: string; total: number }[]; unit?: string }) {
  const max = Math.max(1, ...items.map((i) => i.total));
  return (
    <section aria-label={title} className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {items.length ? (
        <ul className="grid gap-2">
          {items.map((i) => (
            <li key={i.name} className="grid gap-1">
              <div className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {i.name}
                  {unit ? ` ${unit}` : ""}
                </span>
                <span className="tabular-nums text-text-2">{i.total}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted" aria-hidden>
                <div className="h-full rounded-full bg-primary" style={{ width: `${(i.total / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-3">Sem dados ainda.</p>
      )}
    </section>
  );
}

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requirePermission("participantes.ver");
  const sp = await searchParams;

  const camps = await listCampEvents();
  if (!camps.length) {
    return (
      <>
        <PageHeader title="Participantes" />
        <EmptyState
          title="Nenhum acampamento cadastrado"
          description="Os participantes ficam dentro de um evento com o modelo de formulário Acampamento. Crie ou ajuste um evento para começar."
          action={
            <Button asChild className="min-h-11 rounded-full">
              <Link href="/painel/eventos">Ir para eventos</Link>
            </Button>
          }
        />
      </>
    );
  }

  const camp = (z.string().uuid().safeParse(sp.evento).success ? camps.find((c) => c.id === sp.evento) : undefined) ?? camps[0];
  const q = sp.q?.trim().slice(0, 100) || undefined;
  const sex = sp.sexo === "M" || sp.sexo === "F" ? sp.sexo : undefined;
  const church = sp.igreja?.slice(0, 160) || undefined;
  const city = sp.cidade?.slice(0, 120) || undefined;
  const pending = sp.pendente === "1";
  const page = parsePage(sp.page);

  const canHealth = can(user, "participantes.saude.ver");
  const showHealth = canHealth && sp.saude === "1";
  const condition = showHealth ? sp.condicao?.trim().slice(0, 80) || undefined : undefined;

  const [stats, options, { rows, total }, healthStats, byCondition] = await Promise.all([
    getCampStats(camp.id),
    getFilterOptions(camp.id),
    listParticipants({ eventId: camp.id, q, church, city, sex, pendingGuardian: pending, page }),
    showHealth ? getHealthStats(camp.id, user) : Promise.resolve(null),
    showHealth && condition ? filterByCondition(camp.id, condition, user) : Promise.resolve(null),
  ]);

  const canEdit = can(user, "participantes.editar");
  const canImport = can(user, "participantes.importar");
  const canExport = can(user, "participantes.exportar");
  const canDelete = can(user, "participantes.excluir");

  const exportHref = (formato: "csv" | "pdf", withHealth = false) => {
    const p = new URLSearchParams({ evento: camp.id, formato });
    if (q) p.set("q", q);
    if (church) p.set("igreja", church);
    if (city) p.set("cidade", city);
    if (sex) p.set("sexo", sex);
    if (withHealth) p.set("saude", "1");
    return `/api/painel/participantes/export?${p.toString()}`;
  };

  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "n", header: "Nº", cell: (r) => <span className="font-semibold tabular-nums">{pad(r.number)}</span> },
    {
      key: "name",
      header: "Nome",
      cell: (r) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/painel/participantes/${r.id}`} className="font-semibold text-foreground underline-offset-2 hover:underline">
            {r.name}
          </Link>
          {r.pendingGuardian ? <StatusBadge tone="warning">Sem responsável</StatusBadge> : null}
        </div>
      ),
    },
    { key: "sex", header: "Sexo", hideOnMobile: true, cell: (r) => (r.sex === "M" ? "Masc." : r.sex === "F" ? "Fem." : "—") },
    { key: "age", header: "Idade", cell: (r) => (r.age === null ? "—" : r.age) },
    { key: "church", header: "Igreja", hideOnMobile: true, cell: (r) => r.church ?? "—" },
    { key: "city", header: "Cidade", hideOnMobile: true, cell: (r) => r.city ?? "—" },
    { key: "mobile", header: "Celular", cell: (r) => r.mobile ?? "—" },
  ];

  const filtered = Boolean(q || church || city || sex || pending);
  const actions = (
    <>
      {canEdit ? (
        <Button asChild className="min-h-11 rounded-full">
          <Link href={`/painel/participantes/novo?evento=${camp.id}`}>
            <Plus aria-hidden /> Novo
          </Link>
        </Button>
      ) : null}
      {canImport ? (
        <Button asChild variant="outline" className="min-h-11 rounded-full">
          <Link href={`/painel/participantes/importar?evento=${camp.id}`}>
            <FileUp aria-hidden /> Importar planilha
          </Link>
        </Button>
      ) : null}
      {canEdit ? <GenerateFromRegistrations eventId={camp.id} /> : null}
    </>
  );

  return (
    <>
      <PageHeader title="Participantes" description={`${camp.title} · ${formatDate(camp.startsAt)}`} actions={actions} />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="evento" className="text-sm font-semibold">
            Acampamento
          </label>
          <select id="evento" name="evento" defaultValue={camp.id} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm">
            {camps.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.total})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="q" className="text-sm font-semibold">
            Buscar por nome, CPF ou telefone
          </label>
          <input id="q" name="q" defaultValue={q} className="min-h-11 w-64 max-w-full rounded-xl border border-input bg-card px-3 text-sm" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="igreja" className="text-sm font-semibold">
            Igreja
          </label>
          <select id="igreja" name="igreja" defaultValue={church ?? ""} className="min-h-11 max-w-56 rounded-xl border border-input bg-card px-3 text-sm">
            <option value="">Todas</option>
            {options.churches.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="cidade" className="text-sm font-semibold">
            Cidade
          </label>
          <select id="cidade" name="cidade" defaultValue={city ?? ""} className="min-h-11 max-w-56 rounded-xl border border-input bg-card px-3 text-sm">
            <option value="">Todas</option>
            {options.cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="sexo" className="text-sm font-semibold">
            Sexo
          </label>
          <select id="sexo" name="sexo" defaultValue={sex ?? ""} className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm">
            <option value="">Todos</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="pendente" value="1" defaultChecked={pending} className="size-4" />
          Só sem responsável
        </label>
        {showHealth ? <input type="hidden" name="saude" value="1" /> : null}
        <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
          Aplicar
        </button>
      </form>

      <dl className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Participantes" value={stats.total} />
        <Stat label="Masculino" value={stats.male} />
        <Stat label="Feminino" value={stats.female} />
        <Stat label="Menores sem responsável" value={stats.pendingGuardian} tone="warning" />
      </dl>

      <div className="mb-8 grid gap-3 md:grid-cols-3">
        <Bars title="Faixa etária" unit="anos" items={stats.ageBands.map((b) => ({ name: b.band === "sem" ? "Sem data de nascimento" : b.band, total: b.total }))} />
        <Bars title="Igrejas" items={stats.churches} />
        <Bars title="Cidades" items={stats.cities} />
      </div>

      {canHealth ? (
        <HealthIndicators
          stats={healthStats}
          byCondition={byCondition}
          condition={condition}
          eventId={camp.id}
          openHref={`/painel/participantes?${new URLSearchParams({ evento: camp.id, saude: "1" }).toString()}`}
          closeHref={`/painel/participantes?${new URLSearchParams({ evento: camp.id }).toString()}`}
        />
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-2" role="status">
          {total} {total === 1 ? "participante" : "participantes"}
          {filtered ? " com estes filtros" : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {canExport && total > 0 ? (
            <>
              <Button asChild variant="outline" className="min-h-11 rounded-full">
                <a href={exportHref("csv")} download>
                  <Download aria-hidden /> CSV
                </a>
              </Button>
              <Button asChild variant="outline" className="min-h-11 rounded-full">
                <a href={exportHref("pdf")} download>
                  <Download aria-hidden /> PDF
                </a>
              </Button>
              {canHealth ? (
                <Button asChild variant="outline" className="min-h-11 rounded-full">
                  <a href={exportHref("csv", true)} download>
                    <Download aria-hidden /> CSV com saúde
                  </a>
                </Button>
              ) : null}
            </>
          ) : null}
          {canDelete && stats.total > 0 ? <DeleteAllParticipants eventId={camp.id} title={camp.title} total={stats.total} /> : null}
        </div>
      </div>

      {rows.length ? (
        <>
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption={`Participantes de ${camp.title}`} />
          <Pagination
            page={page}
            total={total}
            basePath="/painel/participantes"
            params={{ evento: camp.id, q, igreja: church, cidade: city, sexo: sex, pendente: pending ? "1" : undefined, saude: showHealth ? "1" : undefined }}
          />
        </>
      ) : (
        <EmptyState
          title={filtered ? "Nenhum participante com esses filtros" : "Nenhum participante ainda"}
          description={filtered ? "Tente limpar a busca ou os filtros." : "Importe uma planilha, gere a partir das inscrições confirmadas ou cadastre manualmente."}
        />
      )}
    </>
  );
}
