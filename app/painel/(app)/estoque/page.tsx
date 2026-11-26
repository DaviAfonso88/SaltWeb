import Link from "next/link";
import { z } from "zod";

import { DataTable, type Column } from "@/components/painel/DataTable";
import { EmptyState } from "@/components/painel/EmptyState";
import { ReminderButton } from "@/components/painel/estoque/ReminderButton";
import { PeopleList, StockCard, type StockPerson } from "@/components/painel/estoque/StockCard";
import { PageHeader } from "@/components/painel/PageHeader";
import { REGISTRATION_STATUS, StatusBadge } from "@/components/painel/StatusBadge";
import { Button } from "@/components/ui/button";
import { can, requireAnyPermission } from "@/lib/auth/guard";
import { describeEventDates } from "@/lib/format";
import { FESTA_CATEGORIES, festaConfigSchema, formatItem, peopleCount } from "@/lib/forms/festa";
import { festaStock, type StockChoice } from "@/lib/forms/festa-estoque";
import { festaContribuicao, festaReminderUrl, hasContribution } from "@/lib/forms/festa-lembrete";
import { paymentProgress, paymentStatusLabel } from "@/lib/registrations/payment";
import { listFestaEvents, listStockRegistrations } from "@/lib/registrations/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Estoque" };

type SearchParams = { evento?: string; ver?: string };

function Figure({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="grid content-start gap-1 rounded-2xl border border-border bg-card p-4">
      <dt className="text-sm text-text-2">{label}</dt>
      <dd className="m-0 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] tabular-nums">{value}</dd>
      <dd className="m-0 text-xs text-text-3">{hint}</dd>
    </div>
  );
}

export default async function StockPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireAnyPermission(["estoque.ver", "inscricoes.ver"]);
  // Quem entra só pelo estoque não vê pagamentos nem a ficha da inscrição; telefone é permissão à parte.
  const fullAccess = can(user, "inscricoes.ver");
  const canContact = fullAccess || can(user, "estoque.contatos");
  const sp = await searchParams;

  const events = await listFestaEvents();
  if (!events.length) {
    return (
      <>
        <PageHeader title="Estoque" />
        <EmptyState
          title="Nenhum evento de confraternização"
          description="Crie um evento com o formulário Confraternização e cadastre os itens para acompanhar o estoque."
          action={
            can(user, "eventos.gerenciar") ? (
              <Button asChild className="min-h-11 rounded-full">
                <Link href="/painel/eventos/novo">Novo evento</Link>
              </Button>
            ) : undefined
          }
        />
      </>
    );
  }

  const requested = z.string().uuid().safeParse(sp.evento).success ? events.find((e) => e.id === sp.evento) : undefined;
  const event = requested ?? events.find((e) => e.publication === "published" && e.registrationOpen) ?? events[0];
  const view = sp.ver === "pessoas" ? "pessoas" : "itens";

  const config = festaConfigSchema.safeParse(event.formConfig);
  const rows = await listStockRegistrations(event.id);
  const active = rows.filter((r) => r.status !== "cancelled");
  const when = describeEventDates(event.startsAt, event.endsAt).long;

  const withPerson = (r: (typeof rows)[number]) => {
    const contribution = festaContribuicao(r.answers, r.payment?.valorFinalCentavos ?? 0);
    const progress = paymentProgress(r.payment);
    return {
      ...r,
      contribution,
      reminderUrl: canContact
        ? festaReminderUrl({
            de: "equipe",
            telefone: r.phone,
            nome: r.name,
            numero: r.number,
            evento: event.title,
            quando: when,
            local: event.locationName,
            contribuicao: contribution,
            pago: fullAccess ? progress.installments > 0 && progress.paidInstallments === progress.installments : undefined,
          })
        : undefined,
    };
  };
  // Sem acesso às inscrições, a lista traz só quem pegou algo (não expõe quem não pode contribuir).
  const people = active.map(withPerson).filter((p) => fullAccess || hasContribution(p.contribution));
  type Person = (typeof people)[number];

  const stock = config.success ? festaStock(config.data, people) : null;
  const paymentDetail = (p: Person) => (fullAccess ? paymentStatusLabel(p.payment) : null);
  const asStockPerson = ({ pessoa: p, quantidade }: StockChoice<Person>, detail?: string | null): StockPerson => ({
    id: p.id,
    quantity: quantidade,
    name: p.name,
    phone: canContact ? p.phone : null,
    status: p.status,
    detail,
    href: fullAccess ? `/painel/inscricoes/${p.id}` : null,
    reminderUrl: p.reminderUrl,
  });

  const total = stock?.itens.reduce((sum, i) => sum + i.quantidade, 0) ?? 0;
  const left = stock?.itens.reduce((sum, i) => sum + i.restante, 0) ?? 0;
  const taken = stock?.itens.reduce((sum, i) => sum + i.usado, 0) ?? 0;
  const attending = active.reduce((sum, r) => sum + peopleCount(r.answers), 0);
  const capacity = config.success ? config.data.limiteParticipantes : 0;
  // Pagamento desligado só aparece se alguém já tinha escolhido.
  const showValue = !!stock && ((config.success && config.data.aceitaValor && stock.valor.quantidade > 0) || stock.valor.escolhas.length > 0);

  const columns: Column<Person>[] = [
    { key: "n", header: "Nº", cell: (p) => <span className="font-semibold tabular-nums">{p.number}</span> },
    {
      key: "name",
      header: "Nome",
      cell: (p) =>
        fullAccess ? (
          <Link href={`/painel/inscricoes/${p.id}`} className="font-semibold text-foreground underline-offset-2 hover:underline">
            {p.name}
          </Link>
        ) : (
          <span className="font-semibold text-foreground">{p.name}</span>
        ),
    },
    ...(canContact ? [{ key: "phone", header: "Telefone", cell: (p: Person) => p.phone }] : []),
    {
      key: "contribution",
      header: "Vai levar",
      className: "whitespace-normal",
      cell: (p) =>
        hasContribution(p.contribution) ? (
          [
            p.contribution.itens.map(formatItem).join(", "),
            p.contribution.valorCentavos !== null ? (paymentDetail(p) ?? "Contribuição em valor") : null,
          ]
            .filter(Boolean)
            .join(" + ")
        ) : (
          <span className="text-text-3">Sem contribuição</span>
        ),
    },
    {
      key: "status",
      header: "Situação",
      cell: (p) => <StatusBadge tone={REGISTRATION_STATUS[p.status].tone}>{REGISTRATION_STATUS[p.status].label}</StatusBadge>,
    },
    ...(canContact
      ? [{ key: "reminder", header: "WhatsApp", cell: (p: Person) => <ReminderButton href={p.reminderUrl ?? null} name={p.name} /> }]
      : []),
  ];

  const chip = (selected: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium",
      selected ? "border-primary bg-purple-tint text-purple-dark" : "border-border bg-card text-text-2 hover:bg-muted",
    );
  const viewHref = (ver: "itens" | "pessoas") => `/painel/estoque?evento=${event.id}&ver=${ver}`;

  return (
    <>
      <PageHeader
        title="Estoque"
        description="O que cada pessoa vai levar e quanto ainda resta. Inscrições canceladas devolvem o item ao estoque."
        actions={
          fullAccess ? (
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <Link href={`/painel/inscricoes?evento=${event.id}`}>Ver inscrições</Link>
            </Button>
          ) : undefined
        }
      />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <input type="hidden" name="ver" value={view} />
        <div className="grid gap-1.5">
          <label htmlFor="evento" className="text-sm font-semibold">
            Evento
          </label>
          <select id="evento" name="evento" defaultValue={event.id} className="min-h-11 max-w-full rounded-xl border border-input bg-card px-3 text-sm">
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
          Aplicar
        </button>
      </form>

      {!stock ? (
        <EmptyState title="Formulário sem itens válidos" description="Abra o evento, confira os parâmetros do formulário Confraternização e salve novamente." />
      ) : (
        <>
          <dl className={cn("mb-6 grid grid-cols-2 gap-3", showValue ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
            <Figure label="Itens que restam" value={left} hint={`de ${total} cadastrados`} />
            <Figure label="Itens escolhidos" value={taken} hint="unidades de itens" />
            {showValue ? <Figure label="Vagas em valor" value={stock.valor.restante} hint={`restam de ${stock.valor.quantidade}`} /> : null}
            <Figure
              label="Participantes"
              value={attending}
              hint={capacity ? `de ${capacity} vagas · ${active.length} inscrições` : `${active.length} inscrições, sem canceladas`}
            />
          </dl>

          <nav aria-label="Modo de visualização" className="mb-6 flex flex-wrap gap-2">
            <Link href={viewHref("itens")} aria-current={view === "itens" ? "page" : undefined} className={chip(view === "itens")}>
              Por item
            </Link>
            <Link href={viewHref("pessoas")} aria-current={view === "pessoas" ? "page" : undefined} className={chip(view === "pessoas")}>
              Por pessoa
            </Link>
          </nav>

          {view === "pessoas" ? (
            people.length ? (
              <DataTable columns={columns} rows={people} rowKey={(p) => p.id} caption={`O que cada pessoa vai levar em ${event.title}`} />
            ) : (
              <EmptyState title="Nenhuma inscrição ainda" description="Quando alguém se inscrever, aparece aqui." />
            )
          ) : (
            <div className="grid gap-8">
              {stock.foraDaLista.length ? (
                <section aria-labelledby="fora-titulo" className="rounded-2xl bg-warning-tint p-4 sm:p-5">
                  <h2 id="fora-titulo" className="font-display text-lg font-semibold">
                    Escolhas fora da lista atual
                  </h2>
                  <p className="text-sm text-text-2">
                    Estes itens foram renomeados ou removidos do formulário depois de escolhidos. Avise as pessoas ou volte o nome anterior no evento.
                  </p>
                  <ul className="mt-4 grid gap-3">
                    {stock.foraDaLista.map((item) => (
                      <li key={item.nome} className="rounded-2xl border border-border bg-card p-4">
                        <h3 className="font-display text-base font-semibold">{item.nome}</h3>
                        <PeopleList people={item.escolhas.map((c) => asStockPerson(c))} />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {FESTA_CATEGORIES.map((category) => {
                const items = stock.itens.filter((i) => i.categoria === category.id);
                if (!items.length) return null;
                return (
                  <section key={category.id} aria-labelledby={`${category.id}-titulo`}>
                    <h2 id={`${category.id}-titulo`} className="mb-3 font-display text-lg font-semibold">
                      {category.plural}
                    </h2>
                    <ul className="grid items-start gap-3 xl:grid-cols-2">
                      {items.map((item) => (
                        <StockCard key={item.nome} title={item.nome} line={item} people={item.escolhas.map((c) => asStockPerson(c))} />
                      ))}
                    </ul>
                  </section>
                );
              })}

              {!stock.itens.length ? (
                <EmptyState title="Nenhum item cadastrado" description="Adicione os itens no formulário do evento." />
              ) : null}

              {showValue ? (
                <section aria-labelledby="valor-titulo">
                  <h2 id="valor-titulo" className="mb-3 font-display text-lg font-semibold">
                    Contribuição em dinheiro
                  </h2>
                  <ul className="grid items-start gap-3 xl:grid-cols-2">
                    <StockCard
                      title="Vagas em valor"
                      line={stock.valor}
                      people={stock.valor.escolhas.map((c) => asStockPerson(c, paymentDetail(c.pessoa)))}
                    />
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
