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
    link: "https://xa3mbjun.forms.app/interesse-primeiro-lote-acampa-salt",
    linkLabel: "Primeiro Lote",
  },
  {
    id: "culto-jubac-2026-02-28",
    titulo: "Culto JUBAC",
    description:
      "Teremos um tempo especial de crescimento e também uma noite abençoada para toda a juventude!🕒 15h: Treinamento para Líderes Um momento de alinhamento, visão e capacitação. 🔥 19h: Culto JUBAC (para toda a juventude!) Louvor, palavra e uma noite que vai marcar sua vida!",
    dateISO: "2026-02-28T19:00:00-03:00",
    imagens: ["/images/1.png", "/images/2.png"],
    tags: ["Culto", "Treinamento"],
    locationName: "av. Alphonsus Guimarães, 415. (pompeia, belo horizonte)",
    mapsUrl: "https://maps.app.goo.gl/3bSTwuhNfbiBxffZ6",
  },
  {
    id: "oficinas-salt-2026-03-21",
    titulo: "Oficinas SALT",
    description:
      "Venha aprender e se desenvolver com profissionais de diversas áreas em nossas oficinas exclusivas. Uma oportunidade única de mentoria e aprendizado prático em um ambiente cristão.",
    dateISO: "2026-03-21T09:00:00-03:00",
    imagens: ["/images/culto-salt.jpg"],
    tags: ["Capacitação", "Carreira", "Vocação"],
    locationName: "Primeira Igreja Batista em Lagoa Santa",
    link: "/oficinas-salt",
    linkLabel: "Inscrever-se",
  },
];
