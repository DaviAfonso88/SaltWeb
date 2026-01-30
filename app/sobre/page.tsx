import ProgramacaoCard from "../components/ProgramacaoCard";
import ValueCard from "../components/ValueCard";
import BotaoPrimario from "../components/BotaoPrimario";
import { programacoes } from "./programacoesData";
import { Smartphone } from "lucide-react";
import ServirForm from "../components/ServirForm";

export default function Sobre() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="py-24 text-center bg-gradient-to-b from-[#18181b] via-[#1f1f23] to-[#27272a]">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold font-heading text-foreground animate-fade-in">
            Sobre Nós
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Conheça a trajetória e os valores que movem a Juventude Salt.
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-24 bg-gradient-to-b from-[#27272a] via-[#1f1f23] to-[#18181b]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold font-heading mb-6 text-foreground">
                De Onde Viemos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Juventude Salt nasceu do desejo de criar um ambiente onde
                jovens pudessem se conectar com Deus de forma autêntica e
                relevante. Somos o ministério jovem da Primeira Igreja Batista
                em Lagoa Santa, uma comunidade que nos acolhe e impulsiona.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nossa jornada é marcada por amizades, crescimento e serviço.
                Acreditamos que cada jovem tem um papel fundamental no Reino de
                Deus e buscamos equipá-los para viverem seu propósito.
              </p>
            </div>
            <div className="rounded-2xl h-96 w-full p-1 border border-border shadow-lg">
              <img
                src="/images/turma-de-minas2.jpeg"
                alt="Juventude Salt"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-card/20 bg-zinc-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold font-heading mb-12">
            O nosso Porquê
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon="Lightbulb"
              title="O que queremos"
              description="Glorificar a Deus, servir a igreja, amar as pessoas, fazer discípulos, pregar o verdadeiro evangelho e transformar as pessoas."
            />
            <ValueCard
              icon="Handshake"
              title="Como?"
              description="Cultuando, servindo, pertencendo, cuidando, ensinando e transformando."
            />
            <ValueCard
              icon="Heart"
              title="O quê?"
              description="Por meio da adoração no culto, pelo servir a igreja, através da comunhão uns com os outros, mediante ao discipulado que imite a Cristo, fazendo o uso do evangelho e de ações que refletem a luz de Deus no mundo."
              initialChars={100}
            />
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-t from-sky-900/10 to-zinc-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text on the left */}
            <div>
              <h2 className="text-4xl font-bold font-heading mb-6 text-foreground">
                Podcast Salt Talks
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                O Salt Talks é um espaço de conversa, aprendizado e
                aprofundamento bíblico. A partir das aulas da nossa Escola
                Bíblica, exploramos temas teológicos de forma clara e prática,
                ajudando alunos e ouvintes a pensarem a fé cristã com mais
                profundidade e propósito.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Um podcast para quem deseja ir além do raso e viver uma fé bem
                fundamentada.
              </p>
              <BotaoPrimario
                href="/podcast"
                className="inline-flex items-center px-6 py-3"
              >
                Ouvir Agora
              </BotaoPrimario>
            </div>
            {/* Image on the right */}
            <div className="flex justify-center items-center">
              <img
                src="/images/salt-talks.png"
                alt="Arte do Podcast Salt Talks"
                className="rounded-2xl shadow-lg max-w-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Youth Pastor Section */}
      <section className="py-24 bg-gradient-to-br from-[#27272a] via-[#2e2e32] to-[#18181b]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 bg-card p-8 md:p-12 rounded-lg shadow-xl">
            <div className="w-full md:w-1/3 flex justify-center md:justify-start">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border-4 border-primary shadow-lg">
                <img
                  src="/images/pastor.jpeg"
                  alt="Pastor da Juventude"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Pastor's Info */}
            <div className="w-full md:w-2/3 text-center md:text-left">
              <h2 className="text-4xl font-bold font-heading mb-4 text-foreground">
                Pastor da Juventude
              </h2>
              <p className="text-3xl font-semibold text-primary mb-4">
                Davi Franco
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                Pastor Davi Franco dedica sua vida a guiar e inspirar os jovens
                da Juventude Salt. Com paixão pelo discipulado e um coração
                voltado para o serviço, ele lidera com sabedoria, promovendo um
                ambiente de fé, crescimento e comunhão. Sua visão é ver cada
                jovem florescer em seu propósito, impactando o mundo ao seu
                redor com os valores do Reino.
              </p>
              <BotaoPrimario
                href="https://wa.me/553192919718?text=Olá%20Pastor%20Davi,%20gostaria%20de%20conversar%20com%20você."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition duration-300 transform hover:scale-105 shadow-lg"
              >
                <Smartphone size={20} className="mr-2" />
                Fale com o Pastor
              </BotaoPrimario>
            </div>
          </div>
        </div>
      </section>

      {/* Programações */}
      <section className="py-24 bg-card/20 bg-gradient-to-br from-[#18181b] via-[#92348c]/10 to-[#18181b]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-heading text-foreground">
              Nossas Programações
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontros fixos para você se conectar, crescer e servir com a
              gente.
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

      {/* Servir Form Section */}
      <ServirForm />
    </div>
  );
}
