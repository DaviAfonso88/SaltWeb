import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CHURCH_NAME, CHURCH_URL } from "@/lib/site-info";

export function AboutSummary() {
  return (
    <section aria-labelledby="quem-somos" className="bg-sand py-[clamp(64px,8vw,112px)]">
      <div className="container-site grid items-center gap-x-[clamp(40px,6vw,88px)] gap-y-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#ece9e4]">
          <Image src="/images/acampa-fogueira.jpg" alt="Jovens abraçados caminhando em direção à fogueira, à noite, no Acampa SALT" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col gap-5">
          <SectionHeading id="quem-somos" eyebrow="Quem somos" title="Sal e luz em nossa geração." />
          <p className="text-[17px] text-text-2">
            A Juventude Salt é o movimento jovem da{" "}
            <a href={CHURCH_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-purple underline underline-offset-4 hover:text-purple-dark">
              {CHURCH_NAME}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
            . Inspirados por Mateus 5.13-14 e
            1 João 1.5-7, vivemos para ser sal e luz em nossa geração.
          </p>
          <p className="text-[17px] text-text-2">
            Nosso propósito é glorificar a Deus, servir a igreja, amar pessoas e formar discípulos, refletindo a luz de Cristo
            em tudo o que fazemos.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <ButtonLink href="/sobre" variant="text" icon="next">
              Conheça nossa história
            </ButtonLink>
            <ButtonLink href={CHURCH_URL} variant="text" icon="external">
              Conheça a igreja
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
