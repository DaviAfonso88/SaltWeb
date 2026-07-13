"use client";

import Image from "next/image";
import BotaoPrimario from "./BotaoPrimario";
import { Programacao } from "@/app/(site)/sobre/programacoesData";
import { Calendar, Clock } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
  const { ref: cardRef, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={cardRef}
      className={`grid md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div
        className={`relative h-96 rounded-2xl overflow-hidden transition-all duration-500 group hover:shadow-2xl hover:shadow-primary/20 border border-border/50 hover:border-primary/30 hover-lift hover-glow ${
          isLeftAligned ? "md:order-2" : "md:order-1"
        }`}
      >
        <Image
          src={imagem}
          alt={titulo}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className={` ${isLeftAligned ? "md:order-1" : "md:order-2"}`}>
        <h3 className="text-4xl font-bold font-heading text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
          {titulo}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {descricao}
        </p>
        <div className="flex flex-col space-y-3 mb-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span>{data}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <span>{horario}</span>
          </div>
        </div>
        <BotaoPrimario
          href={linkBotao}
          target="_blank"
          rel="noopener noreferrer"
          variant="default"
          className="hover-lift"
        >
          {textoBotao}
        </BotaoPrimario>
      </div>
    </div>
  );
}