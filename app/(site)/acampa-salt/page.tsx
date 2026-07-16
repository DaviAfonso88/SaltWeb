import type { Metadata } from "next";

import { HeroSection } from "./components/HeroSection";
import { PriceTable } from "./components/PriceTable";
import { RegistrationForm } from "./components/RegistrationForm";
import { REGISTRATION_OPEN } from "@/lib/acampa/constants";

export const metadata: Metadata = {
  title: "Acampa SALT 2026 | Inscricao",
  description: "Sistema oficial de inscricao do Acampa SALT 2026.",
};

export default function AcampaSaltPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-28 md:pb-16 md:pt-32">
      <HeroSection registrationOpen={REGISTRATION_OPEN} />
      {REGISTRATION_OPEN ? (
        <>
          <PriceTable />
          <RegistrationForm />
        </>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Inscricoes encerradas
          </h2>
          <p className="mt-4 text-muted-foreground">
            As inscricoes para o Acampa SALT 2026 foram encerradas. Fique atento
            as nossas redes sociais para futuros eventos.
          </p>
        </div>
      )}
    </div>
  );
}
