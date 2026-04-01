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
    linkLabel: "Fazer inscricao",
  },
  {
    id: "culto-salt-2026-04-03",
    titulo: "Culto Salt",
    description:
      "Crises de fé fazem parte da caminhada, mas não definem o nosso fim. Neste culto, vamos entender como Deus usa até os momentos difíceis para fortalecer nossa fé.",
    dateISO: "2026-04-03T19:30:00-03:00",
    imagens: ["/images/culto-salt-abril.png"],
    tags: ["Culto", "Juventude"],
    locationName: "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa",
    mapsUrl: "https://maps.app.goo.gl/DDxiX65jtCC47ETF7",
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
];
