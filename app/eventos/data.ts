export type Evento = {
  titulo: string;
  data: string;
  mes: string;
  imagem?: string;
  link?: string;
  description: string;
  location?: string;
};

export const eventos: Evento[] = [
  {
    titulo: "Culto Salt",
    data: "31",
    mes: "JAN",
    imagem: "/images/culto-start.png",
    link: "#",
    description:
      "Venha viver o primeiro culto da SALT do ano, um momento especial de celebração com a posse dos novos líderes da juventude.",
    location: "Primeira Igreja Batista em Lagoa Santa",
  }
];
