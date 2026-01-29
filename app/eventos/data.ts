export type Evento = {
  id: string;
  titulo: string;
  description: string;

  /** ISO com timezone (ex: 2026-01-31T19:30:00-03:00) */
  dateISO: string;

  imagem?: string;
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
    id: "culto-salt-2026-01-31",
    titulo: "Culto Salt",
    description:
      "Venha viver o primeiro culto da SALT do ano, um momento especial de celebração com a posse dos novos líderes da juventude.",
    dateISO: "2026-01-31T19:30:00-03:00",
    imagem: "/images/culto-start.png",
    tags: ["Culto", "Juventude", "Comunhão"],
    locationName: "PIB Lagoa Santa",
    address:
      "R. Jair Gonçalves Bastos, 64 - Jardim Ipê, Lagoa Santa - MG, 33239-800",
    mapsUrl:
      "https://www.google.com/maps?q=Primeira+Igreja+Batista+em+Lagoa+Santa,+MG",
  },
];
