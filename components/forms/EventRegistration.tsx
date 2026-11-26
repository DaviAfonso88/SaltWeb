"use client";

import { useRef, useState } from "react";

import { AcampamentoForm } from "@/components/forms/AcampamentoForm";
import { FestaForm } from "@/components/forms/FestaForm";
import { MissaoForm } from "@/components/forms/MissaoForm";
import { SimplesForm } from "@/components/forms/SimplesForm";
import { SuccessScreen } from "@/components/forms/SuccessScreen";
import { FormCard, type Person, type SubmitOutcome, type SubmitSummary } from "@/components/forms/shared";
import { SectionHeading } from "@/components/site/SectionHeading";
import type { PublicEvent } from "@/lib/events/queries";
import { describeEventDates } from "@/lib/format";
import type { FestaAvailability } from "@/lib/forms/availability";
import { CONTACT_EMAIL } from "@/lib/site-info";

type Props = {
  event: PublicEvent;
  /** Decidido no servidor (aberta + dentro da data limite). */
  open: boolean;
  availability?: FestaAvailability;
};

function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-[10px] border border-[#ebddb4] bg-warning-tint p-4 text-sm text-warning">
      <p className="font-semibold">{title}</p>
      {children ? <p className="mt-1">{children}</p> : null}
    </div>
  );
}

export function EventRegistration({ event, open, availability }: Props) {
  const [done, setDone] = useState<{ summary: SubmitSummary; person: Person } | null>(null);
  const [blocked, setBlocked] = useState<"duplicada" | "encerrada" | null>(null);
  const top = useRef<HTMLDivElement>(null);

  if (!event.formModel) return null;

  if (done) {
    return (
      <SuccessScreen
        eventTitle={event.title}
        summary={done.summary}
        name={done.person.nome}
        phone={done.person.telefone}
        when={describeEventDates(event.startsAt, event.endsAt).long}
        location={event.locationName}
        showPayment={event.formModel === "acampamento" || (event.formModel === "festa" && done.summary.valorFinalCentavos > 0)}
        healthReceived={event.formModel === "acampamento"}
      />
    );
  }

  if (!open || blocked === "encerrada") {
    return (
      <FormCard>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.015em]">Inscrições encerradas</h2>
        <p className="mt-2 text-text-2">
          As inscrições para este evento não estão abertas no momento. Dúvidas? Escreva para{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-purple underline hover:text-purple-dark">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </FormCard>
    );
  }

  function onOutcome(outcome: SubmitOutcome, person: Person) {
    if (outcome.kind === "ok") {
      setDone({ summary: outcome.summary, person });
      requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else if (outcome.kind === "duplicada" || outcome.kind === "encerrada") {
      setBlocked(outcome.kind);
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div ref={top} className="scroll-mt-24">
      <SectionHeading id="form-title" eyebrow="Inscrição" title="Garanta sua vaga" className="mb-8" />

      {blocked === "duplicada" ? (
        <div className="mb-6">
          <Notice title="Você já está inscrito(a) neste evento.">
            Encontramos uma inscrição com este nome e telefone. Se precisar de ajuda, fale com a equipe pelo e-mail {CONTACT_EMAIL}.
          </Notice>
        </div>
      ) : null}

      {event.formModel === "acampamento" ? <AcampamentoForm event={event} onOutcome={onOutcome} /> : null}
      {event.formModel === "festa" && availability ? <FestaForm event={event} availability={availability} onOutcome={onOutcome} /> : null}
      {event.formModel === "missao" ? <MissaoForm event={event} onOutcome={onOutcome} /> : null}
      {event.formModel === "simples" ? <SimplesForm event={event} onOutcome={onOutcome} /> : null}
    </div>
  );
}
