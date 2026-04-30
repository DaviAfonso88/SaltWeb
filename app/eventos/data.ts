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
  /* {
    id: "festa-na-roca-2026",
    titulo: "Festa na Roça",
    description:
      "Venha aproveitar um dia de muita curtição no sítio com muito forró, quadrilha, comida boa e a melhor companyia! Traga sua família e amigos. Cada participante contribui com um alimento ou valor simbólico de R$ 30.",
    dateISO: "2026-06-13T10:00:00-03:00",
    tags: ["Festa", "Sítio", "Forró"],
    locationName: "Sítio em Lagoa Santa",
    link: "/festa-na-roca",
    linkLabel: "Quero participar",
  }, */
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
];
