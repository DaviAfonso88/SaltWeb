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
    id: "festa-na-roca-2026",
    titulo: "Festa na Roça",
    description:
      "Vem aí a Festa na Roça da SALT! Um momento especial com muito louvor, alegria e deliciosos quitutes típicos! Capriche no traje caipira e venha viver essa festa com a gente!",
    dateISO: "2026-05-16T17:00:00-03:00",
    imagens: ["/images/roça.png"],
    tags: ["Festa", "Sítio", "Roça"],
    locationName: "Rua Condessa Hermany, 116. (Condados da Lagoa)",
    mapsUrl: "https://maps.app.goo.gl/W6XNBTcZj6bLFEXC6",
    link: "/festa-na-roca",
    linkLabel: "Fazer Inscrição",
  },
];
