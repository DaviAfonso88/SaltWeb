import { ArrowRight } from "lucide-react";
import type { Evento } from "../eventos/data";

type CardEventoProps = Evento & {
  onViewDetails: (event: Evento) => void;
};

export default function CardEvento({
  titulo,
  data,
  mes,
  imagem,
  link,
  description,
  location,
  onViewDetails,
}: CardEventoProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card transition-all duration-300 hover:bg-card/70 flex flex-col">
      {imagem && (
        <div className="h-48 w-full overflow-hidden flex-shrink-0">
          <img
            src={imagem}
            alt={titulo}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="mr-4 text-center flex-shrink-0">
            <div className="text-3xl font-bold text-primary">{data}</div>
            <div className="text-sm font-semibold text-muted-foreground">
              {mes}
            </div>
          </div>
          <h3 className="text-xl font-bold font-heading text-foreground text-left flex-grow">
            {titulo}
          </h3>
        </div>
        <button
          onClick={() =>
            onViewDetails({
              titulo,
              data,
              mes,
              imagem,
              link,
              description,
              location,
            })
          }
          className="mt-auto flex items-center self-start text-sm font-semibold text-primary hover:text-[#92348c] hover:cursor-pointer -light transition-colors duration-300"
        >
          Ver detalhes <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
