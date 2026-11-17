import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Tag } from "@/components/site/Tag";
import { getFeaturedEvent } from "@/lib/events/queries";
import { isRegistrationOpen } from "@/lib/events/status";
import { describeEventDates } from "@/lib/format";

/** Evento em destaque (vem do painel). Sem destaque, a seção não aparece. */
export async function FeaturedEventSection() {
  const event = await getFeaturedEvent();
  if (!event) return null;
  const dates = describeEventDates(event.startsAt, event.endsAt);
  const open = isRegistrationOpen(event);

  return (
    <section aria-labelledby="destaque-titulo" className="pb-[clamp(64px,8vw,112px)]">
      <div className="container-site">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
          <SectionHeading id="destaque-titulo" eyebrow="Em destaque" title="Próximo evento" />
          <ButtonLink href="/eventos" variant="text" icon="next">
            Ver agenda completa
          </ButtonLink>
        </div>
        <article className="flex flex-wrap overflow-hidden rounded-xl border border-line bg-white">
          {event.imageUrl ? (
            <div className="relative aspect-square w-full min-w-0 flex-[1_1_380px] bg-[#ece9e4]">
              <Image src={event.imageUrl} alt={event.imageAlt ?? ""} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-[1_1_440px] flex-col justify-center gap-6 p-[clamp(28px,4vw,56px)]">
            {open ? (
              <Tag tone="success" className="self-start">
                <span className="size-1.5 rounded-full bg-[#2e8b4e]" aria-hidden /> Inscrições abertas
              </Tag>
            ) : null}
            <div>
              <h3 className="font-display text-[clamp(28px,3vw,40px)] font-semibold leading-[1.1] tracking-[-0.025em]">{event.title}</h3>
              {event.summary ? <p className="mt-3 max-w-[460px] text-text-2">{event.summary}</p> : null}
            </div>
            <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] border-y border-line">
              <div className="py-4 pr-4">
                <dt className="text-[13px] text-text-3">Quando</dt>
                <dd className="mt-0.5 font-semibold">{dates.long}</dd>
              </div>
              {event.locationName ? (
                <div className="py-4 pr-4">
                  <dt className="text-[13px] text-text-3">Onde</dt>
                  <dd className="mt-0.5 font-semibold">{event.locationName}</dd>
                </div>
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/eventos/${event.slug}`} icon="next">
                {open ? "Fazer inscrição" : "Ver detalhes"}
              </ButtonLink>
              <ButtonLink href="/eventos" variant="secondary">
                Ver todos os eventos
              </ButtonLink>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
