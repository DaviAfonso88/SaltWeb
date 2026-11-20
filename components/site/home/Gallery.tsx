import Image from "next/image";

import { ButtonLink } from "@/components/site/ButtonLink";
import { SectionHeading } from "@/components/site/SectionHeading";

type Photo = { src: string; alt: string; caption: string; /** Evento de onde a foto veio, quando a legenda é o momento. */ evento?: string };

const ACAMPA = "Acampa SALT 2026";

// Fotos recentes intercaladas com as dos projetos (grade de 4 colunas no desktop).
const PHOTOS: Photo[] = [
  { src: "/images/acampa-violao.jpg", alt: "Jovens tocando violão perto da fogueira no Acampa SALT", caption: "Noite da fogueira", evento: ACAMPA },
  { src: "/images/invasão.jpeg", alt: "Jovens servindo durante a Operação Invasão", caption: "Operação Invasão" },
  { src: "/images/acampa-gincana.jpg", alt: "Jovem sorrindo e agitando a bandeira amarela da equipe na gincana do Acampa SALT", caption: "Gincana", evento: ACAMPA },
  { src: "/images/orla.jpeg", alt: "Grupo do Projeto Missionário ao ar livre", caption: "Projeto Missionário" },
  { src: "/images/acampa-amigas.jpg", alt: "Duas amigas sorrindo juntas num dia de sol no Acampa SALT", caption: "Amizades", evento: ACAMPA },
  { src: "/images/acampa-tarde.jpg", alt: "Duas jovens sorrindo, com o rosto pintado, num fim de tarde no Acampa SALT", caption: "Fim de tarde", evento: ACAMPA },
  { src: "/images/avalanche.jpg", alt: "Jovens caminhando pelas ruas no projeto Avalanche", caption: "Avalanche" },
  { src: "/images/acampa-louvor.jpg", alt: "Jovens com as mãos levantadas durante o louvor no Acampa SALT", caption: "Louvor", evento: ACAMPA },
  { src: "/images/acampa-batismo.jpg", alt: "Abraço logo depois do batismo, no Acampa SALT", caption: "Batismos", evento: ACAMPA },
  { src: "/images/acampa-futebol.jpg", alt: "Time comemorando com medalhas no futebol do Acampa SALT", caption: "Futebol", evento: ACAMPA },
  { src: "/images/acampa-canibal-tinta.jpg", alt: "Dois jovens sorrindo, com o rosto e a camiseta manchados de tinta, no Canibal do Acampa SALT", caption: "Canibal", evento: ACAMPA },
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
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-4">
          {PHOTOS.map((p) => (
            <li key={p.src}>
              <figure className="flex flex-col gap-2.5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#ece9e4]">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 290px, 50vw" className="object-cover" />
                </div>
                <figcaption className="grid gap-0.5">
                  <span className="text-[15px] font-semibold leading-snug">{p.caption}</span>
                  {p.evento ? <span className="text-[13px] text-text-3">{p.evento}</span> : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
