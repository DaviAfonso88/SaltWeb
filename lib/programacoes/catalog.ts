import type { Schedule } from "./schedule";

/**
 * Programações fixas. Texto, imagem e link ficam aqui; dia e horário vêm do banco
 * (painel → Configurações) e, enquanto ninguém alterou, valem os padrões abaixo.
 */
export type ProgramacaoInfo = {
  slug: string;
  titulo: string;
  descricao: string;
  imagem: string;
  linkBotao: string;
  textoBotao: string;
  padrao: Schedule;
};

const semanal = (weekday: number, time: string): Schedule => ({ kind: "semanal", weekday, nth: 1, time, customDay: "", customTime: "" });

export const PROGRAMACOES: ProgramacaoInfo[] = [
  {
    slug: "celula-jovens",
    titulo: "Células de Jovens",
    descricao:
      "Encontros semanais nos lares para comunhão, estudo da Bíblia e oração. Um ambiente para crescer em amizade e fé.",
    imagem: "/images/celula-jovens.jpeg",
    linkBotao: "#",
    textoBotao: "Encontre uma célula",
    padrao: semanal(5, "19:30"),
  },
  {
    slug: "celula-adolescentes",
    titulo: "Células de Adolescentes",
    descricao:
      "Uma galera animada que se reúne para aprender sobre Jesus, fazer amigos e se divertir de um jeito saudável.",
    imagem: "/images/celula-adolescentes.webp",
    linkBotao: "#",
    textoBotao: "Encontre uma célula",
    padrao: semanal(5, "19:30"),
  },
  {
    slug: "discipulado",
    titulo: "Discipulado",
    descricao:
      "Caminhada individual e intencional para o crescimento espiritual. Um a um, ombro a ombro, mais perto de Jesus.",
    imagem: "/images/discipulado.webp",
    linkBotao: "https://linktr.ee/Discipulado_Salt",
    textoBotao: "Quero ser discipulado",
    padrao: { kind: "personalizada", weekday: 5, nth: 1, time: null, customDay: "A combinar", customTime: "Horário flexível" },
  },
  {
    slug: "culto-salt",
    titulo: "Culto SALT",
    descricao:
      "O ponto de encontro de toda a juventude. Uma noite com louvor vibrante, palavra relevante e muita comunhão.",
    imagem: "/images/culto-salt.jpg",
    linkBotao: "/eventos",
    textoBotao: "Veja os próximos",
    padrao: { kind: "mensal", weekday: 5, nth: 1, time: "19:45", customDay: "", customTime: "" },
  },
];

export const PROGRAMACAO_SLUGS = PROGRAMACOES.map((p) => p.slug);
