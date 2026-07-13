import type { Metadata } from "next";

import { HeroSection } from "./components/HeroSection";
import { PriceTable } from "./components/PriceTable";
import { RegistrationForm } from "./components/RegistrationForm";

export const metadata: Metadata = {
  title: "Acampa SALT 2026 | Inscricao",
  description: "Sistema oficial de inscricao do Acampa SALT 2026.",
};

export default function AcampaSaltPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-28 md:pb-16 md:pt-32">
      <HeroSection />
      <PriceTable />
      <RegistrationForm />
    </div>
  );
}
