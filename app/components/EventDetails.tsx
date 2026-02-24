"use client";

import { useEffect, useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const totalImages = event.imagens?.length ?? 0;

  const handleImageLoading = (url: string, done: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [url]: !done }));
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [event.id]);

  const goToIndex = (index: number) => {
    if (totalImages === 0) {
      return;
    }
    const nextIndex = (index + totalImages) % totalImages;
    setActiveIndex(nextIndex);
  };

  const handleTouchStart = (eventTouch: React.TouchEvent) => {
    touchStartX.current = eventTouch.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (eventTouch: React.TouchEvent) => {
    if (touchStartX.current === null) {
      return;
    }
    const endX = eventTouch.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    const swipeThreshold = 40;
    if (Math.abs(delta) < swipeThreshold) {
      return;
    }
    if (delta < 0) {
      goToIndex(activeIndex + 1);
    } else {
      goToIndex(activeIndex - 1);
    }
  };

  return (
    <div className="space-y-4">
      {event.imagens && event.imagens.length > 0 && (
        <div className="space-y-3">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-background/50"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative h-[40vh] sm:h-[50vh] lg:h-[55vh]">
              {loadingStates[event.imagens[activeIndex]] !== false && (
                <div className="absolute inset-0">
                  <Spinner />
                </div>
              )}
              <Image
                src={event.imagens[activeIndex]}
                alt={`${event.titulo} - Imagem ${activeIndex + 1}`}
                fill
                sizes="(min-width: 1024px) 70vw, (min-width: 640px) 85vw, 100vw"
                className={`object-contain transition-opacity duration-500 ${
                  loadingStates[event.imagens[activeIndex]] !== false
                    ? "opacity-0"
                    : "opacity-100"
                }`}
                onLoadingComplete={() =>
                  handleImageLoading(event.imagens[activeIndex], true)
                }
                onLoad={() =>
                  handleImageLoading(event.imagens[activeIndex], false)
                }
                onError={() =>
                  handleImageLoading(event.imagens[activeIndex], true)
                }
                priority
              />
            </div>

            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur hover:bg-background"
                  aria-label="Imagem anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur hover:bg-background"
                  aria-label="Próxima imagem"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {totalImages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {event.imagens.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? "bg-primary w-6" : "bg-border w-2"
                  }`}
                  aria-label={`Ir para imagem ${index + 1}`}
                />
              ))}
            </div>
          )}
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
