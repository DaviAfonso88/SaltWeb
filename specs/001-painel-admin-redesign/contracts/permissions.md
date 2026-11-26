# Contrato: Permissões e papéis padrão

Lista fixa definida em `lib/auth/permissions.ts`. Papéis guardam um subconjunto dela.

| Permissão | Libera |
|---|---|
| `usuarios.gerenciar` | Usuários e papéis (criar, editar, desativar, excluir, redefinir senha). Define "administrador". |
| `auditoria.ver` | Histórico de auditoria |
| `eventos.gerenciar` | Criar, editar, publicar, arquivar e excluir eventos; parâmetros do formulário |
| `devocionais.gerenciar` | CRUD e publicação de devocionais |
| `inscricoes.ver` | Listar, buscar e abrir inscrições |
| `inscricoes.gerenciar` | Criar e editar inscrições (Festa), mudar status, registrar pagamento/parcelas, excluir inscrição |
| `inscricoes.exportar` | Exportar inscrições (CSV/PDF) |
| `estoque.ver` | Estoque das confraternizações: itens, quanto resta e nome de quem pegou (sem telefone, pagamento ou ficha) |
| `estoque.contatos` | No estoque, ver telefones e enviar lembrete por WhatsApp (complementa `estoque.ver`) |
| `gastos.ver` | Gastos dos eventos, com total arrecadado, a receber e saldo (sem dados das inscrições) |
| `gastos.gerenciar` | Lançar e excluir gastos (complementa `gastos.ver`) |
| `mensagens.ver` | Listar e abrir mensagens (abrir marca como lida) |
| `mensagens.gerenciar` | Marcar lida/não lida, arquivar, excluir |
| `visitantes.ver` | Listar e abrir visitantes cadastrados em `/visitante` |
| `visitantes.gerenciar` | Marcar contatado/novo, arquivar, excluir visitante |
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
| Consulta de estoque | `estoque.ver` |
| Equipe de estoque | `estoque.ver`, `estoque.contatos` |
| Equipe de gastos | `gastos.ver`, `gastos.gerenciar` |
| Atendimento | `mensagens.ver`, `mensagens.gerenciar` |
| Acolhimento | `visitantes.ver`, `visitantes.gerenciar` |
| Equipe de saúde | `participantes.ver`, `participantes.editar`, `participantes.observacoes`, `participantes.exportar`, `participantes.saude.ver`, `participantes.saude.editar` |
| Liderança | `participantes.ver`, `participantes.observacoes`, `participantes.saude.ver` |
| Recepção | `participantes.ver` |

Os papéis padrão (exceto Administrador) podem ser editados; papéis com usuários não podem ser
excluídos.

## Mapa de áreas do painel

| Área (`/painel/...`) | Visível com |
|---|---|
| Dashboard (`/painel`) | qualquer usuário logado (cada bloco filtrado por permissão; próximas sextas aparecem para todos) |
| `inscricoes` | `inscricoes.ver` |
| `estoque` | `estoque.ver` ou `inscricoes.ver` (esta mostra também telefones, pagamentos e fichas) |
| `gastos` | `gastos.ver` |
| `eventos` | `eventos.gerenciar` |
| `participantes` | `participantes.ver` |
| `devocionais` | `devocionais.gerenciar` |
| `mensagens` | `mensagens.ver` |
| `visitantes` | `visitantes.ver` |
| `usuarios`, `papeis` | `usuarios.gerenciar` |
| `auditoria` | `auditoria.ver` |
| `conta` (trocar senha) | qualquer usuário logado |
