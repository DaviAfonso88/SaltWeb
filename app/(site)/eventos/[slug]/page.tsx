import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { EventRegistration } from "@/components/forms/EventRegistration";
import { ButtonLink } from "@/components/site/ButtonLink";
import { Tag } from "@/components/site/Tag";
import { getPublicEventBySlug } from "@/lib/events/queries";
import { isRegistrationOpen, paragraphs } from "@/lib/events/status";
import { describeEventDates } from "@/lib/format";
import { getFestaAvailability } from "@/lib/forms/availability";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) return { title: "Evento não encontrado" };
  return {
    title: event.title,
    description: event.summary ?? undefined,
    openGraph: event.imageUrl ? { images: [{ url: event.imageUrl, alt: event.imageAlt ?? event.title }] } : undefined,
  };
}

export default async function EventPage({ params }: Params) {
  await connection();
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const dates = describeEventDates(event.startsAt, event.endsAt);
  const open = isRegistrationOpen(event);
  const availability = event.formModel === "festa" ? await getFestaAvailability(event.id, event.formConfig) : undefined;
  const location = [event.locationName, event.locationAddress].filter(Boolean).join(" — ");

  return (
    <article>
      <header className="pb-[clamp(40px,5vw,56px)] pt-[clamp(28px,4vw,48px)]">
        <div className="container-site">
          <Link href="/eventos" className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-text-2 hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> Todos os eventos
          </Link>
          <div className="flex flex-wrap items-center gap-x-[clamp(40px,6vw,80px)] gap-y-10">
            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-5">
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
              <h1 className="font-display text-[clamp(36px,4.4vw,56px)] font-semibold leading-[1.08] tracking-[-0.025em]">{event.title}</h1>
              {event.summary ? <p className="max-w-[520px] text-lg text-text-2">{event.summary}</p> : null}

              <dl className="m-0 flex flex-col border-t border-line">
                <div className="flex gap-3.5 border-b border-line py-3.5">
                  <CalendarDays className="mt-[3px] size-[18px] shrink-0 text-purple" strokeWidth={1.75} aria-hidden />
                  <div>
                    <dt className="text-[13px] text-text-3">Quando</dt>
                    <dd className="m-0 font-semibold">{dates.long}</dd>
                  </div>
                </div>
                {location ? (
                  <div className="flex gap-3.5 border-b border-line py-3.5">
                    <MapPin className="mt-[3px] size-[18px] shrink-0 text-purple" strokeWidth={1.75} aria-hidden />
                    <div>
                      <dt className="text-[13px] text-text-3">Onde</dt>
                      <dd className="m-0 font-semibold">{location}</dd>
                    </div>
                  </div>
                ) : null}
              </dl>

              <div className="flex flex-wrap gap-3">
                {event.formModel && open ? (
                  <ButtonLink href="#inscricao" icon="next">
                    Fazer inscrição
                  </ButtonLink>
                ) : null}
                {event.externalUrl ? (
                  <ButtonLink href={event.externalUrl} variant={event.formModel && open ? "secondary" : "primary"} icon="external">
                    {event.externalLabel || "Saiba mais"}
                  </ButtonLink>
                ) : null}
                {event.locationMapUrl ? (
                  <ButtonLink href={event.locationMapUrl} variant="secondary" icon="external">
                    Como chegar
                  </ButtonLink>
                ) : null}
              </div>
            </div>

            {event.imageUrl ? (
              <div className="relative aspect-square w-full max-w-[440px] min-w-0 flex-[0_1_440px] overflow-hidden rounded-xl bg-[#ece9e4]">
                <Image
                  src={event.imageUrl}
                  alt={event.imageAlt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 440px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {event.description ? (
        <section aria-labelledby="sobre-evento" className="pb-[clamp(56px,7vw,96px)]">
          <div className="container-site">
            <div className="max-w-3xl">
              <h2 id="sobre-evento" className="mb-4 font-display text-[clamp(24px,2.4vw,30px)] font-semibold leading-tight tracking-[-0.015em]">
                Sobre o evento
              </h2>
              <div className="grid gap-4 text-[17px] text-text-2">
                {paragraphs(event.description).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {event.formModel ? (
        <section id="inscricao" aria-label="Inscrição" className="scroll-mt-20 bg-sand py-[clamp(56px,7vw,96px)]">
          <div className="container-site">
            <EventRegistration event={event} open={open} availability={availability} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
