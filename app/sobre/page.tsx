"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Smartphone, Quote, Play } from "lucide-react";
import ServirForm from "../components/ServirForm";
import SectionLabel from "../components/SectionLabel";
import PageHeader from "../components/PageHeader";
import { programacoes } from "./programacoesData";
import ProgramacaoCard from "../components/ProgramacaoCard";
import ValueCard from "../components/ValueCard";
import BotaoPrimario from "../components/BotaoPrimario";
import Image from "next/image";

function HistoriaSection() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-24 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div 
            ref={leftRef}
            className={`transition-all duration-1000 ${
              leftVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
            }`}
          >
            <SectionLabel withMargin={false}>Nossa História</SectionLabel>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 text-foreground">
              De Onde <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Viemos</span>
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed relative">
                <span className="relative z-10">
                  A Juventude Salt nasceu do desejo de criar um ambiente onde
                  jovens pudessem se conectar com Deus de forma autêntica e
                  relevante. Somos o ministério jovem da Primeira Igreja Batista
                  em Lagoa Santa, uma comunidade que nos acolhe e impulsiona.
                </span>
              </p>
              <p className="leading-relaxed relative">
                <span className="relative z-10">
                  Nossa jornada é marcada por amizades, crescimento e serviço.
                  Acreditamos que cada jovem tem um papel fundamental no Reino de
                  Deus e buscamos equipá-los para viverem seu propósito.
                </span>
              </p>
            </div>
          </div>

          <div 
            ref={rightRef}
            className={`relative h-96 transition-all duration-1000 delay-300 ${
              rightVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
            }`}
          >
            <div className="relative group h-full w-full rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
              <Image
                src="/images/turma-de-minas2.jpeg"
                alt="Juventude Salt"
                fill
                className="object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValoresSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });

  const valores = [
    {
      icon: "Heart",
      title: "Amamos a Deus",
      description: "O verdadeiro discipulado de Jesus cumpre o maior mandamento, que resume toda a Lei de Moisés. Em primeiro lugar, amar a Deus e, consequentemente, ao próximo. Isso ocorre quando buscamos adorar, obedecer e confiar em Deus.",
    },
    {
      icon: "Handshake",
      title: "Servimos à Igreja",
      description: "Quando recebemos o Senhor como Salvador, o próprio Espírito confirma ao nosso espírito que somos filhos de Deus (Rm 8.16). Dessa forma, passamos não apenas a amá-lo, mas somos capacitados pelo próprio Espírito Santo para servi-lo.",
    },
    {
      icon: "Lightbulb",
      title: "Discipulamos Pessoas",
      description: "Cumprir o IDE é evangelizar e batizar novos discípulos, mas não para por aí. Cabe a todo seguidor de Jesus, enquanto peregrino na terra, caminhar ao lado de outros discípulos, como Jesus fez no caminho de Emaús, e ensinar toda a Escritura.",
      initialChars: 100,
    },
  ];

  return (
    <section className="py-24 bg-card/20 bg-gradient-to-b from-card via-background to-card relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-20 right-10 w-24 h-24 border border-primary/10 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

      <div className="container mx-auto px-6 text-center relative z-10">
        <div 
          ref={headerRef}
          className={`mb-16 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <SectionLabel>Nossos Valores</SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading">
            Declaração de <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Propósitos</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {valores.map((valor, i) => (
            <ValueCard
              key={valor.title}
              icon={valor.icon}
              title={valor.title}
              description={valor.description}
              initialChars={valor.initialChars}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PodcastSection() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-24 bg-gradient-to-t from-primary/10 to-background relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div 
            ref={leftRef}
            className={`order-2 md:order-1 transition-all duration-1000 ${
              leftVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"
            }`}
          >
            <SectionLabel withMargin={false}>Ouça Agora</SectionLabel>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 text-foreground">
              Podcast <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Salt Talks</span>
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                O Salt Talks é um espaço de conversa, aprendizado e aprofundamento bíblico. A partir das aulas da nossa Escola Bíblica, exploramos temas teológicos de forma clara e prática, ajudando alunos e ouvintes a pensarem a fé cristã com mais profundidade e propósito.
              </p>
              <p className="leading-relaxed">
                Um podcast para quem deseja ir além do raso e viver uma fé bem fundamentada.
              </p>
            </div>
            <div className="mt-8">
              <BotaoPrimario
                href="/podcast"
                className="inline-flex items-center px-6 py-3 hover-lift"
              >
                <Play className="w-5 h-5 mr-2" />
                Ouvir Agora
              </BotaoPrimario>
            </div>
          </div>

          <div 
            ref={rightRef}
            className={`order-1 md:order-2 relative w-full max-w-sm h-80 mx-auto transition-all duration-1000 delay-300 ${
              rightVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
            }`}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-border/50">
              <Image
                src="/images/salt-talks.png"
                alt="Arte do Podcast Salt Talks"
                fill
                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PastorSection() {
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: imageRef, isVisible: imageVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-24 bg-gradient-to-br from-card via-background to-card relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div 
            ref={imageRef}
            className={`w-full md:w-1/3 flex justify-center transition-all duration-1000 ${
              imageVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full blur-xl" />
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden bg-card flex items-center justify-center border-4 border-border shadow-lg group">
                <Image
                  src="/images/pastor.jpeg"
                  alt="Pastor da Juventude"
                  width={320}
                  height={320}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div 
            ref={contentRef}
            className={`w-full md:w-2/3 text-center md:text-left transition-all duration-1000 delay-300 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
            }`}
          >
            <SectionLabel withMargin={false}>Liderança</SectionLabel>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4 text-foreground">
              Pastor da <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Juventude</span>
            </h2>
            <p className="text-3xl font-semibold text-primary mb-4">
              Davi Franco
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6 max-w-2xl">
              Pastor Davi Franco dedica sua vida a guiar e inspirar os jovens
              da Juventud

e Salt. Com paixão pelo discipulado e um coração
              voltado para o serviço, ele lidera com sabedoria, promovendo um
              ambiente de fé, crescimento e comunhão. Sua visão é ver cada
              jovem florescer em seu propósito, impactando o mundo ao seu
              redor com os valores do Reino.
            </p>
            <BotaoPrimario
              href="https://wa.me/553192919718?text=Olá%20Pastor%20Davi,%20gostaria%20de%20conversar%20com%20você."
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift"
            >
              <Smartphone size={20} className="mr-2" />
              Fale com o Pastor
            </BotaoPrimario>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramacoesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-24 bg-card/20 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <SectionLabel>Agenda</SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Nossas <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Programações</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontros fixos para você se conectar, crescer e servir com a galera.
          </p>
        </div>

        <div className="space-y-20">
          {programacoes.map((programacao, index) => (
            <ProgramacaoCard
              key={programacao.titulo}
              programacao={programacao}
              align={index % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Sobre() {
  return (
    <div className="bg-background text-foreground">
      <PageHeader
        title="Sobre Nós"
        subtitle="Conheça a trajetória e os valores que movem a Juventude Salt."
      />
      <HistoriaSection />
      <ValoresSection />
      <PodcastSection />
      <PastorSection />
      <ProgramacoesSection />
      <ServirForm />
    </div>
  );
}