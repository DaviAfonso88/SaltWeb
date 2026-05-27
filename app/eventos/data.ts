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
    id: "projeto-missionario-2026-06-12",
    titulo: "Projeto Missionário SALT",
    description:
      "Três dias de imersão missionária! Participe do Projeto Missionário SALT de 12 a 14 de junho. Inscreva-se para tempo integral (dormindo na igreja) ou em períodos avulsos. Haverá camisa oficial do evento por R$ 30.",
    dateISO: "2026-06-12T19:00:00-03:00",
    imagens: ["/images/orla.jpeg"],
    tags: ["Missão", "Juventude", "Evangelismo"],
    locationName: "PIBLS - Lagoa Santa",
    address: "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa",
    mapsUrl: "https://maps.app.goo.gl/SpDiWpb2GXunqsKj9",
    link: "/projeto-missionario",
    linkLabel: "Fazer inscrição",
  },
  {
    id: "debate-namoro-2026-05-299",
    titulo: "1 pastor x 30 ovelhas",
    description:
      "No dia 29/05 às 19h30, teremos o evento “1 Pastor X 30 Ovelhas”, um bate-papo aberto e sincero sobre o que Deus diz sobre namoro e noivado. Será um momento para tirar dúvidas, ouvir conselhos bílicos, aprender sobre relacionamentos saudáveis e entender como viver um namoro alinhado aos princípios de Deus. Tudo isso em um ambiente leve, descontraído e cheio de aprendizado.",
    dateISO: "2026-05-29T19:30:00-03:00",
    imagens: ["/images/ovelhas.png"],
    tags: ["Debate", "Namoro", "Noivado"],
    locationName: "PIBLS - Lagoa Santa",
    address: "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa",
    mapsUrl: "https://maps.app.goo.gl/SpDiWpb2GXunqsKj9",
  },
];
