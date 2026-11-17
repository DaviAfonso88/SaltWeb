---

description: "Task list for 001-painel-admin-redesign"
---

# Tasks: Painel administrativo, segurança e redesign do site

**Input**: Design documents from `specs/001-painel-admin-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md,
design/ (canvas de referência + ASSETS.md)

**Tests**: não solicitados (constituição: sem framework de testes). Cada fase termina com
`npm run lint` + `npm run build` e o roteiro manual da história em `quickstart.md`.

**Organization**: tarefas agrupadas por história. US3 depende de US4 (eventos e modelos de
formulário) e por isso vem depois dela, apesar da mesma prioridade.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da spec (US1…US8)
- Caminhos relativos à raiz do repositório (projeto Next.js único, alias `@/*`)

## Convenções para todas as tarefas

- Toda Server Action começa com `'use server'`, chama `requirePermission(...)`
  (`lib/auth/guard.ts`), valida a entrada com Zod e devolve `ActionResult` (`lib/action-result.ts`).
- Toda página do painel (Server Component) chama `requirePermission(...)` antes de consultar dados.
- Toda exclusão, exportação ou mudança de status chama `logAudit(...)` (`lib/audit.ts`); mudanças de
  campo em inscrição/participante chamam `recordHistory(...)` (`lib/history.ts`).
- UI com componentes de `components/ui` (shadcn) e tokens do guia de estilo; textos em pt-BR;
  alvos ≥ 44 px; rótulo em todo campo.
- Datas formatadas com `lib/format.ts` (fuso America/Sao_Paulo); dinheiro em centavos.
- Consultar Context7 antes de usar APIs novas de Next 16, Drizzle ou shadcn.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências, banco, tokens visuais e utilitários compartilhados.

- [X] T001 Instalar dependências: `npm install` e `npm install drizzle-orm @neondatabase/serverless` e `npm install -D drizzle-kit tsx`; adicionar scripts `db:generate` (`drizzle-kit generate`), `db:migrate` (`drizzle-kit migrate`), `db:seed` (`tsx scripts/seed.ts`), `db:studio` (`drizzle-kit studio`) em package.json
- [X] T002 Criar drizzle.config.ts (dialect `postgresql`, schema `./lib/db/schema.ts`, out `./drizzle`, `dbCredentials.url` de `process.env.DATABASE_URL`)
- [X] T003 Criar lib/db/index.ts com cliente lazy: `getDb()` cria `Pool` (`@neondatabase/serverless`) + `drizzle({ client, schema })` na 1ª chamada e lança erro claro se `DATABASE_URL` faltar; exportar tipo `Db` e helper `withTransaction`
- [X] T004 Criar lib/db/schema.ts com todas as tabelas, enums, índices e relações de data-model.md (roles, users, sessions, audit_log, entity_history, events, event_images com customType `bytea`, registrations, participants, participant_guardians, participant_health, participant_notes, import_batches, import_mappings, devotionals, messages) e tipos inferidos (`$inferSelect`/`$inferInsert`)
- [X] T005 Gerar a migração inicial com `npm run db:generate` e conferir o SQL em drizzle/0000_*.sql (extensão `pgcrypto`/`gen_random_uuid`, índice único `(event_id, name_key, phone_key)`)
- [X] T006 [P] Criar lib/text.ts: `normalizeKey(text)` (minúsculas, sem acento, espaços simples), `phoneKey(text)` (só dígitos), `slugify(text)`, `onlyDigits`
- [X] T007 [P] Criar lib/format.ts: `formatDate`, `formatDateTime`, `formatMonth`, `formatCurrency(cents)`, `toSaoPauloInput(date)` e `fromSaoPauloInput(value)` (offset fixo −03:00), `todayInSaoPaulo()` (YYYY-MM-DD)
- [X] T008 [P] Criar lib/cache-tags.ts (`TAGS = { eventos: "eventos", devocionais: "devocionais" }` e `expireTag(tag)` = `revalidateTag(tag, { expire: 0 })`) e lib/action-result.ts (tipo `ActionResult<T>` e helpers `ok()`, `fail()`, `fromZodError()`)
- [X] T009 [P] Reescrever app/globals.css com os tokens do guia de estilo (design/Estilo.dc.html: papel #F6F5F2, branco, tinta #111114, texto2 #4A4A52, texto3 #6A6A72, linha #E3E1DC, roxo #92348C, roxo escuro #7A2B74, roxo claro #F3E9F2, sucesso #17602F/#E8F5EC, aviso #4D3A00/#FDF6E3) em `@theme`, mapear as variáveis do shadcn (`--background`, `--foreground`, `--primary`, `--border`, `--ring`, `--radius` etc.) para tema claro, utilitários `.eyebrow` e `.container-site` (1200 px, margem 16–40 px) e foco visível; ajustar tailwind.config.ts para não sobrescrever as cores novas
- [X] T010 [P] Atualizar app/layout.tsx: fontes `Inter` (corpo, `--font-sans`) e `Inter_Tight` (títulos, `--font-display`) via `next/font/google`, remover Poppins, `lang="pt-BR"`, metadata base ("Juventude SALT"), `<Toaster />` do sonner
- [X] T011 [P] Atualizar next.config.ts: `experimental.serverActions.bodySizeLimit: "6mb"`, `images.localPatterns` para `/images/**` e `/imagens/eventos/**`, `redirects()` permanentes `/acampa-salt` → `/eventos/acampa-salt-2026`, `/festa-na-roca` → `/eventos`, `/projeto-missionario` → `/eventos`
- [X] T012 [P] Adicionar componentes shadcn necessários com `npx shadcn@latest add radio-group switch sonner` (arquivos em components/ui/) e conferir que usam os tokens novos

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: autenticação, autorização, auditoria, casca do painel e seed. Nenhuma história começa
antes desta fase.

- [X] T013 Remover o legado de autenticação/admin que conflita com o novo login: middleware.ts, lib/auth/config.ts, lib/auth/session.ts (antigo), app/login/, app/setup/, app/admin-camp/, app/api/camp-admin/, components/admin/
- [X] T014 [P] Criar lib/auth/permissions.ts com a lista fixa de permissões (contracts/permissions.md) como `const` + tipo `Permission`, rótulos e grupos em pt-BR para a tela de papéis, `DEFAULT_ROLES` (nome, descrição, permissões) e `ADMIN_PERMISSION = "usuarios.gerenciar"`
- [X] T015 [P] Criar lib/auth/password.ts: `hashPassword` (bcryptjs custo 12), `verifyPassword`, `generateProvisionalPassword()` (12 caracteres legíveis, crypto), schema Zod `passwordSchema` (≥ 8)
- [X] T016 [P] Criar lib/auth/rate-limit.ts com limitadores Upstash: `loginByEmail` (5 falhas em 15 min; na 5ª grava a chave `salt:lock:login:<sha256 do e-mail>` com TTL de 15 min e `isLoginLocked(email)` consulta essa chave), `loginByIp` (20 em 15 min), `publicSubmit` (5/min por IP), `contactSubmit` (3/min por IP) e helper `getClientIp(headers)`; degradar com aviso no console se as variáveis do Upstash faltarem em desenvolvimento
- [X] T017 Criar lib/auth/session.ts: `createSession(userId, meta)` (token 32 bytes base64url, grava SHA-256 em `sessions`, cookie `salt-session` httpOnly/secure em produção/sameSite lax/7 dias), `getSessionUser()` (uma consulta: sessão + usuário + papel; rejeita expirada ou usuário inativo; atualiza `last_seen_at` no máx. a cada 5 min; memoizado com `cache()` do React), `destroySession()`, `destroyUserSessions(userId, exceptSessionId?)`
- [X] T018 Criar lib/audit.ts (`logAudit({ actor, action, entityType, entityId, summary, metadata })`, captura IP dos headers) e lib/history.ts (`recordHistory(tx, { entityType, entityId, changes: {field, old, new}[], actor })`, ignora campos sem mudança)
- [X] T019 Criar lib/auth/guard.ts: `getCurrentUser()`, `requireUser()` (sem sessão → redirect `/painel/login`; `must_change_password` → redirect `/painel/conta/senha`), `requirePermission(perm | perm[])` para páginas (sem permissão → `logAudit("auth.forbidden")` + redirect `/painel/sem-acesso`), `authorizeAction(perm)` para Server Actions (retorna usuário ou `ActionResult` de erro) e `authorizeRoute(request, perm)` para Route Handlers (401/403 JSON), `can(user, perm)`
- [X] T020 Criar proxy.ts (Next 16) exportando `proxy()`: para `/painel/:path*` (exceto `/painel/login` e `/painel/setup`) sem cookie `salt-session` → redirect para `/painel/login?from=`; para `/api/painel/:path*` sem cookie → 401 JSON; `config.matcher = ["/painel/:path*", "/api/painel/:path*"]`
- [X] T021 Criar lib/auth/actions.ts (`'use server'`): `login` (rate limit por e-mail e IP, mensagem genérica, audita falha e bloqueio, atualiza `last_login_at`), `logout`, `setupFirstAdmin` (só com `users` vazio e código igual a `process.env.SETUP_TOKEN` com `timingSafeEqual`; cria papéis padrão se faltarem e o Administrador ativo sem troca obrigatória), `changePassword` (confere a atual, ≥ 8, limpa `must_change_password`, encerra outras sessões)
- [X] T022 [P] Criar app/painel/(auth)/layout.tsx (tela centralizada com logo `public/images/salt-logo-ink.png`), app/painel/(auth)/login/page.tsx + components/painel/auth/LoginForm.tsx (client, `useActionState`) e app/painel/(auth)/setup/page.tsx + components/painel/auth/SetupForm.tsx (mostra "configuração já feita" quando há usuários)
- [X] T023 [P] Criar componentes base do painel em components/painel/: PageHeader.tsx (título, descrição, ações), SubmitButton.tsx (`useFormStatus`), ConfirmDialog.tsx (AlertDialog; opção de exigir digitar um texto), Pagination.tsx (links com searchParams), EmptyState.tsx, StatusBadge.tsx (variantes por status), FieldError.tsx, DataTable.tsx (tabela responsiva que vira lista de cartões < 640 px)
- [X] T024 Criar components/painel/Sidebar.tsx (itens do mapa de áreas de contracts/permissions.md filtrados por `can()`, contador de mensagens novas, nome do usuário, "Trocar senha" e "Sair"; versão móvel em `Sheet`) e app/painel/(app)/layout.tsx (chama `requireUser()`, renderiza Sidebar + conteúdo)
- [X] T025 Criar app/painel/(app)/page.tsx (visão geral com cartões por permissão: próximos eventos, inscrições pendentes, mensagens novas; espaço para o aviso de retenção da US8), app/painel/(app)/sem-acesso/page.tsx e app/painel/(app)/conta/senha/page.tsx + components/painel/auth/ChangePasswordForm.tsx
- [X] T026 Criar scripts/data/devocionais.json com os 24 devocionais atuais (baixar uma vez de `https://raw.githubusercontent.com/daviafonso88/juventudesalt-dados/main/devocional.json`) e scripts/seed.ts idempotente: papéis padrão (`DEFAULT_ROLES`, `is_system`), evento "Acampa SALT 2026" (slug `acampa-salt-2026`, dados de app/(site)/eventos/data.ts, imagem `public/images/acampa.jpeg` gravada em `event_images`, modelo `acampamento` com os 6 lotes de lib/acampa/constants.ts, descontos 15/5/10, carnê 6, publicado, inscrições fechadas) e os 24 devocionais publicados (mês de referência a partir do campo `mes`)

**Checkpoint**: `npm run lint` e `npm run build` passam; com banco configurado, `db:migrate` + `db:seed` + `/painel/setup` + login funcionam.

---

## Phase 3: User Story 1 - Áreas administrativas fechadas (Priority: P1) 🎯 MVP

**Goal**: nenhuma tela ou operação administrativa acessível sem login e permissão; telas e rotas
antigas abertas deixam de existir.

**Independent Test**: quickstart.md → US1 (anônimo é redirecionado; `/api/painel/*` → 401; rotas
antigas → 404; usuário sem permissão → "sem acesso" auditado).

- [X] T027 [US1] Remover as telas administrativas antigas sem proteção: app/admin-acampa-salt/, app/admin-festa-na-roca/, app/admin-projeto-missionario/
- [X] T028 [US1] Remover as rotas antigas de leitura/alteração sem proteção: app/api/acampa-salt/{list,status,installments}/, app/api/festa-na-roca/{list,status,delete}/, app/api/projeto-missionario/{list,status,delete}/ e as funções de listagem/alteração que só elas usavam em lib/acampa/storage.ts, lib/festa-roca/storage.ts, lib/projeto-missionario/storage.ts
- [X] T029 [US1] Revisar app/painel/(app)/sem-acesso/page.tsx e `requirePermission`/`authorizeAction`/`authorizeRoute` para garantir: mensagem clara, link para a visão geral, auditoria `auth.forbidden` com a permissão exigida, e nenhuma informação do recurso negado no corpo da resposta
- [X] T030 [US1] Varredura de proteção: listar todas as rotas em app/api/ e app/painel/ e confirmar (comentário no PR/quickstart) que cada uma é pública por contrato (contracts/public-api.md) ou chama o guard; corrigir as que faltarem

**Checkpoint**: lint + build; quickstart US1.

---

## Phase 4: User Story 2 - Gestão de usuários e permissões (Priority: P1)

**Goal**: administradores gerenciam usuários, papéis e consultam a auditoria.

**Independent Test**: quickstart.md → US2.

- [X] T031 [P] [US2] Criar lib/users/queries.ts: `listUsers()` (com papel), `getUser(id)`, `listRoles()` (com contagem de usuários), `getRole(id)`, `countActiveAdmins(excludeUserId?)` (usuários ativos cujo papel contém `usuarios.gerenciar`)
- [X] T032 [US2] Criar lib/users/actions.ts: `createUser` (senha provisória gerada, devolvida uma vez), `updateUser` (nome, e-mail, papel; regra do último admin ao trocar papel), `setUserActive` (inativar apaga sessões; regra do último admin), `deleteUser` (apaga sessões; não pode excluir a si mesmo; regra do último admin), `resetUserPassword` (nova provisória, `must_change_password`, apaga sessões) — todas com `authorizeAction("usuarios.gerenciar")`, Zod, auditoria e `revalidatePath("/painel/usuarios")`
- [X] T033 [US2] Criar lib/users/role-actions.ts: `createRole`, `updateRole` (Administrador `is_system` imutável; não remover `usuarios.gerenciar` se deixar o sistema sem admin), `deleteRole` (bloqueia com usuários) — com auditoria
- [X] T034 [P] [US2] Criar app/painel/(app)/usuarios/page.tsx (tabela: nome, e-mail, papel, situação, último acesso; ações) + components/painel/usuarios/UserFormDialog.tsx, components/painel/usuarios/ProvisionalPasswordDialog.tsx (mostra a senha uma vez com botão copiar) e components/painel/usuarios/UserRowActions.tsx
- [X] T035 [P] [US2] Criar app/painel/(app)/papeis/page.tsx + components/painel/papeis/RoleFormDialog.tsx (permissões em checkboxes agrupadas com rótulos de lib/auth/permissions.ts; papel de sistema marcado; Administrador somente leitura)
- [X] T036 [P] [US2] Criar lib/audit-queries.ts (`listAudit({ action, actorId, page })`, 50 por página) e app/painel/(app)/auditoria/page.tsx (filtros por ação e usuário, data/hora em Brasília, resumo, link para o registro quando existir)

**Checkpoint**: lint + build; quickstart US2.

---

## Phase 5: User Story 4 - Cadastro de eventos (Priority: P2)

**Goal**: editores gerenciam eventos e seus modelos de formulário; o site lê eventos do banco.

**Independent Test**: quickstart.md → US4 (rascunho invisível, publicação em ≤ 1 min, imagem
validada, troca de modelo bloqueada após 1ª inscrição, arquivar em vez de excluir).

- [X] T037 [P] [US4] Criar lib/forms/types.ts: interface `FormModelDefinition<Config, Answers>` com `id`, `label`, `configSchema`, `defaultConfig`, `answersSchema(config)`, `price(config, answers, today)` → `{ valorOriginalCentavos, valorFinalCentavos, lote?, parcelas[] } | null`, `columns(config)` (rótulo + extrator para lista/exportação), `requiresEmail`, `consumes?(answers)` (itens/vagas)
- [X] T038 [P] [US4] Criar lib/forms/acampamento.ts portando lib/acampa/schema.ts e lib/acampa/calc.ts para o modelo parametrizado (lote vigente por data limite em Brasília; desconto de dupla sobre o total sem acumular; Pix/dinheiro; carnê em N parcelas mensais a partir do mês do envio; crédito sem desconto) com valores em centavos
- [X] T039 [P] [US4] Criar lib/forms/festa.ts portando lib/festa-roca/types.ts (faixa etária, membro/convidado, observação "não consigo", contribuição em alimento ou valor fixo) com itens, quantidades, valor e vagas vindos do config; `consumes` devolve itens escolhidos ou a vaga de contribuição
- [X] T040 [P] [US4] Criar lib/forms/missao.ts (tempo integral e/ou períodos do config, ao menos um) e lib/forms/simples.ts (observação opcional)
- [X] T041 [US4] Criar lib/forms/registry.ts (`FORM_MODELS`, `getFormModel(id)`, `parseEventConfig(model, json)`) e lib/forms/availability.ts (`getFestaAvailability(tx, eventId, config)`: quantidade − inscrições pendentes/confirmadas que consumiram cada item/vaga)
- [X] T042 [P] [US4] Criar lib/events/images.ts (`validateImage(file)`: ≤ 5 MB e assinatura JPG/PNG/WebP pelos bytes iniciais; `storeImage(tx, file)`; `deleteImage(tx, id)`) e app/imagens/eventos/[id]/route.ts (GET bytes com `Content-Type` e `Cache-Control: public, max-age=31536000, immutable`; 404 se não existir)
- [X] T043 [US4] Criar lib/events/queries.ts: admin (`listEventsAdmin({ publication })`, `getEventAdmin(id)` com contagem de inscrições/participantes) e público com `unstable_cache` + tag `eventos` (`getUpcomingEvents()`, `getFeaturedEvent()`, `getPublicEventBySlug(slug)`), todos devolvendo objetos serializáveis com URL da imagem `/imagens/eventos/{id}`
- [X] T044 [US4] Criar lib/events/actions.ts: `saveEvent` (FormData com imagem opcional; Zod; slug único; datas de Brasília; `image_alt` obrigatório com imagem; `form_config` validado pelo modelo; modelo imutável após 1ª inscrição; versão otimista → `conflict`; ao marcar destaque desmarca os outros), `setEventPublication`, `setRegistrationOpen`, `deleteEvent` (só sem inscrições/participantes, senão sugere arquivar) — todas com `authorizeAction("eventos.gerenciar")`, auditoria e `expireTag(TAGS.eventos)`
- [X] T045 [P] [US4] Criar editores de parâmetros em components/painel/eventos/config/: AcampamentoConfigEditor.tsx (lotes com rótulo/valor/data limite, adicionar/remover, descontos %, parcelas, crédito), FestaConfigEditor.tsx (itens com nome/categoria/quantidade, valor e vagas), MissaoConfigEditor.tsx (períodos, tempo integral)
- [X] T046 [US4] Criar components/painel/eventos/EventForm.tsx (client; dados gerais, local, imagem com prévia + texto alternativo, categoria, destaque, link externo, seção "Inscrições" com modelo + editor do modelo + abertas + data de encerramento; mostra erros por campo e aviso de conflito) e páginas app/painel/(app)/eventos/page.tsx (lista com filtros rascunho/publicado/arquivado, ações publicar/despublicar/arquivar/excluir com ConfirmDialog), app/painel/(app)/eventos/novo/page.tsx e app/painel/(app)/eventos/[id]/page.tsx
- [X] T047 [US4] Criar app/(site)/eventos/[slug]/page.tsx (dinâmica com `await connection()`; hero com imagem ou composição padrão, data/horário, local com link do mapa, descrição em parágrafos, CTA externo; área de inscrição reservada para a US3; metadata por evento) e app/(site)/eventos/[slug]/not-found.tsx (amigável, link para /eventos)
- [X] T048 [US4] Reescrever app/(site)/eventos/page.tsx para ler `getUpcomingEvents()` (dinâmica com `await connection()`), seguindo design/Eventos.dc.html (destaque + lista em cartões components/site/EventCard.tsx), estado vazio; incluir o evento em destaque (`getFeaturedEvent()`) na página inicial atual app/(site)/page.tsx (a US5 redesenha depois); remover app/(site)/eventos/data.ts e app/components/{CardEvento,EventDetails}.tsx

**Checkpoint**: lint + build; quickstart US4 (exceto itens que dependem de inscrição).

---

## Phase 6: User Story 3 - Respostas das inscrições (Priority: P2)

**Goal**: visitantes se inscrevem pelos formulários dos modelos; a equipe consulta, gerencia e
exporta.

**Independent Test**: quickstart.md → US3.

- [X] T049 [US3] Criar lib/registrations/submit.ts: `submitRegistration(slug, body, meta)` em transação — carrega evento; `pg_advisory_xact_lock` pelo id do evento; checa publicado/aberto/data limite; valida comuns + `answersSchema(config)`; normaliza `name_key`/`phone_key`; detecta duplicada (inclusive cancelada); checa disponibilidade (Festa); calcula preço no servidor; número = máx + 1; insere; devolve só o resumo da própria inscrição; erros tipados `duplicada | encerrada | sem_vagas | validacao`
- [X] T050 [US3] Criar app/api/inscricoes/[slug]/route.ts (POST: rate limit `publicSubmit`, honeypot `website`, `submitRegistration`, códigos 201/400/404/409/429/500 conforme contracts/public-api.md; `409 sem_vagas` inclui a disponibilidade atualizada; erro de banco → 503 com mensagem amigável). Não há rota pública de leitura de disponibilidade (constituição §I)
- [X] T051 [P] [US3] Criar components/forms/PrivacyNotice.tsx (FR-021a: finalidade, quem acessa, contato juventudesalt@pibls.com) e components/forms/SuccessScreen.tsx (número, valor, parcelas, chave Pix `juventudepibls@gmail.com` com copiar, WhatsApp `wa.me/553192919718`), seguindo design/AcampaSalt.dc.html
- [X] T052 [P] [US3] Criar components/forms/AcampamentoForm.tsx (client; react-hook-form + Zod do modelo; tabela de lotes com o vigente destacado; dupla; plano e forma de pagamento; resumo de valor calculado com as mesmas funções de lib/forms/acampamento.ts) seguindo design/AcampaSalt.dc.html
- [X] T053 [P] [US3] Criar components/forms/FestaForm.tsx (client; recebe a disponibilidade calculada no servidor pela página do evento via `getFestaAvailability`; itens esgotados desabilitados; em `409 sem_vagas` atualiza a lista com a disponibilidade devolvida) seguindo design/FestaNaRoca.dc.html
- [X] T054 [P] [US3] Criar components/forms/MissaoForm.tsx e components/forms/SimplesForm.tsx seguindo design/ProjetoMissionario.dc.html
- [X] T055 [US3] Criar components/forms/EventRegistration.tsx (escolhe o formulário pelo modelo; estados encerrada/não aberta; envia para `/api/inscricoes/[slug]`; mensagens para duplicada/encerrada/sem vagas/erro) e integrar em app/(site)/eventos/[slug]/page.tsx
- [X] T056 [US3] Remover o fluxo público antigo: app/(site)/acampa-salt/, app/(site)/festa-na-roca/, app/(site)/projeto-missionario/, app/api/acampa-salt/, app/api/festa-na-roca/, app/api/projeto-missionario/, lib/acampa/, lib/festa-roca/, lib/projeto-missionario/, lib/pdf/ (redirects já em next.config.ts)
- [X] T057 [US3] Criar lib/registrations/queries.ts: `listRegistrations({ eventId, status, q, page })` (busca por `name_key`/`phone_key` parcial, 50 por página, totais por status) e `getRegistration(id)` (com evento, colunas do modelo e histórico)
- [X] T058 [US3] Criar lib/registrations/actions.ts: `setRegistrationStatus`, `setInstallmentPaid` (atualiza `payment.parcelas[i]`), `deleteRegistration` (ConfirmDialog no cliente) — `authorizeAction("inscricoes.gerenciar")`, `recordHistory`, auditoria, `revalidatePath`
- [X] T059 [P] [US3] Validar primeiro que `jspdf` + `jspdf-autotable` geram PDF dentro de um Route Handler (Node); se não, adotar o plano B de research.md R11. Criar lib/export/csv.ts (`toCsv(columns, rows)` UTF-8 com BOM, `;`, escape de aspas/quebras) e lib/export/pdf.ts (`toPdf({ title, subtitle, columns, rows })` com jspdf + jspdf-autotable, paisagem, cabeçalho com data de geração)
- [X] T060 [US3] Criar lib/registrations/export.ts (colunas comuns + `columns(config)` do modelo + pagamento) e app/api/painel/inscricoes/export/route.ts (GET; `authorizeRoute("inscricoes.exportar")`; mesmos filtros da lista; `format=csv|pdf`; nome de arquivo com slug e data; auditoria com filtros e quantidade; sem resultados → só cabeçalho)
- [X] T061 [US3] Criar app/painel/(app)/inscricoes/page.tsx (seletor de evento com inscrição, filtros por status e busca, contadores, tabela com colunas principais do modelo, botões Exportar CSV/PDF visíveis só com `inscricoes.exportar` e avisando quando o filtro atual não tem resultados) e app/painel/(app)/inscricoes/[id]/page.tsx + components/painel/inscricoes/RegistrationActions.tsx (status, parcelas pagas, excluir; respostas do modelo; histórico)

**Checkpoint**: lint + build; quickstart US3 e itens restantes de US4.

---

## Phase 7: User Story 5 - Redesign do site público (Priority: P2)

**Goal**: todas as páginas públicas seguem o canvas aprovado (design/*.dc.html), a partir de 360 px.

**Independent Test**: quickstart.md → US5.

- [X] T062 [P] [US5] Criar components/site/SiteNav.tsx (design/Nav.dc.html: logo `salt-logo-ink.png`, links Início/Sobre/Eventos/Devocional/Podcast/Contribua com estado ativo por rota, menu móvel acessível em `Sheet`, CTA) e components/site/SiteFooter.tsx (design/Footer.dc.html: endereço R. Jair Gonçalves Bastos, 64, Jardim Ipê, Lagoa Santa – MG, 33239-800; redes sociais e links atuais de app/components/Footer.tsx)
- [X] T063 [P] [US5] Criar primitivas do site em components/site/: Container.tsx, Eyebrow.tsx, SectionHeading.tsx, ButtonLink.tsx (variantes primário/escuro/secundário/link de texto em pílula, ≥ 48 px), Tag.tsx, CopyButton.tsx (client, confirmação visível e `aria-live`)
- [X] T064 [US5] Atualizar app/(site)/layout.tsx para usar SiteNav + SiteFooter e criar app/not-found.tsx no novo estilo
- [X] T065 [US5] Reescrever a página inicial app/(site)/page.tsx com seções em components/site/home/ (Hero, Sobre resumido, Pilares, Evento em destaque via `getFeaturedEvent()`, Galeria, Mapa com copiar endereço, CTA) seguindo design/Main.dc.html; página dinâmica com `await connection()`
- [X] T066 [P] [US5] Reescrever app/(site)/sobre/page.tsx seguindo design/Sobre.dc.html, preservando textos e dados de app/(site)/sobre/programacoesData.ts
- [X] T067 [P] [US5] Reescrever app/(site)/podcast/page.tsx seguindo design/Podcast.dc.html, preservando player e links de app/(site)/podcast/data.ts
- [X] T068 [P] [US5] Reescrever app/(site)/contribua/page.tsx seguindo design/Contribua.dc.html (chave Pix com CopyButton, QR/imagens, dados bancários atuais)
- [X] T069 [P] [US5] Reescrever formulários de contato e servir em components/site/ContactForm.tsx e components/site/ServirForm.tsx (react-hook-form + Zod, honeypot `website`, PrivacyNotice, estados de envio/sucesso/erro) e usá-los nas páginas onde hoje aparecem
- [X] T070 [US5] Criar components/site/DevocionalList.tsx (client: recebe itens por prop; busca por título; filtro por mês em pílulas; destaque do mais recente; estado vazio com "Limpar filtros") seguindo design/Devocional.dc.html e ligar temporariamente ao JSON externo em app/(site)/devocional/page.tsx (Server Component)
- [X] T071 [US5] Remover componentes antigos não usados de app/components/ (Navbar, Footer, BotaoPrimario, CardPodcast, Modal, PageHeader, PageSection, ProgramacaoCard, SectionLabel, Step, TypewriterEffect, ValueCard, home/*) e hooks/useScrollReveal.ts se ficar sem uso; conferir com busca por imports
- [ ] T072 [US5] Revisão de responsividade e acessibilidade das páginas públicas: 360 px sem rolagem horizontal, contraste AA, alvos ≥ 44 px, foco visível, hierarquia de títulos única por página, `alt` em todas as imagens
  - _Revisão estática feita (um único h1, `alt` nas imagens, rótulos e foco). Falta medir 360 px e contraste AA em navegador, o que precisa do app rodando com banco._

**Checkpoint**: lint + build; quickstart US5.

---

## Phase 8: User Story 6 - Cadastro de devocionais (Priority: P3)

**Goal**: devocionais geridos no painel e lidos do banco pelo site.

**Independent Test**: quickstart.md → US6.

- [X] T073 [P] [US6] Criar lib/devotionals/queries.ts (`listDevotionalsAdmin({ q, published, page })`, `getPublishedDevotionals()` com `unstable_cache` + tag `devocionais`, ordenados por `published_at desc`, `reference_month desc`)
- [X] T074 [US6] Criar lib/devotionals/actions.ts (`saveDevotional` com URL http(s) e versão otimista, `setDevotionalPublished` preenchendo `published_at`, `deleteDevotional`) com `authorizeAction("devocionais.gerenciar")`, auditoria na exclusão e `expireTag(TAGS.devocionais)`
- [X] T075 [US6] Criar app/painel/(app)/devocionais/page.tsx + components/painel/devocionais/DevotionalFormDialog.tsx (título, mês de referência, link, publicar) com lista, busca e ações
- [X] T076 [US6] Ligar app/(site)/devocional/page.tsx a `getPublishedDevotionals()` (dinâmica com `await connection()`) e remover app/(site)/devocional/data.ts

**Checkpoint**: lint + build; quickstart US6.

---

## Phase 9: User Story 7 - Caixa de entrada de mensagens (Priority: P3)

**Goal**: contato e "Quero servir" ficam guardados no painel mesmo se o e-mail falhar.

**Independent Test**: quickstart.md → US7.

- [X] T077 [P] [US7] Criar lib/messages/email.ts (transporte nodemailer a partir de `EMAIL_*`, criado sob demanda; templates de contato e servir portados de app/api/contact/route.ts e app/api/servir/route.ts; nunca lança — devolve `{ ok, error }`)
- [X] T078 [US7] Criar lib/messages/save.ts (`saveMessage(kind, data)` e `markEmailResult(id, result)`) e reescrever app/api/contact/route.ts e app/api/servir/route.ts: rate limit, honeypot, Zod, grava primeiro, tenta e-mail, registra resultado, responde `200 { ok: true }` se gravou; erro de banco → 503 amigável
- [X] T079 [P] [US7] Criar lib/messages/queries.ts (`listMessages({ kind, status, page })`, `getMessage(id)`, `countNewMessages()`) e usar a contagem no Sidebar (T024)
- [X] T080 [US7] Criar lib/messages/actions.ts (`setMessageStatus` new/read/archived, `deleteMessage` com auditoria) e páginas app/painel/(app)/mensagens/page.tsx (filtros por tipo e status, indicação de e-mail não enviado) e app/painel/(app)/mensagens/[id]/page.tsx (abrir marca como lida quando nova; ações marcar não lida/arquivar/excluir, exclusão com ConfirmDialog)

**Checkpoint**: lint + build; quickstart US7.

---

## Phase 10: User Story 8 - Participantes do acampamento e fichas de saúde (Priority: P3)

**Goal**: listas de participantes por acampamento, com fichas de saúde restritas, importação,
repetidos, mescla, indicadores e aviso de retenção.

**Independent Test**: quickstart.md → US8.

- [X] T081 [P] [US8] Criar lib/participants/import/aliases.ts portando `COLUMN_ALIASES`, `HEALTH_CONDITIONS` e `IDENTIFIER_FIELDS` de lib/participant/constants.ts; criar lib/participants/schemas.ts com os schemas Zod de participante, responsável, contato de emergência e ficha de saúde (de lib/participant/types.ts, sem foto/anexos)
- [X] T082 [P] [US8] Criar lib/participants/import/mapper.ts (porta de lib/import/mapper.ts: sugestão de coluna → campo, assinatura dos cabeçalhos) e lib/participants/import/matcher.ts (porta de lib/import/matcher.ts: pontuação por CPF/e-mail/celular/nome/nascimento com limiares do data-model.md, classificação novo/atualização/revisão)
- [X] T083 [US8] Criar lib/participants/queries.ts (sem dados de saúde): `listCampEvents()`, `listParticipants({ eventId, q, church, city, sex, page })` (busca por `name_key`, CPF, telefone), `getParticipant(id)` (dados, responsáveis, contato de emergência, observações, histórico, flag "pendente de responsável"), `getCampStats(eventId)` (total, sexo, faixa etária, igreja, cidade)
- [X] T084 [US8] Criar lib/participants/health.ts (exige `participantes.saude.ver` internamente): `getParticipantHealth(id, user)` com auditoria `participant.health_view`, `getHealthStats(eventId, user)` (contagens e nomes por alergias, medicamentos, restrições, condições, necessidades especiais; auditoria nominal), `filterByCondition`, e `listRetentionWarnings()` (acampamentos com término/início há > 60 dias e fichas de saúde)
- [X] T085 [US8] Criar lib/participants/actions.ts (número sequencial por evento gerado em transação com `pg_advisory_xact_lock`, como em T049): `createParticipant`, `updateParticipant` (versão otimista, histórico), `saveGuardians`, `saveEmergencyContact`, `updateParticipantHealth` (`participantes.saude.editar`, histórico de cada campo), `addParticipantNote` (`participantes.observacoes`), `generateParticipantsFromRegistrations(eventId)` (confirmadas sem participante; mapeia nome/telefone/e-mail/igreja/cidade; não duplica), `mergeParticipants(principalId, otherId)` (transação conforme data-model.md), `deleteParticipant`, `deleteAllParticipants(eventId, typedTitle)` — cada uma com a permissão do contracts/panel.md e auditoria
- [X] T086 [US8] Criar lib/participants/import-actions.ts: `previewImport(eventId, { fileName, headers, rows, mapping? })` (≤ 2.000 linhas; usa mapeamento salvo por assinatura; valida linhas; classifica com o matcher; devolve novos/atualizações/revisão/inválidas com motivo) e `commitImport(eventId, payload)` (transação tudo-ou-nada; cria/atualiza participantes, responsáveis e ficha de saúde; decisões manuais da revisão; grava `import_batches` e `import_mappings`; auditoria)
- [X] T087 [P] [US8] Criar lib/participants/export.ts e app/api/painel/participantes/export/route.ts (`participantes.exportar`; colunas de saúde só com `participantes.saude.ver`; CSV/PDF via lib/export; auditoria indicando se incluiu saúde)
- [X] T088 [US8] Criar app/painel/(app)/participantes/page.tsx (seletor de acampamento, indicadores de getCampStats + bloco de saúde só com permissão, busca/filtros, tabela paginada, botões Novo/Importar/Gerar a partir das inscrições/Exportar/Excluir todos conforme permissões)
- [X] T089 [US8] Criar app/painel/(app)/participantes/[id]/page.tsx e componentes em components/painel/participantes/ (ParticipantForm.tsx, GuardiansEditor.tsx, EmergencyContactForm.tsx, HealthForm.tsx só com permissão, NotesPanel.tsx, HistoryList.tsx, MergeDialog.tsx com busca do outro cadastro) e app/painel/(app)/participantes/novo/page.tsx
- [X] T090 [US8] Criar app/painel/(app)/participantes/importar/page.tsx + components/painel/participantes/ImportWizard.tsx (client: lê Excel/CSV com `xlsx` no navegador; passo 1 arquivo; passo 2 correspondência de colunas com sugestões e "ignorar"; passo 3 prévia com novos/atualizações/revisão/inválidas e decisões na revisão; passo 4 confirmar e resultado)
- [X] T091 [US8] Mostrar o aviso de retenção (`listRetentionWarnings()`) em app/painel/(app)/page.tsx para usuários com `participantes.excluir`, com atalho para a exclusão em lote
- [X] T092 [US8] Remover lib/participant/ e lib/import/ (lógica já portada) e conferir que nada mais importa esses módulos

**Checkpoint**: lint + build; quickstart US8.

---

## Phase 11: Polish & Cross-Cutting Concerns (inclui a virada)

- [X] T093 Criar scripts/cutover-redis.ts (tsx): `--dry-run` (padrão; `SCAN` por prefixo e contagem: `acampa:*`, `festa-roca:*`, `projeto-missionario:*`, `salt:participant:*`, `salt:participants:*`, `salt:import:*`, `salt:auth:*`, `salt:stats:*`), `--export <arquivo>` (JSON local, avisa que é sensível e deve ficar fora do repositório), `--confirm` (pede digitar `EXCLUIR`; `DEL` em lotes; idempotente; imprime excluídos e restantes); nunca toca chaves de rate limit; grava evento `cutover.redis` em `audit_log` se `DATABASE_URL` estiver definido
- [X] T094 [P] Atualizar AGENTS.md: rotas novas (`/painel/*`, `/eventos/[slug]`, APIs públicas), arquitetura `lib/<domínio>`, banco (Drizzle/Neon, scripts `db:*`), variáveis (`DATABASE_URL`, `SETUP_TOKEN`), primeiro acesso via `/painel/setup`; remover seções do sistema antigo (Camp Admin, New Events, rotas `admin-*`)
- [X] T095 [P] Atualizar README.md (stack atual, como rodar, banco, virada) sem dados sensíveis
- [X] T096 Varredura final: nenhuma importação de módulos removidos (`lib/redis` só em rate limit e no script de virada), nenhum `any` sem justificativa, nenhum `console.log` com dado pessoal; `npm run lint` e `npm run build` sem erros
- [ ] T097 Revisão de acessibilidade do painel (FR-046): navegação por teclado em Sidebar, diálogos e tabelas; rótulos; mensagens de erro associadas aos campos; contraste AA; 360 px
  - _Revisão estática feita (link "Pular para o conteúdo", rótulos, `aria-describedby`, alvos ≥ 44 px, diálogos Radix). Falta teste de teclado, contraste e 360 px em navegador._
- [X] T098 Executar o roteiro completo de quickstart.md em um banco de desenvolvimento do Neon (requer `DATABASE_URL` e `SETUP_TOKEN` do responsável) e registrar o resultado
  - _Roteiro executado em 16/11/2026 num branch de desenvolvimento do Neon, com navegador automatizado (Chrome/Playwright) e usuários de teste (removidos depois). US1–US8 passaram. **Não validado:** bloqueio de login após 5 erros (depende do Redis do Upstash, ausente no ambiente; sem Redis o código deixa passar), regra do único administrador (havia 2), envio real de e-mail (SMTP não configurado; só o caminho de falha foi exercitado), comparação visual com o canvas e contraste AA. Achados corrigidos durante o roteiro: imagem de 6 MB derrubava a Server Action (agora valida 5 MB no navegador), aviso de item esgotado da Festa fora da tela no celular, e Redis fora do ar deixava o login ~14 s mais lento._
- [X] T099 Virada em produção: **somente com confirmação explícita do responsável no momento** — deploy, `db:migrate`, `db:seed`, `/painel/setup`, `cutover-redis.ts --dry-run` → (opcional) `--export` → `--confirm`, conferir 0 chaves antigas (SC-011)
  - _Executada em 17/11/2026 com autorização do responsável. Deploy na Vercel (https://juventude-salt.vercel.app); `db:migrate` e `db:seed` no banco de produção do Neon (16 tabelas, 7 papéis, 24 devocionais); administrador criado em `/painel/setup` (a página passou a mostrar "Configuração já feita"). **Redis:** o Redis antigo deixou de existir (host fora do DNS) e foi substituído por um novo, usado só para rate limit; a simulação de `cutover-redis.ts` retornou 0 chaves em todos os padrões e `DBSIZE` 0, então `--export` e `--confirm` não tinham o que exportar ou excluir (SC-011 atendido). **Não verificado:** se a Vercel usa o mesmo Redis do `.env` (bloqueio de login após 5 erros) e o envio de e-mail (SMTP)._

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias.
- **US1 (Phase 3)** e **US2 (Phase 4)**: dependem da Fase 2; independentes entre si.
- **US4 (Phase 5)**: depende da Fase 2.
- **US3 (Phase 6)**: depende da US4 (eventos, modelos, página do evento).
- **US5 (Phase 7)**: depende do Setup (tokens) e da Fase 2 só para build; T065 usa `getFeaturedEvent()` (US4) — pode usar um stub até US4 terminar.
- **US6 (Phase 8)**: depende da Fase 2; T076 depende de T070 (US5).
- **US7 (Phase 9)**: depende da Fase 2; T069 (US5) reaproveita os formulários.
- **US8 (Phase 10)**: depende de US4 (eventos Acampamento) e US3 (gerar a partir de inscrições).
- **Polish (Phase 11)**: depende de todas as histórias; T099 depende de T098 e da confirmação do responsável.

### Within Each User Story

- Queries/regras em `lib/` antes das actions; actions antes das páginas.
- Remoções de legado só depois que a substituição existe e o build passa.

### Parallel Opportunities

- Setup: T006–T012 em paralelo após T001–T005.
- Foundational: T014–T016 em paralelo; T022 e T023 em paralelo após T019/T021.
- US2: T034–T036 em paralelo após T031–T033.
- US4: T037–T040 e T042 em paralelo; T045 em paralelo com T043/T044.
- US3: T051–T054 e T059 em paralelo.
- US5: T062, T063, T066–T069 em paralelo.
- Histórias US2, US4/US3, US5, US6, US7 podem andar em paralelo após a Fase 2 (com as ressalvas acima).

---

## Parallel Example: User Story 4

```text
Task: "T037 [US4] lib/forms/types.ts"
Task: "T038 [US4] lib/forms/acampamento.ts"
Task: "T039 [US4] lib/forms/festa.ts"
Task: "T040 [US4] lib/forms/missao.ts e simples.ts"
Task: "T042 [US4] lib/events/images.ts + rota de imagem"
```

## Parallel Example: User Story 5

```text
Task: "T062 [US5] SiteNav + SiteFooter"
Task: "T063 [US5] primitivas do site"
Task: "T066 [US5] Sobre"
Task: "T067 [US5] Podcast"
Task: "T068 [US5] Contribua"
```

---

## Implementation Strategy

### MVP (P1)

1. Fases 1 e 2 → 3. US1 → 4. US2.
2. Validar quickstart US1 e US2. Neste ponto o painel existe, é seguro e gerencia acesso.

### Entrega incremental

1. US4 → US3 (inscrições no novo modelo) → validar.
2. US5 (redesign) → validar visualmente contra o canvas.
3. US6 → US7 → US8.
4. Polish e virada (com confirmação do responsável).

Como o responsável optou por não corrigir as telas antigas antes da virada, tudo vai para produção
num único deploy ao fim (T099); os checkpoints acima são locais (branch).

---

## Notes

- [P] = arquivos diferentes, sem dependência pendente.
- Commits só quando o responsável pedir.
- Nunca commitar `.env*` nem o arquivo exportado pelo script de virada.
- Ajustes do /speckit.analyze aplicados em 2026-11-16 (C1, U1, U2, I1, I2, G1, G2, U3).
- Pendentes do responsável (não bloqueiam a implementação): consentimento de menores de 12 anos
  (checklists/security.md CHK008) e data-alvo da virada (CHK038).
