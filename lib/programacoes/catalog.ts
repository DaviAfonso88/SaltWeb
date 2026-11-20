import { NTH_FIFTH, type Schedule } from "./schedule";

/**
 * Programações fixas. Texto, imagem e link ficam aqui; dia e horário vêm do banco
 * (painel → Configurações) e, enquanto ninguém alterou, valem os padrões abaixo.
 */
type Comum = {
  slug: string;
  titulo: string;
  padrao: Schedule;
  /** Sem dia e horário únicos (ex.: células por bairro): o site sempre mostra o `padrao` e o painel não edita. */
  semAgenda?: true;
};

/** Encontros fora das sextas (células): cartão com foto em /sobre. */
export type EncontroInfo = Comum & {
  grupo: "encontros";
  descricao: string;
  imagem: string;
  linkBotao: string;
  textoBotao: string;
};

/** Ritmo das sextas (Planejamento SALT 2026, p. 14): cada sexta do mês tem um encontro diferente. */
export type SextaInfo = Comum & { grupo: "sextas" };

export type ProgramacaoInfo = EncontroInfo | SextaInfo;

/** Células divididas por bairro: cada uma tem o próprio dia e horário, então o site não afirma nenhum. */
const porBairro: Schedule = { kind: "personalizada", weekday: 5, nth: 1, time: null, customDay: "Em vários bairros", customTime: "Dia e horário variam" };
const sexta = (nth: number, time: string): Schedule => ({ kind: "mensal", weekday: 5, nth, time, customDay: "", customTime: "" });

/** Apresentação do ritmo das sextas no site (home, /sobre, /eventos, /visitante e rodapé). */
export const SEXTAS = {
  titulo: "Sextas SALT",
  descricao: "Toda sexta tem SALT, e cada semana do mês tem um encontro diferente.",
  imagem: "/images/sextas-salt.jpg",
  imagemAlt: "Jovens da SALT sorrindo, cobertos de tinta, numa quadra ao pôr do sol",
};

export const PROGRAMACOES: ProgramacaoInfo[] = [
  // Ritmo das sextas, na ordem do mês. O horário das novas segue o do Culto SALT até alguém ajustar no painel.
  { grupo: "sextas", slug: "culto-salt", titulo: "Culto SALT", padrao: sexta(1, "19:45") },
  { grupo: "sextas", slug: "esportes-salt", titulo: "Esportes SALT", padrao: sexta(2, "19:45") },
  { grupo: "sextas", slug: "missoes-salt", titulo: "Missões SALT", padrao: sexta(3, "19:45") },
  { grupo: "sextas", slug: "semana-discipulado", titulo: "Semana do Discipulado", padrao: sexta(4, "19:45") },
  { grupo: "sextas", slug: "encontrao-salt", titulo: "Encontrão SALT", padrao: sexta(NTH_FIFTH, "19:45") },
  {
    grupo: "encontros",
    slug: "celula-jovens",
    titulo: "Células de Jovens",
    descricao:
      "Encontros nos lares, em vários bairros, para comunhão, estudo da Bíblia e oração. Um ambiente para crescer em amizade e fé.",
    imagem: "/images/celula-jovens.jpeg",
    linkBotao: "/visitante",
    textoBotao: "Encontre uma célula perto de você",
    padrao: porBairro,
    semAgenda: true,
  },
  {
    grupo: "encontros",
    slug: "celula-adolescentes",
    titulo: "Células de Adolescentes",
    descricao:
      "Uma galera animada que se reúne para aprender sobre Jesus, fazer amigos e se divertir de um jeito saudável.",
    imagem: "/images/celula-adolescentes.webp",
    linkBotao: "/visitante",
    textoBotao: "Encontre uma célula perto de você",
    padrao: porBairro,
    semAgenda: true,
  },
];

export const PROGRAMACAO_SLUGS = PROGRAMACOES.map((p) => p.slug);

/** Discipulado (um a um, combinado com cada pessoa): não é um encontro com horário, só um cartão em /sobre. */
export const DISCIPULADO = {
  slug: "discipulado",
  titulo: "Discipulado",
  descricao: "Caminhada individual e intencional para o crescimento espiritual. Um a um, ombro a ombro, mais perto de Jesus.",
  imagem: "/images/discipulado-abraco.jpg",
  linkBotao: "https://linktr.ee/Discipulado_Salt",
  textoBotao: "Quero ser discipulado",
};
