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
    titulo: "Projeto Missionário da JUBAM",
    data: "16",
    mes: "JAN",
    imagem: "/images/evento01.jpg",
    link: "#",
    description:
      "Participe do projeto missionário anual da JUBAM. Um tempo de serviço, aprendizado e transformação de vidas em comunidades carentes. Inscrições abertas!",
    location: "Igreja Batista Central",
  },
  {
    titulo: "Culto Salt",
    data: "30",
    mes: "JAN",
    imagem: "/images/culto-start.png",
    link: "#",
    description:
      "Venha viver o primeiro culto da SALT do ano, um momento especial de celebração com a posse dos novos líderes da juventude.",
    location: "Primeira Igreja Batista em Lagoa Santa",
  },
];
