import { CalendarDays, Church, Footprints, Globe, Home, PartyPopper, Trophy, Users, type LucideIcon } from "lucide-react";
import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";
import { SEXTAS } from "@/lib/programacoes/catalog";
import { getProgramacoes } from "@/lib/programacoes/queries";
import { isEncontro, ritmoDasSextas } from "@/lib/programacoes/ritmo";
import { describeSchedule } from "@/lib/programacoes/schedule";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  "culto-salt": Church,
  "esportes-salt": Trophy,
  "missoes-salt": Globe,
  "semana-discipulado": Footprints,
  "encontrao-salt": PartyPopper,
  "celula-jovens": Home,
  "celula-adolescentes": Users,
};
const iconOf = (slug: string) => ICONS[slug] ?? CalendarDays;

export async function Hero() {
  const programacoes = await getProgramacoes();
  const sextas = ritmoDasSextas(programacoes);
  const meetings = programacoes.filter(isEncontro).map((p) => ({
    name: p.titulo,
    when: describeSchedule(p.schedule).short,
    icon: iconOf(p.slug),
  }));

  return (
    <>
      <section aria-labelledby="hero-title" className="pb-[clamp(40px,5vw,64px)] pt-[clamp(48px,6vw,88px)]">
        <div className="container-site flex flex-wrap items-center gap-x-[clamp(40px,5vw,72px)] gap-y-10">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
            <p className="eyebrow">Juventude da Primeira Igreja Batista em Lagoa Santa</p>
            <h1 id="hero-title" className="font-display text-[clamp(36px,4.4vw,56px)] font-semibold leading-[1.08] tracking-[-0.03em]">
              Amar missões,
              <br />
              fazer discípulos
              <br />e servir à Igreja.
            </h1>
            <p className="max-w-[480px] text-lg text-text-2">
              Uma juventude que vive a fé com propósito, amizade e impacto, conectando pessoas e transformando vidas.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <ButtonLink href="/eventos" icon="next">
                Próximos eventos
              </ButtonLink>
              <ButtonLink href="/sobre" variant="secondary">
                Conheça a Salt
              </ButtonLink>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full min-w-0 flex-[1_1_520px] overflow-hidden rounded-xl bg-[#ece9e4]">
            <Image
              src="/images/salt-home.jpg"
              alt="Jovens da Juventude SALT reunidos durante um encontro"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="encontros-title" className="pb-[clamp(64px,8vw,104px)]">
        <div className="container-site grid gap-4">
          <h2 id="encontros-title" className="text-[13px] font-semibold uppercase tracking-[0.1em] text-text-3">
            Encontros regulares
          </h2>

          {sextas.items.length ? (
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-6 py-4">
                <h3 className="font-display text-[19px] font-semibold tracking-[-0.01em]">{SEXTAS.titulo}</h3>
                <p className="text-sm text-text-3">{SEXTAS.descricao}</p>
              </div>
              <ol className="grid divide-y divide-line lg:grid-cols-5 lg:divide-x lg:divide-y-0">
                {sextas.items.map((item) => {
                  const Icon = iconOf(item.slug);
                  const isNext = sextas.next?.slug === item.slug;
                  return (
                    <li key={item.slug} className={cn("flex items-start gap-3.5 p-5 lg:flex-col lg:gap-3", isNext ? "bg-purple-tint" : "bg-white")}>
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg text-purple",
                          isNext ? "bg-white" : "bg-purple-tint",
                        )}
                      >
                        <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <div className="grid gap-0.5">
                        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-purple">{item.tag}</p>
                        <p className="text-[17px] font-semibold leading-snug">{item.titulo}</p>
                        <p className="text-sm text-text-3">{[item.time, item.ocasional ? "quando o mês tiver" : ""].filter(Boolean).join(" · ")}</p>
                        {isNext ? <p className="mt-1.5 text-sm font-semibold text-purple-dark">{sextas.next?.quando}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-px overflow-hidden rounded-xl border border-line bg-line">
            {meetings.map(({ name, when, icon: Icon }) => (
              <li key={name} className="flex items-start gap-3.5 bg-white p-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-tint text-purple">
                  <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="text-[17px] font-semibold">{name}</p>
                  <p className="mt-0.5 text-sm text-text-3">{when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
