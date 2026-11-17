# Implementation Plan: Painel administrativo, segurança e redesign do site

**Branch**: `001-painel-admin-redesign` | **Date**: 2026-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-painel-admin-redesign/spec.md`

## Summary

Substituir as áreas administrativas atuais (telas e rotas sem proteção, dados no Redis) por um
painel único em `/painel`, com login, papéis e permissões checados no servidor, auditoria, e dados
em Postgres (Neon) via Drizzle. O painel gerencia eventos (com 4 modelos de formulário de inscrição
parametrizáveis), inscrições, participantes do acampamento com fichas de saúde (importação,
repetidos, mescla), devocionais e mensagens. O site público é redesenhado conforme o canvas
aprovado e passa a ler eventos e devocionais do banco. Na virada, o código antigo é removido e os
dados antigos do Redis são excluídos por script com confirmação explícita.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node.js 24 local / runtime Node da Vercel
**Primary Dependencies**: Next.js 16.0 (App Router, Server Actions, `proxy.ts`), React 19.2,
Tailwind CSS 4, shadcn/ui + Radix, Zod 4, react-hook-form, Drizzle ORM + `@neondatabase/serverless`
(novos), drizzle-kit e tsx (novos, dev), bcryptjs, @upstash/ratelimit, nodemailer, jspdf +
jspdf-autotable, xlsx (parse no navegador), sonner, lucide-react
**Storage**: Postgres no Neon (fonte de verdade); Upstash Redis só para rate limit
**Testing**: sem framework (constituição); `npm run lint`, `npm run build` e roteiro manual em
[quickstart.md](./quickstart.md)
**Target Platform**: Vercel (Node runtime); navegadores modernos, a partir de 360 px
**Project Type**: aplicação web full-stack única (Next.js)
**Performance Goals**: páginas públicas servidas com dados em cache (tags `eventos`,
`devocionais`); mudanças publicadas visíveis em ≤ 1 min (imediato via
`revalidateTag(tag, { expire: 0 })`); busca no
painel < 10 s para encontrar um registro (SC-005) — listas paginadas de 50
**Constraints**: LGPD (dados de menores e de saúde) — saúde isolada por permissão e auditada;
`next build` sem acesso ao banco (cliente lazy, páginas dinâmicas); corpo das Server Actions até
6 MB (imagens ≤ 5 MB); fuso America/Sao_Paulo
**Scale/Scope**: dezenas de usuários do painel, centenas de inscrições/participantes por evento,
poucos eventos por ano; ~9 páginas públicas e ~20 telas de painel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano cumpre | Status |
|---|---|---|
| I. Segurança e Privacidade (NON-NEGOTIABLE) | `proxy.ts` como 1ª barreira + `requirePermission` em toda action/route/página do painel; rotas públicas só recebem envios e devolvem só a própria inscrição; papéis com menor privilégio; saúde em tabela e módulo separados; auditoria (`audit_log`) de exclusões, exportações, acesso à saúde e mudanças de acesso; segredos só em env | ✅ |
| II. Fonte única e validada | Postgres para todo dado de negócio; Redis só rate limit; Zod em todas as fronteiras (rotas públicas, actions, importação); migrações Drizzle versionadas em `drizzle/` | ✅ |
| III. Interface consistente e acessível | shadcn/ui + tokens do guia de estilo em `globals.css`; painel e site com o mesmo design; AA, alvos ≥ 44 px, 360 px | ✅ |
| IV. Server-First | Server Components por padrão; Server Actions; Client Components só para formulários, filtros, importação (parse) e diálogos; sem `any` | ✅ |
| V. Simplicidade | Reuso das regras de cálculo e da lógica de importação existentes; novas dependências justificadas abaixo; sem construtor de formulários | ✅ |
| Fluxo | lint + build obrigatórios; roteiro manual; virada destrutiva só com confirmação no momento (`--confirm` + digitar EXCLUIR) | ✅ |

Novas dependências (Princípio V):

| Dependência | O que resolve | Por que as existentes não bastam |
|---|---|---|
| `drizzle-orm` | Consultas tipadas e transações no Postgres | Projeto não tem acesso a SQL |
| `@neondatabase/serverless` | Driver do Neon para serverless (WebSocket, transações) | — |
| `drizzle-kit` (dev) | Gerar e aplicar migrações versionadas | Exigência do Princípio II |
| `tsx` (dev) | Rodar `scripts/seed.ts` e `scripts/cutover-redis.ts` com alias `@/*` | Node puro não resolve o alias |
| Componentes shadcn adicionais (`radio-group`, `switch`, `form`, `pagination`, conforme necessidade) | Controles acessíveis do painel e formulários | Padrão do projeto para UI nova |

**Ajustes do /speckit.analyze (2026-11-16)**: removida a rota pública de leitura de
disponibilidade (C1); `/imagens/eventos/[id]` documentada como conteúdo estático público;
invalidação com `revalidateTag(tag, { expire: 0 })` (U1); validação do PDF no servidor com plano B
(U2); destaque na home já na US4 (I1); bloqueio de login fixo de 15 min (I2).

**Re-check pós-design (Phase 1)**: o modelo de dados mantém saúde em `participant_health`
consultada só por `lib/participants/health.ts`; exportações checam `participantes.saude.ver`
coluna a coluna; nenhum contrato público devolve listas. ✅ Sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/001-painel-admin-redesign/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas (R1–R16)
├── data-model.md        # Phase 1 — tabelas, regras e transições
├── quickstart.md        # Phase 1 — preparação e validação manual por história
├── contracts/
│   ├── permissions.md   # Permissões, papéis padrão, mapa de áreas
│   ├── public-api.md    # Rotas públicas e páginas do site
│   └── panel.md         # Server Actions e rotas do painel
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
proxy.ts                         # substitui middleware.ts (Next 16)
drizzle.config.ts
drizzle/                         # migrações SQL geradas
scripts/
├── seed.ts                      # papéis, evento inicial, 24 devocionais
└── cutover-redis.ts             # dry-run / export / confirm
app/
├── layout.tsx                   # fontes Inter + Inter Tight, tokens
├── globals.css                  # tokens do guia de estilo (@theme) + variáveis shadcn
├── (site)/                      # site público redesenhado
│   ├── layout.tsx               # SiteNav + SiteFooter
│   ├── page.tsx                 # Início
│   ├── sobre/page.tsx
│   ├── eventos/page.tsx
│   ├── eventos/[slug]/page.tsx  # detalhe + formulário do modelo
│   ├── eventos/[slug]/not-found.tsx
│   ├── devocional/page.tsx
│   ├── podcast/page.tsx
│   └── contribua/page.tsx
├── painel/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/setup/page.tsx
│   └── (app)/                   # layout com guard + sidebar
│       ├── page.tsx             # visão geral
│       ├── inscricoes/…
│       ├── eventos/{page,novo,[id]}
│       ├── participantes/{page,[id],importar}
│       ├── devocionais/…
│       ├── mensagens/…
│       ├── usuarios/…  papeis/…
│       ├── auditoria/page.tsx
│       └── conta/senha/page.tsx
├── api/
│   ├── inscricoes/[slug]/route.ts
│   ├── contact/route.ts         # passa a gravar mensagem
│   ├── servir/route.ts          # passa a gravar mensagem
│   └── painel/{inscricoes,participantes}/export/route.ts
└── imagens/eventos/[id]/route.ts
components/
├── ui/                          # shadcn (existente + novos)
├── site/                        # Nav, Footer, seções e cartões do redesign
├── painel/                      # Sidebar, PageHeader, DataTable, ConfirmDialog, Pagination
└── forms/                       # formulários públicos por modelo + tela de sucesso
lib/
├── db/{index.ts,schema.ts}
├── auth/{permissions.ts,session.ts,guard.ts,password.ts,rate-limit.ts}
├── audit.ts  history.ts  format.ts  text.ts  cache-tags.ts
├── forms/{types.ts,registry.ts,acampamento.ts,festa.ts,missao.ts,simples.ts}
├── events/{queries.ts,actions.ts,images.ts}
├── registrations/{queries.ts,actions.ts,submit.ts,export.ts}
├── participants/{queries.ts,health.ts,actions.ts,export.ts,import/{aliases.ts,mapper.ts,matcher.ts}}
├── devotionals/{queries.ts,actions.ts}
├── messages/{queries.ts,actions.ts,email.ts}
├── users/{queries.ts,actions.ts}
├── redis.ts  pix.ts  utils.ts
```

**Removidos na virada**: `middleware.ts`; `app/admin-acampa-salt`, `app/admin-camp`,
`app/admin-festa-na-roca`, `app/admin-projeto-missionario`, `app/login`, `app/setup`;
`app/api/{acampa-salt,camp-admin,festa-na-roca,projeto-missionario}`;
`app/(site)/{acampa-salt,festa-na-roca,projeto-missionario}` (viram redirects);
`app/(site)/eventos/data.ts`, `app/(site)/devocional/data.ts`; `components/admin`;
`lib/{acampa,festa-roca,projeto-missionario,participant,import,pdf}` e `lib/auth/{config,session}.ts`
(regras úteis portadas para `lib/forms` e `lib/participants`); `app/components/*` substituídos por
`components/site/*`.

**Structure Decision**: aplicação Next.js única. Domínio em `lib/<domínio>/` (queries para leitura
no servidor, `actions.ts` com `'use server'` para mutações), UI em `components/{site,painel,forms}`,
rotas em `app/`. Mantém o padrão atual do repositório (`@/*`, shadcn em `components/ui`).

## Ordem de entrega (insumo para `/speckit.tasks`)

1. **Setup**: dependências, `drizzle.config.ts`, `lib/db`, esquema completo, 1ª migração, seed,
   tokens/fontes.
2. **Fundação (bloqueia tudo)**: permissões, sessão, guard, auditoria, histórico, `proxy.ts`,
   layout do painel, login, setup inicial, troca de senha.
3. **US2** usuários e papéis → **US1** (completa com a remoção do legado no fim).
4. **US4** eventos + registro de modelos de formulário + página pública do evento.
5. **US3** envio público de inscrições + gestão e exportação no painel.
6. **US5** redesign das páginas públicas (pode correr em paralelo com 4–5 após o Setup).
7. **US6** devocionais. **US7** mensagens.
8. **US8** participantes (depende de 4 e 5).
9. **Virada**: remoção do legado, redirects, script de cutover, atualização do `AGENTS.md`,
   lint/build, roteiro do quickstart.

## Complexity Tracking

Sem violações da constituição. Decisões que fogem do óbvio, registradas para revisão:

| Decisão | Motivo | Alternativa mais simples rejeitada porque |
|---|---|---|
| Imagens de eventos em `bytea` no Postgres | Volume mínimo; evita novo serviço/segredo | Vercel Blob exigiria criar store e token; só URL viola FR-035 |
| `unstable_cache` em vez de `'use cache'` | Não exige ativar Cache Components no app todo | `'use cache'` obrigaria reestruturar todas as páginas com Suspense |
