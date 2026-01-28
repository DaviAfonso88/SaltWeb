import { Feather, Users, HeartHandshake } from "lucide-react";

export default function Pillars() {
  return (
    <section className="section-spacing bg-gradient-to-b from-card via-background to-card relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="container-elegant text-center relative z-10">
        <div className="mb-20 animate-fade-in-up">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase mb-4">
            Fundamentos
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Nossos <span className="text-gradient">Pilares</span>
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: (
                <Feather
                  className="h-10 w-10 mx-auto text-[#92348c]
"
                />
              ),
              titulo: "Fé",
              texto:
                "Vivemos uma fé viva, bíblica e relevante, firmados na Palavra.",
            },
            {
              icon: <Users className="h-10 w-10 mx-auto text-[#92348c]" />,
              titulo: "Comunidade",
              texto:
                "Construímos relacionamentos saudáveis e cuidamos uns dos outros.",
            },
            {
              icon: (
                <HeartHandshake className="h-10 w-10 mx-auto text-[#92348c]" />
              ),
              titulo: "Missão",
              texto:
                "Servimos com excelência, impactando vidas dentro e fora da igreja.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-glow hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="inline-flex p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold font-heading text-foreground mt-6 mb-4">
                  {item.titulo}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {item.texto}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
