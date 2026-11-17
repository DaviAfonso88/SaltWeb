import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";
import { SectionHeading } from "@/components/site/SectionHeading";

const PHOTOS = [
  { src: "/images/invasão.jpeg", alt: "Jovens servindo durante a Operação Invasão", caption: "Operação Invasão" },
  { src: "/images/acampamento.jpeg", alt: "Turma reunida no acampamento de Carnaval", caption: "Acampamento" },
  { src: "/images/orla.jpeg", alt: "Grupo do Projeto Missionário ao ar livre", caption: "Projeto Missionário" },
  { src: "/images/avalanche.jpg", alt: "Jovens caminhando pelas ruas no projeto Avalanche", caption: "Avalanche" },
  { src: "/images/pescador.jpeg", alt: "Momentos do projeto Pescador", caption: "Pescador" },
  { src: "/images/turma-de-minas.jpeg", alt: "Turma de Minas reunida em frente ao palco", caption: "Turma de Minas" },
];

export function Gallery() {
  return (
    <section aria-labelledby="momentos" className="bg-sand py-[clamp(64px,8vw,112px)]">
      <div className="container-site">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
          <SectionHeading id="momentos" eyebrow="Momentos" title="Nossa juventude em ação" />
          <ButtonLink href="https://www.instagram.com/saltjuventude_/" variant="text" icon="external">
            Mais fotos no Instagram
          </ButtonLink>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-x-5 gap-y-7">
          {PHOTOS.map((p) => (
            <li key={p.src}>
              <figure className="flex flex-col gap-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#ece9e4]">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="text-[15px] font-semibold">{p.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
