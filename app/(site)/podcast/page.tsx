import { Headphones } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";

import { episodios } from "./data";

export const metadata: Metadata = {
  title: "Podcast Salt Talks",
  description: "Conversas que dão sabor à fé: aprofundamento bíblico a partir das aulas da Escola Bíblica.",
};

const SHOW_URL = "https://open.spotify.com/show/0tXOSImjZs2Tl8ZKA9cVpD";

export default function PodcastPage() {
  const count = episodios.length === 1 ? "1 episódio" : `${episodios.length} episódios`;

  return (
    <>
      <section aria-labelledby="page-title" className="pb-[clamp(56px,7vw,96px)] pt-[clamp(48px,6vw,88px)]">
        <div className="container-site flex flex-wrap items-center gap-x-[clamp(40px,6vw,80px)] gap-y-10">
          <div className="relative size-[clamp(200px,20vw,260px)] shrink-0 overflow-hidden rounded-xl border border-line">
            <Image src="/images/salt-talks.png" alt="Capa do podcast Salt Talks" fill sizes="260px" className="object-cover" priority />
          </div>
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-[18px]">
            <p className="eyebrow">Podcast</p>
            <div>
              <h1 id="page-title" className="font-display text-[clamp(36px,4.4vw,56px)] font-semibold leading-[1.08] tracking-[-0.025em]">
                Salt Talks
              </h1>
              <p className="mt-2 font-display text-[clamp(18px,1.6vw,21px)] font-medium text-text-2">Conversas que dão sabor à fé.</p>
            </div>
            <p className="max-w-[620px] text-[17px] text-text-2">
              Um espaço de conversa, aprendizado e aprofundamento bíblico. A partir das aulas da nossa Escola Bíblica, exploramos temas
              teológicos de forma clara e prática, ajudando alunos e ouvintes a pensarem a fé cristã com mais profundidade e propósito.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <a
                href={SHOW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-[22px] text-[15px] font-semibold text-primary-foreground hover:bg-purple-dark"
              >
                <Headphones className="size-[18px]" strokeWidth={1.75} aria-hidden /> Seguir no Spotify
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
              <ButtonLink href="#episodios" variant="secondary">
                Ver episódios
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section id="episodios" aria-labelledby="episodios-titulo" className="scroll-mt-20 bg-sand py-[clamp(64px,8vw,112px)]">
        <div className="container-site">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="episodios-titulo" className="font-display text-[clamp(28px,2.8vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em]">
              Episódios
            </h2>
            <p className="text-text-3">{count}</p>
          </div>

          <ol className="flex flex-col gap-4">
            {episodios.map((ep, i) => (
              <li key={ep.spotifyId} className="flex flex-wrap gap-x-[clamp(24px,4vw,48px)] gap-y-4 rounded-xl border border-line bg-white p-[clamp(20px,3vw,32px)]">
                <span className="w-16 shrink-0 pt-1 text-sm font-semibold text-purple">EP {String(episodios.length - i).padStart(2, "0")}</span>
                <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2">
                  <h3 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em]">{ep.title}</h3>
                  <p className="max-w-[680px] text-text-2">{ep.description}</p>
                  <iframe
                    src={`https://open.spotify.com/embed/episode/${ep.spotifyId}?utm_source=generator`}
                    title={`Player do Spotify: ${ep.title}`}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="mt-3 h-[152px] w-full max-w-[680px] rounded-[10px] border-0"
                  />
                  <div>
                    <ButtonLink href={`https://open.spotify.com/episode/${ep.spotifyId}`} variant="text" icon="external">
                      Abrir no Spotify
                    </ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-7 text-[15px] text-text-3">Novos episódios em breve. Siga o Salt Talks no Spotify para ser avisado.</p>
        </div>
      </section>
    </>
  );
}
