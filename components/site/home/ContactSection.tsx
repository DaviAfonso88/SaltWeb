import { ContactForm } from "@/components/site/ContactForm";
import { MapSection } from "@/components/site/home/MapSection";
import { SectionHeading } from "@/components/site/SectionHeading";

export function ContactSection() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="scroll-mt-20 py-[clamp(64px,8vw,112px)]">
      <div className="container-site grid items-start gap-x-[clamp(32px,5vw,72px)] gap-y-12 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <SectionHeading
            id="contato-titulo"
            eyebrow="Contato"
            title="Fale com a gente"
            description="Quer conhecer a Salt ou tem alguma dúvida? Mande uma mensagem e a gente responde."
          />
          <div className="mt-2">
            <ContactForm />
          </div>
        </div>
        <MapSection />
      </div>
    </section>
  );
}
