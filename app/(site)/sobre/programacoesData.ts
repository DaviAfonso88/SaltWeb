export type Programacao = {
  titulo: string;
  descricao: string;
  data: string;
  horario: string;
  imagem: string;
  linkBotao: string;
  textoBotao: string;
};

export const programacoes: Programacao[] = [
  {
    titulo: "Células de Jovens",
    descricao:
      "Encontros semanais nos lares para comunhão, estudo da Bíblia e oração. Um ambiente para crescer em amizade e fé.",
    data: "Todas as sextas-feiras",
    horario: "19:30",
    imagem: "/images/celula-jovens.jpeg",
    linkBotao: "#",
    textoBotao: "Encontre uma célula",
  },
  {
    titulo: "Células de Adolescentes",
    descricao:
      "Uma galera animada que se reúne para aprender sobre Jesus, fazer amigos e se divertir de um jeito saudável.",
    data: "Todas as sextas-feiras",
    horario: "19:30",
    imagem: "/images/celula-adolescentes.webp",
    linkBotao: "#",
    textoBotao: "Encontre uma célula",
  },
  {
    titulo: "Discipulado",
    descricao:
      "Caminhada individual e intencional para o crescimento espiritual. Um a um, ombro a ombro, mais perto de Jesus.",
    data: "A combinar",
    horario: "Flexível",
    imagem: "/images/discipulado.webp",
    linkBotao: "https://linktr.ee/Discipulado_Salt",
    textoBotao: "Quero ser discipulado",
  },
  {
    titulo: "Culto SALT",
    descricao:
      "O ponto de encontro de toda a juventude. Uma noite com louvor vibrante, palavra relevante e muita comunhão.",
    data: "Toda 1º sexta do mês",
    horario: "19:45",
    imagem: "/images/culto-salt.jpg",
    linkBotao: "/eventos",
    textoBotao: "Veja os próximos",
  },
];
