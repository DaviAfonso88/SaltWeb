import type { Metadata } from "next";

import { ButtonLink } from "@/components/site/ButtonLink";
import { PageHeader } from "@/components/site/SectionHeading";
import { VisitanteForm } from "@/components/site/VisitanteForm";
import { SEXTAS } from "@/lib/programacoes/catalog";
import { getProgramacoes } from "@/lib/programacoes/queries";
import { isEncontro, ritmoDasSextas } from "@/lib/programacoes/ritmo";
import { describeSchedule } from "@/lib/programacoes/schedule";

export const metadata: Metadata = {
  title: "Primeira vez na SALT",
  description: "Está visitando a Juventude SALT? Deixe seu contato e a liderança fala com você pelo WhatsApp.",
};

const NEXT_STEPS = [
  "Você deixa seu contato aqui (leva um minuto).",
  "Alguém da liderança do seu grupo chama você no WhatsApp.",
  "A gente te ajuda a achar uma célula, um discipulado ou um lugar para servir.",
];

export default async function VisitantePage() {
  const programacoes = await getProgramacoes();
  const sextas = ritmoDasSextas(programacoes);
  const meetings = programacoes.filter(isEncontro);

  return (
    <>
      <PageHeader
        eyebrow="Primeira vez?"
        title="Que bom ter você aqui."
        description="Deixe seu contato para a gente te conhecer e te ajudar a encontrar seu lugar na SALT."
      />

      <section aria-label="Cadastro de visitante" className="pb-[clamp(64px,8vw,112px)]">
        <div className="container-site grid items-start gap-x-[clamp(32px,4vw,64px)] gap-y-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <VisitanteForm />

          <aside aria-labelledby="depois-titulo" className="grid gap-8 rounded-xl bg-sand p-[clamp(24px,3vw,36px)] lg:sticky lg:top-24">
            <div className="grid gap-4">
              <h2 id="depois-titulo" className="font-display text-xl font-semibold tracking-[-0.01em]">
                O que acontece depois
              </h2>
              <ol className="grid gap-3">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-[15px] text-text-2">
                    <span
                      aria-hidden
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-semibold text-white"
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-4 border-t border-line pt-8">
              <h2 className="font-display text-xl font-semibold tracking-[-0.01em]">Quando a gente se encontra</h2>
              <dl className="grid gap-4">
                {sextas.items.length ? (
                  <div className="grid gap-1">
                    <dt className="font-semibold">{SEXTAS.titulo}</dt>
                    {sextas.next ? (
                      <dd className="m-0 text-[15px] text-text-2">
                        Próxima: <strong className="font-semibold text-foreground">{sextas.next.titulo}</strong> ·{" "}
                        {[sextas.next.quando, sextas.next.time].filter(Boolean).join(" · ")}
                      </dd>
                    ) : null}
                    <dd className="m-0">
                      <ul className="grid gap-0.5 text-sm text-text-3">
                        {sextas.items.map((i) => (
                          <li key={i.slug}>
                            {i.tag}: {i.titulo}
                            {i.ocasional ? " (quando o mês tiver)" : ""}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : null}
                {meetings.map((m) => (
                  <div key={m.slug} className="grid gap-0.5">
                    <dt className="font-semibold">{m.titulo}</dt>
                    <dd className="m-0 text-[15px] text-text-2">{describeSchedule(m.schedule).long}</dd>
                  </div>
                ))}
              </dl>
              <ButtonLink href="/eventos" variant="text" icon="next" className="justify-self-start">
                Ver a agenda de eventos
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
