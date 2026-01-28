"use client";

import React, { useState } from "react";
import { MapPin, Copy, ExternalLink, Check } from "lucide-react";

export default function MapSection() {
  const address =
    "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa - MG, 33239-800, Brazil";

  const mapsUrl =
    "https://www.google.com/maps?q=Primeira+Igreja+Batista+em+Lagoa+Santa,+MG";

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section-spacing bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
      <div className="container-elegant relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase mb-4">
            Localização
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Onde Nos <span className="text-gradient">Encontrar</span>
          </h2>
        </div>

        {/* Mapa */}
        <div className="relative mb-8 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-card rounded-2xl shadow-2xl overflow-hidden h-[350px] md:h-[450px] border border-border/50">
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
          </div>
        </div>

        {/* Endereço + Botões */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 glass-effect rounded-2xl p-8 border border-border/50 shadow-xl animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-3 text-foreground/70 text-base text-center md:text-left">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium">{address}</span>
          </div>

          <div className="flex gap-3">
            {/* Copiar */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-border/50 text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>

            {/* Abrir no Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light hover:shadow-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir no Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
