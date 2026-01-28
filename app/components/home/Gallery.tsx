import SectionLabel from "../SectionLabel";

export default function Gallery() {
  return (
    <section className="section-spacing bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
      <div className="container-elegant relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <SectionLabel>
            Momentos
          </SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Nossa Juventude em <span className="text-gradient">Ação</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[
            { src: "/images/invasão.jpeg", alt: "Invasão" },
            { src: "/images/acampamento.jpeg", alt: "Acampamento" },
            { src: "/images/orla.jpeg", alt: "Projeto Missiónario" },
            { src: "/images/avalanche.jpg", alt: "Avalanche" },
            { src: "/images/pescador.jpeg", alt: "Pescador" },
            { src: "/images/turma-de-minas.jpeg", alt: "Turma de Minas" },
          ].map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl aspect-square border border-border/30 shadow-lg hover:shadow-glow hover:shadow-primary/10 transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex items-end justify-start p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-foreground text-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {img.alt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
