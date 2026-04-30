"use client";

import React, { useState } from "react";
import { MapPin, Copy, ExternalLink, Check, Navigation } from "lucide-react";
import SectionLabel from "../SectionLabel";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function MapSection() {
  const address =
    "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa - MG, 33239-800, Brazil";

  const mapsUrl =
    "https://www.google.com/maps?q=Primeira+Igreja+Batista+em+Lagoa+Santa,+MG";

  const [copied, setCopied] = useState(false);

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: mapRef, isVisible: mapVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: footerRef, isVisible: footerVisible } = useScrollReveal({ threshold: 0.2 });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-spacing bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 border border-primary/10 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

      <div className="container-elegant relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <SectionLabel>Localização</SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Onde Nos <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Encontrar</span>
          </h2>
        </div>

        {/* Mapa */}
        <div
          ref={mapRef}
          className={`relative mb-8 max-w-5xl mx-auto transition-all duration-1000 delay-300 ${
            mapVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Layered glow effects */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 via-primary-light/20 to-primary/30 rounded-2xl blur-xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-lg" />
          
          <div className="relative bg-card rounded-2xl shadow-2xl overflow-hidden h-[350px] md:h-[450px] border border-border/50 group hover-glow transition-all duration-500">
            <iframe
              src={`${mapsUrl}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização da Primeira Igreja Batista em Lagoa Santa"
              className="w-full h-full"
            />
            
            {/* Map overlay gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/20" />
            
            {/* Corner decorations */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-foreground/20 group-hover:border-primary/40 transition-colors duration-300" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-foreground/20 group-hover:border-primary/40 transition-colors duration-300" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-foreground/20 group-hover:border-primary/40 transition-colors duration-300" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-foreground/20 group-hover:border-primary/40 transition-colors duration-300" />
          </div>
        </div>

        {/* Endereço + Botões */}
        <div
          ref={footerRef}
          className={`max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 glass-effect rounded-2xl p-8 border border-border/50 shadow-xl transition-all duration-1000 delay-500 ${
            footerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center gap-4 text-foreground/70 text-base text-center md:text-left">
            <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">{address}</p>
              <p className="text-sm text-foreground/50 mt-1">Primeira Igreja Batista em Lagoa Santa</p>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Copiar */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-border/50 text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary hover-lift"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>

            {/* Abrir no Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl text-white bg-primary-light hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background hover-lift"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir no Maps</span>
            </a>
          </div>
        </div>

        {/* Additional info cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {[
            {
              icon: <Navigation className="w-6 h-6 text-primary" />,
              title: "Estacionamento",
              text: "Estacionamento gratuito no local",
            },
            {
              icon: <MapPin className="w-6 h-6 text-primary" />,
              title: "Acesso",
              text: "Entrada pela porta lateral",
            },
            {
              icon: <Check className="w-6 h-6 text-primary" />,
              title: "Acessibilidade",
              text: "Estrutura adaptada",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 hover:shadow-glow hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                {item.icon}
              </div>
              <div>
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-foreground/50">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}