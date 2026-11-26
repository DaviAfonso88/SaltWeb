import { CalendarDays, ClipboardList, ExternalLink, Mail, Plus, TriangleAlert, UserPlus } from "lucide-react";
import Link from "next/link";

import { ActivityList, Panel, StatTile } from "@/components/painel/dashboard/blocks";
import { EventOverview, type EventLinks } from "@/components/painel/dashboard/EventOverview";
import { WeeklyBars } from "@/components/painel/dashboard/WeeklyBars";
import { PageHeader } from "@/components/painel/PageHeader";
import { Button } from "@/components/ui/button";
import { can, canAny, requireUser } from "@/lib/auth/guard";
import {
  getDevotionalStatus,
  getMessageActivity,
  getRegistrationActivity,
  getVisitorActivity,
  listUpcomingEventsOverview,
  type EventOverviewData,
} from "@/lib/dashboard/queries";
import { timeAgo } from "@/lib/dashboard/time";
import { formatDate, formatMonth } from "@/lib/format";
import { listRetentionWarnings } from "@/lib/participants/health";
import { getProgramacoesAdmin } from "@/lib/programacoes/queries";
import { ritmoDasSextas } from "@/lib/programacoes/ritmo";
import { ageGroupLabel } from "@/lib/visitors/options";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const todayFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long" });

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function DashboardPage() {
  const user = await requireUser();

  // Cada bloco só é consultado se o papel puder ver a área correspondente.
  const seeRegistrations = can(user, "inscricoes.ver");
  const manageRegistrations = can(user, "inscricoes.gerenciar");
  const seeStock = canAny(user, ["estoque.ver", "inscricoes.ver"]);
  const seeExpenses = can(user, "gastos.ver");
  const manageEvents = can(user, "eventos.gerenciar");
  const seeEvents = manageEvents || seeStock || seeExpenses;
  const seeMessages = can(user, "mensagens.ver");
  const seeVisitors = can(user, "visitantes.ver");
  const manageDevotionals = can(user, "devocionais.gerenciar");

  const [events, registrations, visitors, messages, devotional, programacoes, retention] = await Promise.all([
    seeEvents
      ? listUpcomingEventsOverview({
          drafts: manageEvents || seeRegistrations,
          registrations: seeRegistrations,
          stock: seeStock,
          money: seeRegistrations || seeExpenses,
          expenses: seeExpenses,
        })
      : null,
    seeRegistrations ? getRegistrationActivity() : null,
    seeVisitors ? getVisitorActivity() : null,
    seeMessages ? getMessageActivity() : null,
    manageDevotionals ? getDevotionalStatus() : null,
    getProgramacoesAdmin(),
    // Fichas de saúde de acampamentos encerrados há mais de 60 dias: lembrete de exclusão manual.
    can(user, "participantes.excluir") ? listRetentionWarnings() : [],
  ]);

  const sextas = ritmoDasSextas(programacoes)
    .items.filter((s) => s.date)
    .sort((a, b) => a.date!.localeCompare(b.date!))
    .slice(0, 4);

  function linksFor(event: EventOverviewData): EventLinks {
    const festa = event.formModel === "festa";
    const query = `?evento=${event.id}`;
    return [
      seeRegistrations && event.formModel ? { label: "Inscrições", href: `/painel/inscricoes${query}` } : null,
      manageRegistrations && festa ? { label: "Nova inscrição", href: `/painel/inscricoes/novo${query}` } : null,
      seeStock && festa ? { label: "Estoque", href: `/painel/estoque${query}` } : null,
      seeExpenses ? { label: "Gastos", href: `/painel/gastos${query}` } : null,
      manageEvents ? { label: "Editar evento", href: `/painel/eventos/${event.id}` } : null,
    ].filter((link) => link !== null);
  }

  const hasTiles = !!(registrations || messages || visitors || events);
  const hasMain = !!(events || registrations || visitors);
  const today = todayFmt.format(new Date());

  const side = (
    <>
      {visitors ? (
        <Panel id="visitantes-titulo" title="Aguardando contato" link={{ href: "/painel/visitantes?situacao=new", label: "Ver todos" }}>
          <ActivityList
            empty="Nenhum visitante esperando contato."
            items={visitors.oldest.map((v) => ({
              key: v.id,
              title: v.name,
              detail: ageGroupLabel(v.ageGroup),
              meta: timeAgo(v.createdAt),
              href: `/painel/visitantes/${v.id}`,
            }))}
          />
        </Panel>
      ) : null}

      {messages ? (
        <Panel id="mensagens-titulo" title="Mensagens novas" link={{ href: "/painel/mensagens", label: "Ver todas" }}>
          <ActivityList
            empty="Nenhuma mensagem nova."
            items={messages.latest.map((m) => ({
              key: m.id,
              title: m.name,
              detail: m.kind === "servir" ? "Quero servir" : "Contato",
              meta: timeAgo(m.createdAt),
              href: `/painel/mensagens/${m.id}`,
            }))}
          />
        </Panel>
      ) : null}

      {registrations ? (
        <Panel id="inscricoes-titulo" title="Últimas inscrições" link={{ href: "/painel/inscricoes", label: "Ver todas" }}>
          <ActivityList
            empty="Nenhuma inscrição ainda."
            items={registrations.recent.map((r) => ({
              key: r.id,
              title: r.name,
              detail: r.eventTitle,
              meta: timeAgo(r.createdAt),
              href: `/painel/inscricoes/${r.id}`,
            }))}
          />
        </Panel>
      ) : null}

      <Panel id="sextas-titulo" title="Próximas sextas" link={manageEvents ? { href: "/painel/configuracoes", label: "Ajustar" } : undefined}>
        <ActivityList
          empty="Nenhuma data definida."
          items={sextas.map((s) => ({
            key: s.slug,
            title: s.titulo,
            detail: [s.tag, s.time].filter(Boolean).join(" · "),
            meta: formatDate(`${s.date}T12:00:00-03:00`).slice(0, 5),
          }))}
        />
      </Panel>

      {devotional ? (
        <Panel id="devocional-titulo" title="Devocional" link={{ href: "/painel/devocionais", label: "Gerenciar" }}>
          <p className={cn("rounded-xl p-3 text-sm", devotional.hasCurrentMonth ? "bg-success-tint text-success" : "bg-warning-tint text-warning")}>
            {devotional.hasCurrentMonth
              ? `O devocional de ${formatMonth(devotional.month)} está publicado.`
              : `Falta publicar o devocional de ${formatMonth(devotional.month)}.`}
          </p>
          {devotional.latest ? (
            <p className="mt-2 text-sm text-text-2">
              Mais recente: <strong className="font-semibold text-foreground">{devotional.latest.title}</strong> ({formatMonth(devotional.latest.referenceMonth)})
            </p>
          ) : null}
        </Panel>
      ) : null}
    </>
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Olá, ${user.name.split(" ")[0]}! Hoje é ${today}. Você está como ${user.roleName}.`}
        actions={
          <>
            {manageEvents ? (
              <Button asChild className="min-h-11 rounded-full">
                <Link href="/painel/eventos/novo">
                  <Plus aria-hidden /> Novo evento
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" className="min-h-11 rounded-full">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden /> Ver o site<span className="sr-only"> (abre em nova aba)</span>
              </a>
            </Button>
          </>
        }
      />

      {retention.length ? (
        <section aria-labelledby="retencao-titulo" className="mb-6 rounded-2xl border border-warning/40 bg-warning-tint p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div className="grid gap-2">
              <h2 id="retencao-titulo" className="font-semibold">
                Dados de saúde para excluir
              </h2>
              <p className="text-sm">
                Estes acampamentos terminaram há mais de 60 dias e ainda guardam fichas de saúde. Exporte o que precisar e exclua os participantes para não manter dados sensíveis sem necessidade.
              </p>
              <ul className="grid gap-1 text-sm">
                {retention.map((r) => (
                  <li key={r.eventId}>
                    <Link href={`/painel/participantes?evento=${r.eventId}`} className="font-semibold underline underline-offset-2">
                      {r.title}
                    </Link>{" "}
                    <span className="text-text-2">
                      · terminou em {formatDate(r.endedAt)} · {r.healthRecords} {r.healthRecords === 1 ? "ficha" : "fichas"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {hasTiles ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {registrations ? (
            <StatTile
              label="Inscrições pendentes"
              value={registrations.pending}
              hint={`${plural(registrations.lastSevenDays, "nova", "novas")} em 7 dias`}
              href={registrations.busiestEventId ? `/painel/inscricoes?evento=${registrations.busiestEventId}&situacao=pending` : "/painel/inscricoes"}
              icon={ClipboardList}
              attention={registrations.pending > 0}
            />
          ) : null}
          {messages ? (
            <StatTile
              label="Mensagens novas"
              value={messages.unread}
              hint={messages.latest[0] ? `última ${timeAgo(messages.latest[0].createdAt)}` : "tudo lido"}
              href="/painel/mensagens"
              icon={Mail}
              attention={messages.unread > 0}
            />
          ) : null}
          {visitors ? (
            <StatTile
              label="Visitantes sem contato"
              value={visitors.waiting}
              hint={visitors.late ? `${visitors.late} há mais de 7 dias` : visitors.waiting ? "todos desta semana" : "todos contatados"}
              href="/painel/visitantes?situacao=new"
              icon={UserPlus}
              attention={visitors.waiting > 0}
            />
          ) : null}
          {events ? (
            <StatTile
              label="Próximos eventos"
              value={events.published}
              hint={`${events.open} com inscrições abertas`}
              href={manageEvents ? "/painel/eventos" : "#eventos-titulo"}
              icon={CalendarDays}
            />
          ) : null}
        </div>
      ) : null}

      {hasMain ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-6">
            {events ? (
              <section aria-labelledby="eventos-titulo" className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-x-3">
                  <h2 id="eventos-titulo" className="scroll-mt-6 font-display text-lg font-semibold">
                    Próximos eventos
                  </h2>
                  {events.total > events.events.length ? (
                    <p className="text-sm text-text-3">
                      Mostrando {events.events.length} de {events.total}
                    </p>
                  ) : null}
                </div>
                {events.events.length ? (
                  <ul className="grid gap-3">
                    {events.events.map((event) => (
                      <EventOverview key={event.id} event={event} links={linksFor(event)} />
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-text-2">
                    Nenhum evento marcado daqui para a frente.
                  </p>
                )}
              </section>
            ) : null}

            {registrations || visitors ? (
              <div className={cn("grid items-start gap-6", registrations && visitors && "lg:grid-cols-2")}>
                {registrations ? (
                  <WeeklyBars id="grafico-inscricoes" title="Inscrições por semana" weeks={registrations.weeks} unit={["inscrição", "inscrições"]} />
                ) : null}
                {visitors ? <WeeklyBars id="grafico-visitantes" title="Visitantes por semana" weeks={visitors.weeks} unit={["visitante", "visitantes"]} /> : null}
              </div>
            ) : null}
          </div>

          <div className="grid min-w-0 items-start gap-6 md:grid-cols-2 xl:grid-cols-1">{side}</div>
        </div>
      ) : (
        <div className="grid items-start gap-6 md:grid-cols-2">{side}</div>
      )}
    </>
  );
}
