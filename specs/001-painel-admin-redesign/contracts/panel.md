# Contrato: Painel administrativo (`/painel`)

Toda Server Action e Route Handler abaixo começa com `requirePermission(...)`
(`lib/auth/guard.ts`), que: lê o cookie, carrega sessão + usuário + papel, rejeita sessão expirada
ou usuário inativo, exige troca de senha pendente (redireciona para `/painel/conta/senha`), checa a
permissão e registra `auth.forbidden` na auditoria quando falha. Retorno padrão das actions:

```ts
type ActionResult<T = void> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]>; conflict?: boolean };
```

`conflict: true` indica versão desatualizada (edição concorrente).

## Autenticação (`app/painel/(auth)`)

| Ação | Permissão | Regras |
|---|---|---|
| `setupFirstAdmin(codigo, nome, email, senha)` | nenhuma | só se `users` vazio e `codigo` = `SETUP_TOKEN` do ambiente (comparação em tempo constante; FR-007); cria Administrador ativo, sem troca obrigatória |
| `login(email, senha)` | nenhuma | rate limit e bloqueio (FR-004); mensagem genérica; audita falha |
| `logout()` | sessão | apaga a sessão |
| `changePassword(atual, nova)` | sessão | nova ≥ 8; limpa `must_change_password`; encerra outras sessões |

## Usuários e papéis

| Ação | Permissão |
|---|---|
| `createUser`, `updateUser`, `setUserActive`, `deleteUser`, `resetUserPassword` | `usuarios.gerenciar` |
| `createRole`, `updateRole`, `deleteRole` | `usuarios.gerenciar` |

Regras: FR-012 (último administrador ativo), papel Administrador imutável, papel com usuários não
excluível, desativar/excluir apaga sessões, `resetUserPassword` gera senha provisória exibida uma
única vez.

## Eventos

| Ação | Permissão |
|---|---|
| `saveEvent(form, version)` (cria/edita, inclusive imagem e `form_config`) | `eventos.gerenciar` |
| `setEventPublication(id, publication)` | `eventos.gerenciar` |
| `setRegistrationOpen(id, open)` | `eventos.gerenciar` |
| `deleteEvent(id)` | `eventos.gerenciar` (só sem inscrições/participantes) |

Após mutação: `expireTag('eventos')`.

## Inscrições

| Ação / Rota | Permissão |
|---|---|
| Página `/painel/inscricoes?evento=&status=&q=&page=` | `inscricoes.ver` |
| `setRegistrationStatus(id, status)` | `inscricoes.gerenciar` |
| `setInstallmentPaid(id, indice, pago)` | `inscricoes.gerenciar` |
| `deleteRegistration(id)` | `inscricoes.gerenciar` |
| `GET /api/painel/inscricoes/export?evento=&status=&q=&format=csv\|pdf` | `inscricoes.exportar` |

## Participantes

| Ação / Rota | Permissão |
|---|---|
| Páginas `/painel/participantes?evento=...`, `/painel/participantes/[id]` | `participantes.ver` (+ saúde se `participantes.saude.ver`, auditado) |
| `createParticipant`, `updateParticipant(form, version)`, guardiões, contato de emergência | `participantes.editar` |
| `generateParticipantsFromRegistrations(eventId)` | `participantes.editar` |
| `updateParticipantHealth(id, form)` | `participantes.saude.editar` |
| `addParticipantNote(id, texto)` | `participantes.observacoes` |
| `previewImport(eventId, headers, rows, mapping?)` → `{ mapping, novos, atualizacoes, revisao }` | `participantes.importar` |
| `commitImport(eventId, payload)` | `participantes.importar` |
| `mergeParticipants(principalId, outroId)` | `participantes.mesclar` |
| `deleteParticipant(id)`, `deleteAllParticipants(eventId, nomeDigitado)` | `participantes.excluir` |
| `GET /api/painel/participantes/export?evento=&...&format=csv\|pdf` | `participantes.exportar` |

Limites: importação até 2.000 linhas por envio; `deleteAllParticipants` exige o título exato do
evento.

## Devocionais

| Ação | Permissão |
|---|---|
| `saveDevotional(form, version)`, `setDevotionalPublished(id, published)`, `deleteDevotional(id)` | `devocionais.gerenciar` |

Após mutação: `expireTag('devocionais')`.

## Mensagens

| Ação | Permissão |
|---|---|
| Página `/painel/mensagens?tipo=&status=` e detalhe (marca lida) | `mensagens.ver` |
| `setMessageStatus(id, status)`, `deleteMessage(id)` | `mensagens.gerenciar` |

## Auditoria

| Rota | Permissão |
|---|---|
| Página `/painel/auditoria?acao=&usuario=&page=` | `auditoria.ver` |
