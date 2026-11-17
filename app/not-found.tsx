import type { Metadata } from "next";

import { ButtonLink } from "@/components/site/ButtonLink";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="conteudo" className="flex-grow py-[clamp(72px,10vw,160px)]">
        <div className="container-site max-w-xl text-center">
          <p className="eyebrow">Erro 404</p>
          <h1 className="mt-4 font-display text-[clamp(36px,5vw,64px)] font-semibold leading-[1.02] tracking-[-0.04em]">
            Não encontramos esta página
          </h1>
          <p className="mt-4 text-text-2">O link pode estar errado ou a página mudou de lugar.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" icon="next">
              Ir para o início
            </ButtonLink>
            <ButtonLink href="/eventos" variant="secondary">
              Ver eventos
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
