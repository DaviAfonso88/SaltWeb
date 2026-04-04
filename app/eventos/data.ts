export type Evento = {
  id: string;
  titulo: string;
  description: string;

  /** ISO com timezone (ex: 2026-01-31T19:30:00-03:00) */
  dateISO: string;

  imagens?: string[];
  tags?: string[];

  /** Local (nome curto) */
  locationName?: string;
  /** Endereço completo */
  address?: string;
  /** Link do Google Maps (ou similar) */
  mapsUrl?: string;

  /** CTA principal (inscrição/info) */
  link?: string;
  linkLabel?: string;
};

export const eventos: Evento[] = [
  {
    id: "acampa-salt-2026-07-17",
    titulo: "Acampa Salt 2026",
    description:
      "O primeiro lote do Acampa SALT está disponível com valor promocional de R$ 285 para inscrições em fevereiro. Importante: este link é apenas para registrarmos o seu interesse em adquirir o primeiro lote — não se trata da compra ou confirmação da inscrição. Entraremos em contato posteriormente com as orientações para pagamento e confirmação.",
    dateISO: "2026-07-17T14:00:00-03:00",
    imagens: ["/images/acampa.jpeg"],
    tags: ["Acampamento", "Juventude"],
    locationName:
      "Gomes de Rezende - R. Raimundo, R. Cel. Ovídio Guerra, 97, Lagoa Santa - MG, 33400-000",
    mapsUrl: " https://maps.app.goo.gl/jAwkbUvKQGb1GqfK7",
    link: "/acampa-salt",
    linkLabel: "Fazer inscrição",
  },
  {
    id: "cantata-pascoa-2026-04-05",
    titulo: "Cantata de Páscoa",
    description:
      "Uma dia especial para celebrar a esperança e o amor revelados na cruz. Na cantata de Páscoa, vamos relembrar o sacrifício e a vitória de Jesus por nós.",
    dateISO: "2026-04-05T10:00:00-03:00",
    imagens: ["/images/cantata-de-pascoa.png"],
    tags: ["Cantata", "Páscoa"],
    locationName: "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa",
    mapsUrl: "https://maps.app.goo.gl/DDxiX65jtCC47ETF7",
  },
  {
    id: "vertice-2026-05-01",
    titulo: "Conjubam",
    description:
      "Estamos criando o grupo dos jovens interessados em ir no CONJUBAM. Lembrando que esse evento tem como público alvo, os jovens e adolescentes com mais de 16 anos. Será na cidade de Montes Claros, 1 à 3 de Maio. Inscrição com hospedagem e alimentação - 230 reais + Transporte (a parte).",
    dateISO: "2026-05-01T10:00:00-03:00",
    imagens: ["/images/vertice.jpeg"],
    tags: ["Conjubam", "Vertice"],
    locationName: "Cidade de Montes Claros",
  },
  {
    id: "avalanche-2026-04-10",
    titulo: "Projeto Avalanche",
    description:
      "As inscrições para o Projeto Avalanche estão abertas! Serão 3 dias levando a Palavra, servindo pessoas e impactando vidas com o amor de Deus, de forma intencional.",
    dateISO: "2026-04-10T10:00:00-03:00",
    imagens: ["/images/avalanche.jpeg"],
    tags: ["Avalanche", "Projeto"],
    locationName: "Igreja Batista Nova Jerusalém - Rua Jerusalém 247, Glória",
    mapsUrl: "https://maps.app.goo.gl/zmsyv3AMrGQzvHQV9",
    link: "https://www.e-inscricao.com/jubac-mg/projetoavalanche26",
    linkLabel: "Fazer inscrição",
  },
];
