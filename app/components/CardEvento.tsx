import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { Evento } from "../eventos/data";

type CardEventoProps = Evento & {
  onViewDetails: (event: Evento) => void;
};

export default function CardEvento({
  id,
  titulo,
  imagens,
  description,
  dateISO,
  tags,
  locationName,
  address,
  mapsUrl,
  link,
  linkLabel,
  onViewDetails,
}: CardEventoProps) {
  const eventDate = new Date(dateISO);
  const dateText = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(eventDate);

  const timeText = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(eventDate);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card/60 border border-border/30 transition-all duration-500 hover:border-primary/40 hover:shadow-glow hover:shadow-primary/10 flex flex-col">
      {imagens && imagens.length > 0 && (
        <div className="relative h-52 w-full overflow-hidden flex-shrink-0">
          <Image
            src={imagens[0]}
            alt={titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-bold font-heading text-foreground text-left">
            {titulo}
          </h3>

          <div className="flex flex-col gap-2 text-sm text-foreground/70">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span>
                {dateText} • {timeText}
              </span>
            </div>
            {(locationName || address) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="line-clamp-1">
                  {locationName ?? address}
                </span>
              </div>
            )}
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={`${id}-${tag}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
        <button
          onClick={() =>
            onViewDetails({
              id,
              titulo,
              imagens,
              description,
              dateISO,
              tags,
              locationName,
              address,
              mapsUrl,
              link,
              linkLabel,
            })
          }
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light hover:cursor-pointer transition-colors duration-300"
        >
          Ver detalhes <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
