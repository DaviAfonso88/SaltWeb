export type Workshop = {
  id: string;
  name: string;
  category: "Saúde" | "Segurança" | "Mercado" | "Vocacional";
};

export const workshops: Workshop[] = [
  // Saúde
  { id: "psique", name: "Psique", category: "Saúde" },
  { id: "odontologia", name: "Odontologia", category: "Saúde" },
  { id: "enfermagem", name: "Enfermagem", category: "Saúde" },
  { id: "medicina", name: "Medicina", category: "Saúde" },
  { id: "fisioterapia", name: "Fisioterapia", category: "Saúde" },

  // Segurança
  { id: "militar", name: "Militar", category: "Segurança" },
  { id: "policial-militar", name: "Policial Militar", category: "Segurança" },
  { id: "policial-civil", name: "Policial Civil", category: "Segurança" },
  { id: "bombeiros", name: "Bombeiros", category: "Segurança" },

  // Mercado
  { id: "exatas", name: "Exatas", category: "Mercado" },
  { id: "empreendedorismo", name: "Empreendedorismo", category: "Mercado" },
  { id: "direito", name: "Direito", category: "Mercado" },
  { id: "concursos", name: "Concursos", category: "Mercado" },
  { id: "administracao", name: "Administração", category: "Mercado" },
  {
    id: "marketing",
    name: "Social Media / Design Gráfico / Marketing",
    category: "Mercado",
  },
  {
    id: "Tecnologia-da-informacao",
    name: "Tecnologia da Informação",
    category: "Mercado",
  },

  // Vocacional
  { id: "pedagogia", name: "Pedagogia", category: "Vocacional" },
  { id: "missionaria", name: "Missionário", category: "Vocacional" },
  { id: "profissao-lar", name: "Profissão do Lar", category: "Vocacional" },
  { id: "musico", name: "Músico", category: "Vocacional" },
];

export const categories = [
  "Saúde",
  "Segurança",
  "Mercado",
  "Vocacional",
] as const;
