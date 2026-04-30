"use client";

import { useRef } from "react";
import { Feather, Users, HeartHandshake, Zap } from "lucide-react";
import SectionLabel from "../SectionLabel";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const pillars = [
  {
    icon: <Feather className="h-10 w-10 mx-auto text-primary" />,
    titulo: "Fé",
    texto: "Vivemos uma fé viva, bíblica e relevante, firmados na Palavra.",
    detalhe: "Firme na Palavra",
  },
  {
    icon: <Users className="h-10 w-10 mx-auto text-primary" />,
    titulo: "Comunidade",
    texto: "Construímos relacionamentos saudáveis e cuidamos uns dos outros.",
    detalhe: "Juntos crescemos",
  },
  {
    icon: <HeartHandshake className="h-10 w-10 mx-auto text-primary" />,
    titulo: "Missão",
    texto: "Servimos com excelência, impactando vidas dentro e fora da igreja.",
    detalhe: "Servir é amar",
  },
];

export default function Pillars() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section className="section-spacing bg-gradient-to-b from-card via-background to-card relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Floating decorations */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-primary/10 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

      <div className="container-elegant text-center relative z-10">
        <div 
          ref={headerRef}
          className={`mb-20 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <SectionLabel>
            Fundamentos
          </SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Nossos <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Pilares</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((item, i) => (
            <PillarCard 
              key={i} 
              item={item} 
              index={i}
              ref={(el) => { cardRefs.current[i] = el; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { forwardRef } from "react";

interface PillarCardProps {
  item: {
    icon: React.ReactNode;
    titulo: string;
    texto: string;
    detalhe: string;
  };
  index: number;
}

const PillarCard = forwardRef<HTMLDivElement, PillarCardProps>(function PillarCard({ item, index }, ref) {
  const { ref: cardRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={(el) => {
        cardRef.current = el;
        if (ref) {
          if (typeof ref === 'function') {
            ref(el);
          } else {
            ref.current = el;
          }
        }
      }}
      className={`group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-700 hover:border-primary/50 hover:shadow-glow hover:shadow-primary/20 hover:-translate-y-2 hover-glow ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500" />

      <div className="relative">
        {/* Icon container with glow */}
        <div className="inline-flex p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">{item.icon}</div>
        </div>

        <h3 className="text-2xl font-bold font-heading text-foreground mt-6 mb-4 group-hover:text-primary transition-colors duration-300">
          {item.titulo}
        </h3>

        <p className="text-foreground/70 leading-relaxed mb-4">
          {item.texto}
        </p>

        {/* Detail tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary/70 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
          <Zap className="w-3 h-3" />
          {item.detalhe}
        </div>
      </div>
    </div>
  );
});