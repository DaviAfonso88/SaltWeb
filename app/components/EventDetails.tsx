"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CalendarDays, ExternalLink, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Evento } from "@/app/(site)/eventos/data";
import { Badge } from "@/components/ui/badge";

type EventDetailsProps = {
  event: Evento;
};

const Spinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function EventDetails({ event }: EventDetailsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const images = event.imagens ?? [];
  const totalImages = images.length;
  const activeImage = images[activeIndex];
  const isExternalEventLink = !!event.link && /^https?:\/\//.test(event.link);

  const handleImageLoading = (url: string, done: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [url]: !done }));
  };

  const goToIndex = (index: number) => {
    if (totalImages === 0) return;
    const nextIndex = (index + totalImages) % totalImages;
    setActiveIndex(nextIndex);
  };

  const handleTouchStart = (eventTouch: React.TouchEvent) => {
    touchStartX.current = eventTouch.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (eventTouch: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = eventTouch.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    const swipeThreshold = 40;
    if (Math.abs(delta) < swipeThreshold) return;
    if (delta < 0) {
      goToIndex(activeIndex + 1);
    } else {
      goToIndex(activeIndex - 1);
    }
  };

  const dateText = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(event.dateISO));
  const timeText = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(event.dateISO));

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <div className="space-y-4">
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-background/50"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative h-[35vh] sm:h-[45vh] lg:h-[50vh]">
              {activeImage && loadingStates[activeImage] !== false && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                  <Spinner />
                </div>
              )}
              {activeImage && (
                <Image
                  src={activeImage}
                  alt={`${event.titulo} - Imagem ${activeIndex + 1}`}
                  fill
                  sizes="(min-width: 1024px) 70vw, (min-width: 640px) 85vw, 100vw"
                  className={`object-cover transition-opacity duration-500 ${
                    loadingStates[activeImage] !== false ? "opacity-0" : "opacity-100"
                  }`}
                  onLoadingComplete={() => handleImageLoading(activeImage, true)}
                  onLoad={() => handleImageLoading(activeImage, false)}
                  onError={() => handleImageLoading(activeImage, true)}
                  priority
                />
              )}
            </div>

            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-lg backdrop-blur hover:bg-background/100 transition-colors"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToIndex(activeIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-lg backdrop-blur hover:bg-background/100 transition-colors"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {totalImages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? "bg-primary w-8" : "bg-border w-2 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Ir para imagem ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {event.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1 rounded-full text-xs font-medium">
              {tag}
            </Badge>
          ))}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          {event.titulo}
        </h2>

        <div className="rounded-xl bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3 text-foreground/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium capitalize">{dateText}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-foreground/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-medium">{timeText}</p>
            </div>
          </div>
          {(event.locationName || event.address) && (
            <div className="flex items-center gap-3 text-foreground/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium">{event.locationName}</p>
                {event.address && <p className="text-sm text-muted-foreground">{event.address}</p>}
              </div>
            </div>
          )}
        </div>

        <p className="text-foreground/80 leading-relaxed">
          {event.description}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          {event.mapsUrl && (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl border border-border/50 text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-300"
            >
              <MapPin className="h-4 w-4" />
              Ver no Maps
            </a>
          )}
          {event.link && (
            <a
              href={event.link}
              target={isExternalEventLink ? "_blank" : undefined}
              rel={isExternalEventLink ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-primary text-black hover:bg-primary/90 hover:shadow-lg transition-all duration-300"
            >
              <ExternalLink className="h-4 w-4" />
              {event.linkLabel ?? "Saiba mais"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}