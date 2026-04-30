"use client";

import { useRef } from "react";
import BotaoPrimario from "../BotaoPrimario";
import SectionLabel from "../SectionLabel";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function About() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="section-spacing bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden noise-overlay">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container-elegant grid md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left side - Text with scroll reveal */}
        <div 
          ref={leftRef}
          className={`text-center md:text-left space-y-6 transition-all duration-1000 ${
            leftVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
          <SectionLabel withMargin={false}>
            Quem somos
          </SectionLabel>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Juventude <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Salt</span>
          </h2>

          <div className="space-y-4 text-foreground/70">
            <p className="leading-relaxed relative">
              <span className="relative z-10">
                A <span className="font-semibold text-primary">Juventude Salt</span>{" "}
                é o movimento jovem da Primeira Igreja Batista em Lagoa Santa.
                Inspirados por <span className="font-medium text-foreground">Mateus 5.13-14</span> e{" "}
                <span className="font-medium text-foreground">1 João 1.5-7</span>, vivemos para ser
                sal e luz em nossa geração.
              </span>
            </p>

            <p className="leading-relaxed relative">
              <span className="relative z-10">
                Nosso propósito é{" "}
                <span className="font-semibold text-primary">
                  glorificar a Deus, servir a igreja, amar pessoas e formar
                  discípulos
                </span>
                , refletindo a luz de Cristo em tudo o que fazemos.
              </span>
            </p>
          </div>

          <div className="pt-4">
            <BotaoPrimario href="/sobre" variant="outline" className="hover-lift border-draw">
              <span className="relative z-10">Conheça nossa história</span>
            </BotaoPrimario>
          </div>
        </div>

        {/* Right side - Image with enhanced effects */}
        <div 
          ref={rightRef}
          className={`relative transition-all duration-1000 delay-300 ${
            rightVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
          }`}
        >
          {/* Layered border effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-primary/30 via-primary-light/20 to-primary/30 rounded-2xl blur-xl" />
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-lg" />
          
          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl group">
            <img
              src="/images/salt-home.jpg"
              alt="Juventude Salt"
              className="w-full h-[500px] object-cover transform transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-foreground/30" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-foreground/30" />
          </div>
        </div>
      </div>
    </section>
  );
}