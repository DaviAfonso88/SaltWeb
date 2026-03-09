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
    id: "oficinas-salt-2026-03-21",
    titulo: "Amostra de Profissões",
    description:
      "Escolha as áreas de interesse das quais você gostaria de participar. Essas escolhas vão nos ajudar a organizar e realizar o evento conforme a demanda.",
    dateISO: "2026-03-21T14:30:00-03:00",
    imagens: ["/images/oficinas.jpeg"],
    tags: ["Capacitação", "Carreira", "Vocação"],
    locationName: "Primeira Igreja Batista em Lagoa Santa",
    mapsUrl: " https://maps.app.goo.gl/QisTRYmCbFcCe5Zy5",
    link: "/oficinas-salt",
    linkLabel: "Formulário",
  },
];
