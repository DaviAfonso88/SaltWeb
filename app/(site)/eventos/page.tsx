import type { Metadata } from "next";
import { connection } from "next/server";

import { EventListItem, FeaturedEventCard } from "@/components/site/EventCard";
import { PageHeader, SectionHeading } from "@/components/site/SectionHeading";
import { getUpcomingEvents } from "@/lib/events/queries";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Participe dos encontros da Juventude SALT e cresça em comunhão e fé.",
};

const FIXED_MEETINGS = [
  { name: "Células de Jovens", when: "Toda sexta-feira · 19h30" },
  { name: "Células de Adolescentes", when: "Toda sexta-feira · 19h30" },
  { name: "Culto SALT", when: "Toda 1ª sexta do mês · 19h45" },
  { name: "Discipulado", when: "A combinar · horário flexível" },
];

export default async function EventosPage() {
  await connection();
  const now = new Date();
  const events = await getUpcomingEvents();
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
          <ul className="m-0 flex-[2_1_520px] list-none rounded-xl border border-line bg-white p-0">
            {FIXED_MEETINGS.map((m) => (
              <li key={m.name} className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-[#eeebe6] px-6 py-5 last:border-b-0">
                <span className="text-[17px] font-semibold">{m.name}</span>
                <span className="text-text-2">{m.when}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
