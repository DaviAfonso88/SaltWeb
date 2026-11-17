import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/site/ButtonLink";
import { Tag } from "@/components/site/Tag";
import { isRegistrationOpen } from "@/lib/events/status";
import type { PublicEvent } from "@/lib/events/queries";
import { describeEventDates } from "@/lib/format";

function Fact({ icon: Icon, label, children }: { icon: typeof CalendarDays; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3.5 border-b border-line py-3.5">
      <Icon className="mt-[3px] size-[18px] shrink-0 text-purple" strokeWidth={1.75} aria-hidden />
      <div>
        <dt className="text-[13px] text-text-3">{label}</dt>
        <dd className="m-0 font-semibold">{children}</dd>
      </div>
    </div>
  );
}

/** Evento em destaque da página de eventos: imagem quadrada + dados + chamada. */
export function FeaturedEventCard({ event, now }: { event: PublicEvent; now: Date }) {
  const dates = describeEventDates(event.startsAt, event.endsAt);
  const open = isRegistrationOpen(event, now);
  const location = [event.locationName, event.locationAddress].filter(Boolean).join(" — ");

  return (
    <article className="flex flex-wrap overflow-hidden rounded-xl border border-line bg-white">
      <div className="relative aspect-square w-full min-w-0 flex-[1_1_360px] bg-[#ece9e4]">
        {event.imageUrl ? (
          <Image src={event.imageUrl} alt={event.imageAlt ?? ""} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" priority />
        ) : (
          <div className="flex size-full items-center justify-center bg-purple-tint font-display text-5xl font-semibold text-purple" aria-hidden>
            {dates.month}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-[1_1_460px] flex-col justify-center gap-6 p-[clamp(28px,4vw,56px)]">
        {open || event.category ? (
          <div className="flex flex-wrap gap-2">
            {open ? (
              <Tag tone="success">
                <span className="size-1.5 rounded-full bg-[#2e8b4e]" aria-hidden /> Inscrições abertas
              </Tag>
            ) : null}
            {event.category ? <Tag>{event.category}</Tag> : null}
          </div>
        ) : null}

        <div>
          <h2 className="font-display text-[clamp(28px,3vw,40px)] font-semibold leading-[1.1] tracking-[-0.025em]">{event.title}</h2>
          {event.summary ? <p className="mt-3 max-w-[520px] text-text-2">{event.summary}</p> : null}
        </div>

        <dl className="m-0 flex flex-col border-t border-line">
          <Fact icon={CalendarDays} label="Quando">
            {dates.long}
          </Fact>
          {location ? (
            <Fact icon={MapPin} label="Onde">
              {location}
            </Fact>
          ) : null}
        </dl>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/eventos/${event.slug}`} icon="next">
            {open ? "Fazer inscrição" : "Ver detalhes"}
          </ButtonLink>
          {event.locationMapUrl ? (
            <ButtonLink href={event.locationMapUrl} variant="secondary" icon="external">
              Como chegar
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Linha da lista “Próximos eventos”. */
export function EventListItem({ event, now }: { event: PublicEvent; now: Date }) {
  const dates = describeEventDates(event.startsAt, event.endsAt);
  const open = isRegistrationOpen(event, now);

  return (
    <li className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-line py-7">
      <div className="flex size-[76px] shrink-0 flex-col items-center justify-center rounded-[10px] border border-line bg-sand">
        <span className="text-xs font-semibold tracking-[0.08em] text-purple">{dates.month}</span>
        <span className="font-display text-xl font-semibold leading-[1.2]">{dates.days}</span>
      </div>
      <div className="min-w-0 flex-[1_1_360px]">
        <h3 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.01em]">{event.title}</h3>
        {event.summary ? <p className="mt-1 text-text-2">{event.summary}</p> : null}
        {event.locationName ? (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-text-3">
            <MapPin className="size-3.5" strokeWidth={1.75} aria-hidden /> {event.locationName}
          </p>
        ) : null}
      </div>
      <Link
        href={`/eventos/${event.slug}`}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-line-strong bg-white px-[18px] text-sm font-semibold hover:bg-sand"
      >
        {open ? "Inscrever-se" : "Ver detalhes"} <ArrowRight className="size-4" aria-hidden />
        <span className="sr-only">: {event.title}</span>
      </Link>
    </li>
  );
}
