import { Home, MessageCircle, Music, Users } from "lucide-react";
import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";

const MEETINGS = [
  { name: "Células de Jovens", when: "Sextas · 19h30", icon: Home },
  { name: "Células de Adolescentes", when: "Sextas · 19h30", icon: Users },
  { name: "Culto SALT", when: "1ª sexta do mês · 19h45", icon: Music },
  { name: "Discipulado", when: "Horário a combinar", icon: MessageCircle },
];

export function Hero() {
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
        <div className="container-site">
          <h2 id="encontros-title" className="mb-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-text-3">
            Encontros regulares
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-px overflow-hidden rounded-xl border border-line bg-line">
            {MEETINGS.map(({ name, when, icon: Icon }) => (
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
