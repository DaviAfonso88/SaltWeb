import type { Metadata } from "next";
import { connection } from "next/server";

import { EventListItem, FeaturedEventCard } from "@/components/site/EventCard";
import { PageHeader, SectionHeading } from "@/components/site/SectionHeading";
import { Tag } from "@/components/site/Tag";
import { getUpcomingEvents } from "@/lib/events/queries";
import { SEXTAS } from "@/lib/programacoes/catalog";
import { getProgramacoes } from "@/lib/programacoes/queries";
import { isEncontro, ritmoDasSextas } from "@/lib/programacoes/ritmo";
import { describeSchedule } from "@/lib/programacoes/schedule";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Participe dos encontros da Juventude SALT e cresça em comunhão e fé.",
};

type Meeting = { key: string; name: string; when: string; next?: string };

const GROUP_TITLE = "mb-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-text-3";

function MeetingList({ items }: { items: Meeting[] }) {
  return (
    <ul className="m-0 list-none rounded-xl border border-line bg-white p-0">
      {items.map((m) => (
        <li key={m.key} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-[#eeebe6] px-6 py-5 last:border-b-0">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[17px] font-semibold">{m.name}</span>
            {m.next ? <Tag tone="brand">{m.next}</Tag> : null}
          </span>
          <span className="text-text-2">{m.when}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function EventosPage() {
  await connection();
  const now = new Date();
  const [events, programacoes] = await Promise.all([getUpcomingEvents(), getProgramacoes()]);
  const sextas = ritmoDasSextas(programacoes, now);
  const fridays: Meeting[] = sextas.items.map((i) => ({
    key: i.slug,
    name: i.titulo,
    when: i.long,
    next: sextas.next?.slug === i.slug ? sextas.next.quando : undefined,
  }));
  const weekly: Meeting[] = programacoes.filter(isEncontro).map((p) => ({ key: p.slug, name: p.titulo, when: describeSchedule(p.schedule).long }));
  const featured = events.find((e) => e.featured) ?? events[0];
  const others = events.filter((e) => e.id !== featured?.id);

  return (
    <>
      <PageHeader eyebrow="Agenda" title="Eventos" description="Participe de nossos encontros e cresça em comunhão e fé." />

      {featured ? (
        <section aria-label="Evento em destaque">
          <div className="container-site">
            <FeaturedEventCard event={featured} now={now} />
          </div>
        </section>
      ) : (
        <section aria-label="Sem eventos">
          <div className="container-site">
            <div className="rounded-xl border border-dashed border-line-strong bg-sand px-6 py-16 text-center">
              <p className="font-display text-2xl font-semibold">Nenhum evento programado no momento</p>
              <p className="mt-2 text-text-2">Fique de olho: em breve divulgamos as próximas datas.</p>
            </div>
          </div>
        </section>
      )}

      {others.length ? (
        <section aria-labelledby="outros-title" className="pb-[clamp(64px,8vw,112px)] pt-[clamp(56px,7vw,96px)]">
          <div className="container-site">
            <h2 id="outros-title" className="mb-6 font-display text-[clamp(24px,2.4vw,30px)] font-semibold leading-tight tracking-[-0.015em]">
              Próximos eventos
            </h2>
            <ul className="m-0 list-none border-t border-line p-0">
              {others.map((event) => (
                <EventListItem key={event.id} event={event} now={now} />
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <div className="h-[clamp(56px,7vw,96px)]" aria-hidden />
      )}

      <section aria-labelledby="fixos-title" className="bg-sand py-[clamp(64px,8vw,112px)]">
        <div className="container-site flex flex-wrap gap-x-[clamp(40px,6vw,96px)] gap-y-8">
          <div className="flex flex-[1_1_300px] flex-col gap-3">
            <SectionHeading id="fixos-title" eyebrow="Toda semana" title="Encontros fixos" />
            <p className="max-w-[360px] text-text-2">Não precisa esperar um evento especial. Estes encontros acontecem o ano todo.</p>
          </div>
          <div className="grid flex-[2_1_520px] gap-8">
            {fridays.length ? (
              <div>
                <h3 className={GROUP_TITLE}>{SEXTAS.titulo}</h3>
                <MeetingList items={fridays} />
              </div>
            ) : null}
            {weekly.length ? (
              <div>
                <h3 className={GROUP_TITLE}>Células</h3>
                <MeetingList items={weekly} />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
