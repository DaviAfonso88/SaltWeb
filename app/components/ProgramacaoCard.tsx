import Image from "next/image";
import BotaoPrimario from "./BotaoPrimario";
import { Programacao } from "../sobre/programacoesData";
import { Calendar, Clock } from "lucide-react";

type ProgramacaoCardProps = {
  programacao: Programacao;
  align: "left" | "right";
};

export default function ProgramacaoCard({
  programacao,
  align,
}: ProgramacaoCardProps) {
  const { titulo, descricao, data, horario, imagem, linkBotao, textoBotao } =
    programacao;

  const isLeftAligned = align === "left";

  return (
    <div
      className={`grid md:grid-cols-2 gap-16 items-center animate-fade-in group`}
    >
      <div
        className={`relative h-96 rounded-lg overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 border border-primary/20 hover:border-transparent ${
          isLeftAligned ? "md:order-2" : "md:order-1"
        }`}
      >
        <Image
          src={imagem}
          alt={titulo}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={` ${isLeftAligned ? "md:order-1" : "md:order-2"}`}>
        <h3 className="text-4xl font-bold font-heading text-foreground mb-4">
          {titulo}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {descricao}
        </p>
        <div className="flex flex-col space-y-3 mb-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{data}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-5 w-5 text-primary" />
            <span>{horario}</span>
          </div>
        </div>
        <BotaoPrimario
          href={linkBotao}
          target="_blank"
          rel="noopener noreferrer"
          variant="default"
        >
          {textoBotao}
        </BotaoPrimario>
      </div>
    </div>
  );
}
