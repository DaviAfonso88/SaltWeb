import BotaoPrimario from "../BotaoPrimario";

export default function About() {
  return (
    <section className="py-24 bg-gradient-to-r from-[#92348c]/10 via-[#18181b] to-[#18181b] animate-fade-in">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <span className="inline-block mb-4 text-sm font-semibold tracking-widest text-primary uppercase">
            Quem somos
          </span>

          <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground">
            Juventude Salt
          </h2>

          <p className="mt-8 text-muted-foreground leading-relaxed">
            A <span className="font-semibold text-primary">Juventude Salt</span>{" "}
            é o movimento jovem da Primeira Igreja Batista em Lagoa Santa.
            Inspirados por <span className="font-medium">Mateus 5.13-14</span> e{" "}
            <span className="font-medium">1 João 1.5-7</span>, vivemos para ser
            sal e luz em nossa geração.
          </p>

          <p className="mt-6 text-muted-foreground leading-relaxed">
            Nosso propósito é{" "}
            <span className="font-semibold text-primary">
              glorificar a Deus, servir a igreja, amar pessoas e formar
              discípulos
            </span>
            , refletindo a luz de Cristo em tudo o que fazemos.
          </p>

          <div className="mt-10">
            <BotaoPrimario href="/sobre" variant="outline">
              Conheça nossa história
            </BotaoPrimario>
          </div>
        </div>
        <div className="rounded-2xl h-96 w-full p-1 border border-border shadow-lg">
          <img
            src="/images/salt-home.jpg"
            alt="Juventude Salt"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
