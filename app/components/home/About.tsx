import BotaoPrimario from "../BotaoPrimario";
import SectionLabel from "../SectionLabel";

export default function About() {
  return (
    <section className="section-spacing bg-gradient-to-br from-background via-card/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-20"></div>
      <div className="container-elegant grid md:grid-cols-2 gap-16 items-center relative z-10">
        <div className="text-center md:text-left space-y-6 animate-fade-in-up">
          <SectionLabel withMargin={false}>
            Quem somos
          </SectionLabel>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Juventude <span className="text-gradient">Salt</span>
          </h2>

          <div className="space-y-4 text-foreground/70">
            <p className="leading-relaxed">
              A <span className="font-semibold text-primary">Juventude Salt</span>{" "}
              é o movimento jovem da Primeira Igreja Batista em Lagoa Santa.
              Inspirados por <span className="font-medium text-foreground">Mateus 5.13-14</span> e{" "}
              <span className="font-medium text-foreground">1 João 1.5-7</span>, vivemos para ser
              sal e luz em nossa geração.
            </p>

            <p className="leading-relaxed">
              Nosso propósito é{" "}
              <span className="font-semibold text-primary">
                glorificar a Deus, servir a igreja, amar pessoas e formar
                discípulos
              </span>
              , refletindo a luz de Cristo em tudo o que fazemos.
            </p>
          </div>

          <div className="pt-4">
            <BotaoPrimario href="/sobre" variant="outline">
              Conheça nossa história
            </BotaoPrimario>
          </div>
        </div>
        <div className="relative group animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            <img
              src="/images/salt-home.jpg"
              alt="Juventude Salt"
              className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
