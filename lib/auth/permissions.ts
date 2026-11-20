/** Lista fixa de permissões (specs/001-painel-admin-redesign/contracts/permissions.md). */
export const PERMISSIONS = [
  "usuarios.gerenciar",
  "auditoria.ver",
  "eventos.gerenciar",
  "devocionais.gerenciar",
  "inscricoes.ver",
  "inscricoes.gerenciar",
  "inscricoes.exportar",
  "mensagens.ver",
  "mensagens.gerenciar",
  "visitantes.ver",
  "visitantes.gerenciar",
  "participantes.ver",
  "participantes.editar",
  "participantes.importar",
  "participantes.mesclar",
  "participantes.excluir",
  "participantes.exportar",
  "participantes.observacoes",
  "participantes.saude.ver",
  "participantes.saude.editar",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ADMIN_PERMISSION: Permission = "usuarios.gerenciar";

export const PERMISSION_LABELS: Record<Permission, string> = {
  "usuarios.gerenciar": "Gerenciar usuários e papéis",
  "auditoria.ver": "Ver histórico de auditoria",
  "eventos.gerenciar": "Criar e editar eventos",
  "devocionais.gerenciar": "Gerenciar devocionais",
  "inscricoes.ver": "Ver inscrições",
  "inscricoes.gerenciar": "Alterar status, pagamentos e excluir inscrições",
  "inscricoes.exportar": "Exportar inscrições",
  "mensagens.ver": "Ver mensagens",
  "mensagens.gerenciar": "Arquivar e excluir mensagens",
  "visitantes.ver": "Ver visitantes cadastrados pelo site",
  "visitantes.gerenciar": "Marcar contato, arquivar e excluir visitantes",
  "participantes.ver": "Ver participantes (sem dados de saúde)",
  "participantes.editar": "Criar e editar participantes",
  "participantes.importar": "Importar planilhas de participantes",
  "participantes.mesclar": "Mesclar cadastros repetidos",
  "participantes.excluir": "Excluir participantes",
  "participantes.exportar": "Exportar participantes",
  "participantes.observacoes": "Registrar observações",
  "participantes.saude.ver": "Ver fichas de saúde",
  "participantes.saude.editar": "Editar fichas de saúde",
};

export const PERMISSION_GROUPS: { title: string; items: Permission[] }[] = [
  { title: "Acesso", items: ["usuarios.gerenciar", "auditoria.ver"] },
  { title: "Conteúdo", items: ["eventos.gerenciar", "devocionais.gerenciar"] },
  { title: "Inscrições", items: ["inscricoes.ver", "inscricoes.gerenciar", "inscricoes.exportar"] },
  { title: "Mensagens", items: ["mensagens.ver", "mensagens.gerenciar"] },
  { title: "Visitantes", items: ["visitantes.ver", "visitantes.gerenciar"] },
  {
    title: "Participantes do acampamento",
    items: [
      "participantes.ver",
      "participantes.editar",
      "participantes.importar",
      "participantes.mesclar",
      "participantes.excluir",
      "participantes.exportar",
      "participantes.observacoes",
    ],
  },
  { title: "Saúde (dado sensível)", items: ["participantes.saude.ver", "participantes.saude.editar"] },
];

export function isPermission(value: string): value is Permission {
  return (PERMISSIONS as readonly string[]).includes(value);
}

export const DEFAULT_ROLES: {
  name: string;
  description: string;
  permissions: Permission[];
}[] = [
  { name: "Administrador", description: "Acesso total ao painel.", permissions: [...PERMISSIONS] },
  {
    name: "Editor de conteúdo",
    description: "Gerencia eventos e devocionais.",
    permissions: ["eventos.gerenciar", "devocionais.gerenciar"],
  },
  {
    name: "Equipe de inscrições",
    description: "Acompanha, confirma e exporta inscrições.",
    permissions: ["inscricoes.ver", "inscricoes.gerenciar", "inscricoes.exportar"],
  },
  {
    name: "Atendimento",
    description: "Responde às mensagens recebidas pelo site.",
    permissions: ["mensagens.ver", "mensagens.gerenciar"],
  },
  {
    name: "Acolhimento",
    description: "Acompanha os visitantes cadastrados pelo site.",
    permissions: ["visitantes.ver", "visitantes.gerenciar"],
  },
  {
    name: "Equipe de saúde",
    description: "Mantém as fichas de saúde dos participantes.",
    permissions: [
      "participantes.ver",
      "participantes.editar",
      "participantes.observacoes",
      "participantes.exportar",
      "participantes.saude.ver",
      "participantes.saude.editar",
    ],
  },
  {
    name: "Liderança",
    description: "Consulta participantes e saúde e registra observações.",
    permissions: ["participantes.ver", "participantes.observacoes", "participantes.saude.ver"],
  },
  {
    name: "Recepção",
    description: "Consulta participantes sem dados de saúde.",
    permissions: ["participantes.ver"],
  },
];

export const ADMIN_ROLE_NAME = "Administrador";
