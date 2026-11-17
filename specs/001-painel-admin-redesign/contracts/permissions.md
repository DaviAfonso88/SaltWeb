# Contrato: Permissões e papéis padrão

Lista fixa definida em `lib/auth/permissions.ts`. Papéis guardam um subconjunto dela.

| Permissão | Libera |
|---|---|
| `usuarios.gerenciar` | Usuários e papéis (criar, editar, desativar, excluir, redefinir senha). Define "administrador". |
| `auditoria.ver` | Histórico de auditoria |
| `eventos.gerenciar` | Criar, editar, publicar, arquivar e excluir eventos; parâmetros do formulário |
| `devocionais.gerenciar` | CRUD e publicação de devocionais |
| `inscricoes.ver` | Listar, buscar e abrir inscrições |
| `inscricoes.gerenciar` | Mudar status, registrar pagamento/parcelas, excluir inscrição |
| `inscricoes.exportar` | Exportar inscrições (CSV/PDF) |
| `mensagens.ver` | Listar e abrir mensagens (abrir marca como lida) |
| `mensagens.gerenciar` | Marcar lida/não lida, arquivar, excluir |
| `participantes.ver` | Lista, detalhe (sem saúde) e painel do acampamento (sem nomes de saúde) |
| `participantes.editar` | Criar/editar participante, responsáveis, contato de emergência; gerar a partir de inscrições |
| `participantes.importar` | Importar planilhas |
| `participantes.mesclar` | Mesclar cadastros repetidos |
| `participantes.excluir` | Excluir participante e exclusão em lote do evento |
| `participantes.exportar` | Exportar lista de participantes |
| `participantes.observacoes` | Registrar observações |
| `participantes.saude.ver` | Ver ficha de saúde e indicadores nominais de saúde; inclui saúde nas exportações |
| `participantes.saude.editar` | Editar ficha de saúde (exige também `participantes.saude.ver`) |

## Papéis padrão (seed, `is_system = true`)

| Papel | Permissões |
|---|---|
| Administrador | todas (não editável, não excluível) |
| Editor de conteúdo | `eventos.gerenciar`, `devocionais.gerenciar` |
| Equipe de inscrições | `inscricoes.ver`, `inscricoes.gerenciar`, `inscricoes.exportar` |
| Atendimento | `mensagens.ver`, `mensagens.gerenciar` |
| Equipe de saúde | `participantes.ver`, `participantes.editar`, `participantes.observacoes`, `participantes.exportar`, `participantes.saude.ver`, `participantes.saude.editar` |
| Liderança | `participantes.ver`, `participantes.observacoes`, `participantes.saude.ver` |
| Recepção | `participantes.ver` |

Os papéis padrão (exceto Administrador) podem ser editados; papéis com usuários não podem ser
excluídos.

## Mapa de áreas do painel

| Área (`/painel/...`) | Visível com |
|---|---|
| Visão geral | qualquer usuário logado (cartões filtrados por permissão) |
| `inscricoes` | `inscricoes.ver` |
| `eventos` | `eventos.gerenciar` |
| `participantes` | `participantes.ver` |
| `devocionais` | `devocionais.gerenciar` |
| `mensagens` | `mensagens.ver` |
| `usuarios`, `papeis` | `usuarios.gerenciar` |
| `auditoria` | `auditoria.ver` |
| `conta` (trocar senha) | qualquer usuário logado |
