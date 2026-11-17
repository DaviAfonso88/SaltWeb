import { SectionHeading } from "@/components/site/SectionHeading";

const PILLARS = [
  { n: "01", title: "Fé", text: "Vivemos uma fé viva, bíblica e relevante, firmados na Palavra." },
  { n: "02", title: "Comunidade", text: "Construímos relacionamentos saudáveis e cuidamos uns dos outros." },
  { n: "03", title: "Missão", text: "Servimos com excelência, impactando vidas dentro e fora da igreja." },
];

export function Pillars() {
  return (
    <section aria-labelledby="pilares" className="py-[clamp(64px,8vw,112px)]">
      <div className="container-site">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
          <SectionHeading id="pilares" eyebrow="Fundamentos" title="Nossos pilares" />
          <p className="max-w-[420px] text-text-2">Tudo o que fazemos nasce de três compromissos que vivemos juntos, todos os dias.</p>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-12 gap-y-10">
          {PILLARS.map((p) => (
            <li key={p.n} className="flex flex-col gap-2.5 border-t border-ink pt-6">
              <span className="text-sm font-semibold text-purple">{p.n}</span>
              <h3 className="font-display text-[22px] font-semibold tracking-[-0.01em]">{p.title}</h3>
              <p className="text-text-2">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
