export default function Gallery() {
  return (
    <section className="py-24 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 animate-fade-in">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-center text-foreground mb-16">
          Nossa Juventude em Ação
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { src: "/images/invasão.jpeg", alt: "Invasão" },
            { src: "/images/acampamento.jpeg", alt: "Acampamento" },
            { src: "/images/orla.jpeg", alt: "Projeto Missiónario" },
            { src: "/images/avalanche.jpg", alt: "Avalanche" },
            { src: "/images/pescador.jpeg", alt: "Pescador" },
            { src: "/images/turma-de-minas.jpeg", alt: "Turma de Minas" },
            ,
          ].map((img, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-lg aspect-square"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent flex items-end justify-start p-6">
                <span className="text-foreground text-lg font-semibold transform-gpu transition-transform duration-500 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
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
