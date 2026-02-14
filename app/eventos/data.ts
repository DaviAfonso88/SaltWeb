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
    id: "culto-salt-2026-02-06",
    titulo: "Congresso de Carnaval",
    description:
      "Enquanto o mundo corre atrás de tudo no carnaval, nós escolhemos correr para a presença de Deus! No dia 14, a partir das 14h, a Juventude SALT te convida para um congresso especial, cheio de propósito, louvor e uma palavra que vai marcar sua vida. Teremos a presença do Pastor Vitão, trazendo uma mensagem poderosa e transformadora, e a Banda Savior, conduzindo um tempo intenso de louvor e adoração 🎶🔥.",
    dateISO: "2026-02-14T14:00:00-03:00",
    imagens: ["/images/1.png", "/images/2.png", "/images/3.png"],
    tags: ["Congresso", "Juventude", "Avivamento"],
    locationName: "PIB Lagoa Santa",
    address:
      "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa - MG, 33239-800",
    mapsUrl:
      "https://www.google.com/maps?q=Primeira+Igreja+Batista+em+Lagoa+Santa,+MG",
  },
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
];
