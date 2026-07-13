import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
import type { Evento } from "@/app/(site)/eventos/data";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    month: "long",
    year: "numeric",
  }).format(eventDate);

  const timeText = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(eventDate);

  const isUpcoming = eventDate > new Date();

  return (
    <Card className="group relative overflow-hidden rounded-2xl bg-card/60 border border-border/30 transition-all duration-500 hover:border-primary/40 hover:shadow-glow hover:shadow-primary/10 flex flex-col">
      {imagens && imagens.length > 0 && (
        <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
          <Image
            src={imagens[0]}
            alt={titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
          {isUpcoming && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500/90 text-white hover:bg-green-500/80 backdrop-blur-sm flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Em breve
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-bold font-heading text-foreground text-left">
          {titulo}
        </CardTitle>
        <div className="flex flex-col gap-2 text-sm text-foreground/70 pt-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>
              {dateText} • {timeText}
            </span>
          </div>
          {(locationName || address) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="line-clamp-1">{locationName ?? address}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={`${id}-${tag}`}
                variant="secondary"
                className="px-3 py-1 rounded-full text-xs font-semibold"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">
          {description}
        </p>
      </CardContent>
      <CardFooter>
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
          className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light hover:cursor-pointer transition-colors duration-300 group/btn"
        >
          Ver detalhes 
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </button>
      </CardFooter>
    </Card>
  );
}
