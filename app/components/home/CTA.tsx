import BotaoPrimario from "../BotaoPrimario";

export default function CTA() {
  return (
    <section className="py-24 bg-primary/10 text-center animate-fade-in">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold font-heading text-foreground">
          Venha caminhar com a gente
        </h2>
        <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
          Se você busca crescer na fé, criar amizades verdadeiras e viver algo
          maior, a Juventude Salt é o seu lugar.
        </p>
        <div className="mt-10">
          <BotaoPrimario href="/contribua">Quero participar</BotaoPrimario>
        </div>
      </div>
    </section>
  );
}
