import { Feather, Users, HeartHandshake } from "lucide-react";

export default function Pillars() {
  return (
    <section className="py-24 bg-zinc-900 animate-fade-in">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-16">
          Nossos Pilares
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
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
              className="rounded-lg border border-primary/20 bg-gradient-to-br from-[#27272a] via-[#2e2e32] to-[#18181b] p-8 transition-all duration-300 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 hover:scale-105"
            >
              {item.icon}
              <h3 className="text-2xl font-bold font-heading text-foreground mt-6">
                {item.titulo}
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {item.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
