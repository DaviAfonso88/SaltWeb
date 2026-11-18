import { Clock, MessageCircle, Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/site/ButtonLink";
import { PageHeader, SectionHeading } from "@/components/site/SectionHeading";
import { ServirForm } from "@/components/site/ServirForm";
import { getProgramacoes } from "@/lib/programacoes/queries";
import { describeSchedule } from "@/lib/programacoes/schedule";
import { whatsappUrlWithText } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a trajetória, os valores e as programações da Juventude Salt.",
};

const VALUES = [
  {
    n: "01",
    title: "Amamos a Deus",
    text: "O verdadeiro discipulado de Jesus cumpre o maior mandamento, que resume toda a Lei de Moisés. Em primeiro lugar, amar a Deus e, consequentemente, ao próximo. Isso ocorre quando buscamos adorar, obedecer e confiar em Deus.",
  },
  {
    n: "02",
    title: "Servimos à Igreja",
    text: "Quando recebemos o Senhor como Salvador, o próprio Espírito confirma ao nosso espírito que somos filhos de Deus (Rm 8.16). Dessa forma, passamos não apenas a amá-lo, mas somos capacitados pelo próprio Espírito Santo para servi-lo.",
  },
  {
    n: "03",
    title: "Discipulamos pessoas",
    text: "Cumprir o IDE é evangelizar e batizar novos discípulos, mas não para por aí. Cabe a todo seguidor de Jesus, enquanto peregrino na terra, caminhar ao lado de outros discípulos, como Jesus fez no caminho de Emaús, e ensinar toda a Escritura.",
  },
];

export default async function SobrePage() {
  const programacoes = await getProgramacoes();
  return (
    <>
      <PageHeader
        eyebrow="Sobre nós"
        title="Uma juventude para ser sal e luz."
        description="Conheça a trajetória e os valores que movem a Juventude Salt."
        className="pb-0"
      >
        <div className="relative mt-[clamp(32px,4vw,56px)] h-[clamp(260px,32vw,460px)] w-full overflow-hidden rounded-xl bg-[#ece9e4]">
          <Image
            src="/images/turma-de-minas2.jpeg"
            alt="Juventude SALT reunida em frente ao palco"
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </PageHeader>

      <section aria-labelledby="historia" className="py-[clamp(64px,8vw,112px)]">
        <div className="container-site flex flex-wrap gap-x-[clamp(40px,6vw,96px)] gap-y-5">
          <SectionHeading id="historia" eyebrow="Nossa história" title="De onde viemos" className="flex-[1_1_300px]" />
          <div className="flex flex-[2_1_480px] flex-col gap-[18px] text-lg leading-[1.7] text-[#36333c]">
            <p>
              A Juventude Salt nasceu do desejo de criar um ambiente onde jovens pudessem se conectar com Deus de forma autêntica e
              relevante. Somos o ministério jovem da Primeira Igreja Batista em Lagoa Santa, uma comunidade que nos acolhe e impulsiona.
            </p>
            <p>
              Nossa jornada é marcada por amizades, crescimento e serviço. Acreditamos que cada jovem tem um papel fundamental no Reino
              de Deus e buscamos equipá-los para viverem seu propósito.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="valores" className="bg-sand py-[clamp(64px,8vw,112px)]">
        <div className="container-site">
          <SectionHeading id="valores" eyebrow="Nossos valores" title="Declaração de propósitos" className="mb-10" />
          <ol className="border-b border-line-strong">
            {VALUES.map((v) => (
              <li key={v.n} className="flex flex-wrap gap-x-12 gap-y-3 border-t border-line-strong py-8">
                <div className="flex flex-[1_1_300px] items-baseline gap-5">
                  <span className="text-sm font-semibold text-purple">{v.n}</span>
                  <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.015em]">{v.title}</h3>
                </div>
                <p className="flex-[2_1_480px] text-[17px] text-text-2">{v.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="lideranca" className="py-[clamp(64px,8vw,112px)]">
        <div className="container-site flex flex-wrap items-center gap-x-[clamp(40px,6vw,88px)] gap-y-10">
          <div className="relative aspect-[4/5] w-full max-w-[400px] min-w-0 flex-[0_1_400px] overflow-hidden rounded-xl bg-[#ece9e4]">
            <Image src="/images/pastor.jpeg" alt="Pastor Davi Franco pregando" fill sizes="(min-width: 1024px) 400px, 90vw" className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
            <p className="eyebrow">Liderança</p>
            <div>
              <h2 id="lideranca" className="font-display text-[clamp(28px,2.8vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em]">
                Davi Franco
              </h2>
              <p className="mt-1 text-text-3">Pastor da Juventude</p>
            </div>
            <p className="max-w-[560px] text-[17px] text-text-2">
              Pastor Davi Franco dedica sua vida a guiar e inspirar os jovens da Juventude Salt. Com paixão pelo discipulado e um
              coração voltado para o serviço, ele lidera com sabedoria, promovendo um ambiente de fé, crescimento e comunhão. Sua
              visão é ver cada jovem florescer em seu propósito, impactando o mundo ao seu redor com os valores do Reino.
            </p>
            <div>
              <a
                href={whatsappUrlWithText("Olá Pastor Davi, gostaria de conversar com você.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-line-strong bg-white px-5 text-[15px] font-semibold hover:bg-sand"
              >
                <MessageCircle className="size-[18px]" strokeWidth={1.75} aria-hidden /> Fale com o pastor
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="programacoes" className="bg-sand py-[clamp(64px,8vw,112px)]">
        <div className="container-site">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
            <SectionHeading id="programacoes" eyebrow="Agenda" title="Nossas programações" />
            <p className="max-w-[400px] text-text-2">Encontros fixos para você se conectar, crescer e servir com a galera.</p>
          </div>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-5">
            {programacoes.map((p) => {
              const hasLink = p.linkBotao !== "#";
              const external = p.linkBotao.startsWith("http");
              return (
                <li key={p.slug} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
                  <div className="relative aspect-[4/3] bg-[#ece9e4]">
                    <Image src={p.imagem} alt={`Imagem: ${p.titulo}`} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-3">
                      <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
                      {describeSchedule(p.schedule).long}
                    </p>
                    <h3 className="font-display text-[19px] font-semibold leading-tight tracking-[-0.01em]">{p.titulo}</h3>
                    <p className="text-[15px] text-text-2">{p.descricao}</p>
                    {hasLink ? (
                      <div className="mt-auto">
                        <ButtonLink href={p.linkBotao} variant="text" icon={external ? "external" : "next"}>
                          {p.textoBotao}
                        </ButtonLink>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="podcast-chamada" className="pt-[clamp(64px,8vw,112px)]">
        <div className="container-site">
          <article className="flex flex-wrap items-center gap-x-[clamp(28px,4vw,48px)] gap-y-7 rounded-xl border border-line p-[clamp(24px,3.5vw,40px)]">
            <div className="relative size-[168px] shrink-0 overflow-hidden rounded-[10px]">
              <Image src="/images/salt-talks.png" alt="Capa do podcast Salt Talks" fill sizes="168px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3">
              <p className="eyebrow">Podcast</p>
              <h2 id="podcast-chamada" className="font-display text-[clamp(24px,2.4vw,30px)] font-semibold leading-tight tracking-[-0.015em]">
                Salt Talks
              </h2>
              <p className="max-w-[620px] text-text-2">
                Um espaço de conversa, aprendizado e aprofundamento bíblico. A partir das aulas da nossa Escola Bíblica, exploramos
                temas teológicos de forma clara e prática.
              </p>
            </div>
            <Link
              href="/podcast"
              className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg bg-ink px-5 text-[15px] font-semibold text-white hover:bg-ink/85"
            >
              <Play className="size-3.5 fill-current" aria-hidden /> Ouvir episódios
            </Link>
          </article>
        </div>
      </section>

      <section id="servir" aria-labelledby="servir-titulo" className="scroll-mt-20 py-[clamp(64px,8vw,112px)]">
        <div className="container-site grid items-start gap-x-[clamp(32px,5vw,72px)] gap-y-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SectionHeading id="servir-titulo" eyebrow="Oportunidade" title="Quer servir com a gente?" />
            <p className="max-w-[440px] text-[17px] text-text-2">
              Use seus dons para servir a igreja. Escolha um ministério e a liderança entra em contato com você.
            </p>
          </div>
          <ServirForm />
        </div>
      </section>
    </>
  );
}
