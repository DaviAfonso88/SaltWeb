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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold font-heading text-foreground text-center mb-12">
          Onde Nos Encontrar
        </h2>

        {/* Mapa */}
        <div className="bg-card rounded-xl shadow-lg overflow-hidden h-[300px] md:h-[400px] w-full max-w-4xl mx-auto border border-white/5">
          <iframe
            src={`${mapsUrl}&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização da Primeira Igreja Batista em Lagoa Santa"
          />
        </div>

        {/* Endereço + Botões */}
        <div className="mt-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-br from-[#18181b] via-[#92348c]/10 to-[#18181b] animate-gradient-xy rounded-xl p-6 border border-white/5">
          <div className="flex items-center gap-2 text-muted-foreground text-sm text-center md:text-left">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{address}</span>
          </div>

          <div className="flex gap-3">
            {/* Copiar */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-white/10 text-foreground hover:border-[#92348c] cursor-pointer transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar endereço
                </>
              )}
            </button>

            {/* Abrir no Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-white hover:opacity-90  transition-all  "
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
