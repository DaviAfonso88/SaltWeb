import { ButtonLink } from "@/components/site/ButtonLink";

export default function EventNotFound() {
  return (
    <section className="py-[clamp(72px,10vw,144px)]">
      <div className="container-site max-w-xl text-center">
        <p className="eyebrow">Evento</p>
        <h1 className="mt-4 font-display text-[clamp(32px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.025em]">Não encontramos este evento</h1>
        <p className="mt-4 text-text-2">Ele pode ter acabado ou o link estar incorreto. Veja o que vem por aí.</p>
        <div className="mt-8">
          <ButtonLink href="/eventos">Ver todos os eventos</ButtonLink>
        </div>
      </div>
    </section>
  );
}
