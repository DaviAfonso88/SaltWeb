export type Workshop = {
  id: string;
  name: string;
  instructor: string;
  category: "Saúde" | "Segurança" | "Mercado" | "Vocacional";
};

export const workshops: Workshop[] = [
  // Saúde
  { id: "psique", name: "Psique", instructor: "Larissa", category: "Saúde" },
  { id: "odontologia", name: "Odontologia", instructor: "Paola", category: "Saúde" },
  { id: "enfermagem", name: "Enfermagem", instructor: "Osileia", category: "Saúde" },
  { id: "medicina", name: "Medicina", instructor: "Paola", category: "Saúde" },
  
  // Segurança
  { id: "militar", name: "Militar", instructor: "Paulo", category: "Segurança" },
  { id: "policial-militar", name: "Policial Militar", instructor: "Reynaldo", category: "Segurança" },
  { id: "policial-civil", name: "Policial Civil", instructor: "Almir", category: "Segurança" },
  { id: "bombeiros", name: "Bombeiros", instructor: "Pedro", category: "Segurança" },
  
  // Mercado
  { id: "exatas", name: "Exatas", instructor: "Lucas Samaniego", category: "Mercado" },
  { id: "empreendedorismo", name: "Empreendedorismo", instructor: "Josué", category: "Mercado" },
  { id: "direito", name: "Direito", instructor: "Ellen", category: "Mercado" },
  { id: "concursos", name: "Concursos", instructor: "Simone", category: "Mercado" },
  { id: "administracao", name: "Administração", instructor: "Luciana", category: "Mercado" },
  { id: "marketing", name: "Social Media / Design Gráfico / Marketing", instructor: "Mateus e Carol", category: "Mercado" },
  { id: "programacao", name: "Programação", instructor: "Davi Afonso", category: "Mercado" },
  
  // Vocacional
  { id: "pedagogia", name: "Pedagogia", instructor: "Nilcimar ou Andréa", category: "Vocacional" },
  { id: "missionaria", name: "Missionária", instructor: "Elen do Radical", category: "Vocacional" },
  { id: "profissao-lar", name: "Profissão do Lar", instructor: "Eliane", category: "Vocacional" },
  { id: "musico", name: "Músico", instructor: "Heber", category: "Vocacional" },
  { id: "esporte", name: "Esporte", instructor: "André", category: "Vocacional" },
];

export const categories = ["Saúde", "Segurança", "Mercado", "Vocacional"] as const;
