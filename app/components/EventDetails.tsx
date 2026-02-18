"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import type { Evento } from "../eventos/data";

type EventDetailsProps = {
  event: Evento;
};

// A simple spinner component
const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function EventDetails({ event }: EventDetailsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  const handleImageLoading = (url: string, done: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [url]: !done }));
  };

  return (
    <div className="space-y-4">
      {event.imagens && event.imagens.length > 0 && (
        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-6 px-6">
          {event.imagens.map((imagem, index) => (
            <div
              key={index}
              className="relative w-full flex-shrink-0 snap-center rounded-2xl overflow-hidden border border-border/30 max-w-[80vw] md:max-w-md"
            >
              <div className="w-full aspect-[3/2] bg-background/50 flex justify-center items-center">
                {loadingStates[imagem] !== false && <Spinner />}
              </div>
              <Image
                src={imagem}
                alt={`${event.titulo} - Imagem ${index + 1}`}
                width={800}
                height={533}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                  loadingStates[imagem] !== false ? "opacity-0" : "opacity-100"
                }`}
                onLoadingComplete={() => handleImageLoading(imagem, true)}
                onLoad={() => handleImageLoading(imagem, false)}
                onError={() => handleImageLoading(imagem, true)}
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-2xl font-bold text-foreground mb-4 pt-2">
        {event.titulo}
      </p>

      <div className="flex items-center text-muted-foreground">
        <CalendarDays className="mr-2 h-5 w-5 text-primary" />
        <span>
          {new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(event.dateISO))}
        </span>
      </div>
      {(event.locationName || event.address) && (
        <div className="flex items-center text-muted-foreground">
          <MapPin className="mr-2 h-5 w-5 text-primary" />
          <span>
            {event.locationName ?? ""}
            {event.locationName && event.address ? " — " : ""}
            {event.address ?? ""}
          </span>
        </div>
      )}
      <p className="text-muted-foreground leading-relaxed pt-2">
        {event.description}
      </p>

      <div className="flex flex-wrap gap-3 pt-4">
        {event.mapsUrl && (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-border/50 text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
          >
            <MapPin className="h-4 w-4" />
            Ver no Maps
          </a>
        )}
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary text-black hover:bg-primary-light hover:shadow-glow transition-all duration-300"
          >
            <ExternalLink className="h-4 w-4" />
            {event.linkLabel ?? "Saiba mais"}
          </a>
        )}
      </div>
    </div>
  );
}
