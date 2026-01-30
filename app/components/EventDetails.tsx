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
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <div className="space-y-4">
      {event.imagem && (
        <div className="relative w-full rounded-2xl overflow-hidden border border-border/30">
          {/* Placeholder with the same aspect ratio as the image */}
          <div className="w-full aspect-[3/2] bg-background/50 flex justify-center items-center">
            {isImageLoading && <Spinner />}
          </div>
          <Image
            src={event.imagem}
            alt={event.titulo}
            width={1200}
            height={800}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoadingComplete={() => setIsImageLoading(false)}
          />
        </div>
      )}
      <p className="text-2xl font-bold text-foreground -mb-2 pt-2">
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
            {event.locationName ?? ""}{event.locationName && event.address ? " — " : ""}
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
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light hover:shadow-glow transition-all duration-300"
          >
            <ExternalLink className="h-4 w-4" />
            {event.linkLabel ?? "Saiba mais"}
          </a>
        )}
      </div>
    </div>
  );
}
