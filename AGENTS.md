# AGENTS.md — Saltweb

Site público e painel administrativo da Juventude SALT (Primeira Igreja Batista em Lagoa Santa). O painel guarda dados pessoais de inscritos, inclusive menores de idade, e dados de saúde: trate qualquer mudança em acesso, exportação ou exclusão como sensível.

## Dev Commands

```bash
npm run dev            # servidor de desenvolvimento (http://localhost:3000)
npm run build          # build de produção
npm run lint           # ESLint (flat config)
npm start              # servidor de produção

npm run db:generate    # gera migração a partir de lib/db/schema.ts (drizzle-kit)
npm run db:migrate     # aplica migrações no banco de DATABASE_URL
npm run db:seed        # papéis padrão, evento Acampa SALT 2026 e devocionais (idempotente)
npm run db:studio      # Drizzle Studio
npm run cutover:redis  # virada do Redis (simulação por padrão; veja "Virada" abaixo)
```

## Environment

Variáveis ficam em `.env` / `.env.local` (ambos ignorados pelo git). **Nunca commite `.env*`** nem o arquivo exportado pela virada (`cutover-*.json`).

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Postgres no Neon (fonte de verdade) |
| `SETUP_TOKEN` | Autoriza criar o primeiro administrador em `/painel/setup` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Redis **só** para rate limit (`lib/auth/rate-limit.ts`) e para o script de virada |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | SMTP (aviso de mensagens do site) |

Os scripts `db:*` leem `.env.local` (`--env-file-if-exists`).

## Key Routes

Site público (`app/(site)/`):

| Rota | Descrição |
|------|-----------|
| `/` | Home |
| `/sobre` | Sobre + formulário "quero servir" |
| `/eventos`, `/eventos/[slug]` | Lista de eventos; página do evento com inscrição (formulário conforme o modelo) |
| `/podcast` | Salt Talks (`app/(site)/podcast/data.ts`) |
| `/devocional` | Devocionais publicados (banco) |
| `/contribua` | Pix e dados bancários |
| `/visitante` | Cadastro de visitante (QR Code da recepção); vai para `/painel/visitantes` e avisa o e-mail da juventude |
| `/acampa-salt`, `/festa-na-roca`, `/projeto-missionario` | Redirecionam (`next.config.ts`) para `/eventos/...` |

Painel (`app/painel/`, protegido por `proxy.ts` + checagem em cada página/ação/rota):

| Rota | Permissão principal |
|------|---------------------|
| `/painel/login`, `/painel/setup`, `/painel/conta/senha` | públicas / sessão |
| `/painel` | qualquer usuário autenticado (resumo + aviso de retenção) |
| `/painel/eventos`, `/novo`, `/[id]` | `eventos.gerenciar` |
| `/painel/configuracoes` | `eventos.gerenciar` (dia/horário das programações fixas, agrupadas em "Sextas SALT" e "Células"; mostra as próximas datas e avisa quando duas sextas caem no mesmo dia; fonte única para home, rodapé, `/eventos`, `/sobre` e `/visitante` via `lib/programacoes/`) |
| `/painel/inscricoes`, `/[id]` | `inscricoes.ver` (+ editar/exportar) |
| `/painel/participantes`, `/novo`, `/[id]`, `/importar` | `participantes.*` (saúde: `participantes.saude.ver/editar`) |
| `/painel/devocionais` | `devocionais.gerenciar` |
| `/painel/mensagens`, `/[id]` | `mensagens.ver` / `mensagens.gerenciar` |
| `/painel/visitantes`, `/[id]` | `visitantes.ver` / `visitantes.gerenciar` (filtro por grupo do discipulado; "contatado" guarda quem e quando) |
| `/painel/usuarios`, `/painel/papeis`, `/painel/auditoria` | permissões de acesso e auditoria |

APIs: `POST /api/inscricoes/[slug]` (inscrição pública), `POST /api/contact`, `POST /api/servir`, `POST /api/visitantes`, `GET /api/painel/inscricoes/export`, `GET /api/painel/participantes/export`, `GET /imagens/eventos/[id]` (imagens de eventos).

## Architecture

- Páginas: `app/(site)/<rota>/page.tsx` (público) e `app/painel/(app)/<rota>/page.tsx` (painel).
- Regra de negócio por domínio em `lib/<domínio>/` — `queries.ts` (leitura), `actions.ts` (Server Actions `"use server"`: só exportam funções assíncronas), módulos puros sem diretiva:
  - `lib/db` (Drizzle + Neon; `schema.ts`), `lib/auth` (sessão, permissões, `guard.ts`, rate limit), `lib/audit.ts`, `lib/history.ts`
  - `lib/events`, `lib/forms` (modelos de formulário: acampamento, festa, missão, simples), `lib/registrations`, `lib/participants` (+ `import/`), `lib/devotionals`, `lib/messages`, `lib/visitors`, `lib/users`, `lib/export` (CSV/PDF)
- Componentes: `components/site/` (público), `components/painel/<área>/`, `components/forms/` (inscrição pública), `components/ui/` (shadcn).
- Migrações em `drizzle/` (geradas por `db:generate`); nunca edite uma migração já aplicada.

### Acesso e permissões

- Papéis e permissões são dados do banco; permissões possíveis em `lib/auth/permissions.ts` (papéis padrão criados pelo `db:seed`: Administrador, Editor de conteúdo, Equipe de inscrições, Atendimento, Acolhimento, Equipe de saúde, Liderança, Recepção). O papel Administrador não é editável e o seed não altera papéis existentes: permissão nova precisa entrar no Administrador por migração (ex.: `drizzle/0003_*.sql`).
- Programações fixas: `lib/programacoes/catalog.ts` (texto, grupo e horário padrão; código) + tabela `programacoes` (dia/horário salvos no painel). Só as linhas do banco ficam em cache, então programação nova no catálogo aparece no deploy seguinte. Ritmo das sextas (Planejamento SALT 2026, p. 14): 1ª Culto SALT, 2ª Esportes SALT, 3ª Missões SALT, 4ª Semana do Discipulado, 5ª Encontrão SALT (só nos meses com cinco sextas: `nth = 6`; `nth = 5` é "última"). `lib/programacoes/ritmo.ts` (puro) calcula a próxima sexta mostrada no site. As células são divididas por bairro e não têm dia/horário único (`semAgenda` no catálogo): o site mostra "Em vários bairros · Dia e horário variam", o painel não edita e linhas antigas no banco são ignoradas. O Discipulado (um a um) não é programação com horário: só um cartão em `/sobre` (`DISCIPULADO` no catálogo).
- Pagamentos das inscrições: `lib/registrations/payment.ts` (módulo puro) calcula parcelas, baixa e o resumo "arrecadado / falta receber" mostrado em `/painel/inscricoes`. À vista e contribuição em valor não gravam parcelas na inscrição; viram uma parcela única, gravada na primeira baixa. Inscrições canceladas ficam fora dos totais (o que já tinham pago aparece num aviso).
- `proxy.ts` só confere se existe o cookie de sessão. **A autorização real** é feita com `requirePermission` (páginas), `authorizeAction` (Server Actions) e `authorizeRoute` (Route Handlers), de `lib/auth/guard.ts`. Toda ação nova deve usar uma delas.
- Ações sensíveis (login, exclusões, exportações, consulta a saúde, importação, mescla) gravam em `audit_log` via `logAudit`. Alterações de cadastro gravam `entity_history` via `recordHistory`.

### Dados de saúde (regras fixas)

- Só `lib/participants/health.ts` lê `participant_health`; cada função exige `participantes.saude.ver` e audita a consulta. `lib/participants/queries.ts` **nunca** lê saúde.
- O histórico (`entity_history`) visível a quem só tem `participantes.ver` registra **os nomes dos campos de saúde alterados, nunca os valores**.
- Exportação com saúde exige pedido explícito (`saude=1`) e `participantes.saude.ver`.
- Retenção: fichas de acampamentos encerrados há mais de 60 dias aparecem como aviso no `/painel` (exclusão manual, `participantes.excluir`).
- Inscrição em acampamento: só é aceita **junto com a ficha de saúde** (e com ao menos um responsável, se o inscrito tem menos de 18 anos). `lib/registrations/submit.ts` valida com `lib/forms/ficha.ts` e, na mesma transação, cria o participante, a ficha e os responsáveis (`lib/participants/enroll.ts`). Saúde e responsáveis **nunca** entram em `registrations.answers`; a data de nascimento fica só no participante (a inscrição guarda a idade calculada).
- A ficha é editável **por evento** (`events.formConfig.ficha`, editor em `components/painel/eventos/config/FichaConfigEditor.tsx`; módulo puro `lib/forms/ficha-config.ts`): textos, dicas e aviso de privacidade das perguntas fixas e até 10 perguntas extras (texto livre ou sim/não). As perguntas fixas não podem ser removidas (indicadores, exportação e alertas dependem delas). As respostas extras ficam em `participant_health.extra_answers` (com cópia do texto da pergunta) e o servidor valida contra a configuração do evento, nunca contra o que o navegador enviar.
- A página do participante (`/painel/participantes/[id]`) usa abas por URL (`?aba=cadastro|responsaveis|saude|historico`): a ficha de saúde só é consultada (e auditada) quando a aba `saude` é aberta, e a aba só existe com `participantes.saude.ver`.

### Primeiro acesso

Com o banco migrado e semeado, abra `/painel/setup`, informe o `SETUP_TOKEN` e crie o administrador. A página deixa de funcionar depois que existe um usuário.

### Virada (sistema antigo → novo)

O Redis antigo (inscrições, participantes, usuários e sessões do `/admin-camp`) não é migrado; é excluído na virada:

```bash
npm run cutover:redis                              # simulação: só conta chaves (padrão)
npm run cutover:redis -- --export ../cutover.json  # cópia local (dados pessoais; fora do repositório)
npm run cutover:redis -- --confirm                 # exclui, depois de digitar EXCLUIR (exige terminal interativo)
```

Não toca nas chaves `salt:rl:*` (rate limit). **Só execute `--confirm` com autorização explícita do responsável naquele momento.**

## Project Stack

- Next.js 16 (App Router, Server Actions, `proxy.ts`) + React 19; TypeScript strict
- Postgres no Neon + Drizzle ORM (`@neondatabase/serverless`)
- Tailwind CSS 4 (`@tailwindcss/postcss`; tokens em `app/globals.css`) + shadcn/ui (New York, RSC) + Radix
- Zod (validação em Server Actions e rotas; formulários usam estado controlado do React, não react-hook-form)
- Upstash Redis + Ratelimit (somente rate limit)
- Nodemailer (SMTP), Sonner (toasts), lucide-react (ícones)
- `xlsx` (leitura de planilhas no navegador, importação de participantes), `jspdf` + `jspdf-autotable` (PDF no servidor)
- bcryptjs (senhas), recharts (somente `components/ui/chart.tsx`)

## Path Aliases

`@/*` aponta para a raiz do projeto — ex.: `@/components`, `@/lib`, `@/components/ui`.

## shadcn/ui

- Componentes em `components/ui/`
- Adicionar: `npx shadcn@latest add <component>`
- Registro/presets: `components.json`

## Tailwind e design

- Tailwind 4: tokens (`--color-*`, `--font-*`) em `app/globals.css`; `tailwind.config.ts` ainda é lido por ferramentas.
- Cores: `primary`/`purple` (roxo), `text-2`/`text-3` (textos secundários), `success`, `warning`, `purple-tint` etc.; claro e escuro.
- Fontes: corpo `font-sans` (Inter), títulos `font-display` (Inter Tight).
- Design de referência (canvas): `specs/001-painel-admin-redesign/design/`.
- Site público: segue o canvas "SALT — Site (versão profissional)" (https://claude.ai/artifact/AJjC1HUpxX7NrPTSbKY2EP). Tokens em `.site` (`app/globals.css`, aplicado em `app/(site)/layout.tsx`; o painel não é afetado): fundo branco alternando com `bg-sand`, linhas `border-line`, um único roxo de destaque, raio 8 px em botões/campos (`rounded-lg`) e 12 px em cartões/imagens (`rounded-xl`), rótulos `eyebrow`, títulos Inter Tight 600 (`PageHeader`/`SectionHeading`), rodapé `bg-night`. Nada de pílulas, brilhos ou cantos acima de 12 px. Conteúdo de portal (ex.: `SheetContent`) precisa da classe `site` própria.
- Acessibilidade: alvos ≥ 44 px (`min-h-11`), rótulos associados aos campos, erros ligados por `aria-describedby`, um único `h1` por página.

## Data & Content

- Conteúdo editável (eventos, devocionais, mensagens) vem do banco; textos fixos do site ficam nos componentes/`data.ts` da página (ex.: `app/(site)/podcast/data.ts`).
- Dados institucionais (endereço, WhatsApp, e-mail) centralizados em `lib/site-info.ts`; Pix em `lib/pix.ts`.

## Testing

No test framework configured. Do not add tests without discussing with the user.

## Skills

**Sempre use a skill de design** (`/frontend-design`) quando:

- Criar ou modificar páginas, componentes ou interfaces
- Melhorar UX/UI de formulários, cards, tabelas, modais
- Redesenhar telas de sucesso (SuccessScreen)
- Ajustar layout visual de qualquer elemento

**Sempre use as skills de React/Next** (`/vercel-react-best-practices`, `/next-best-practices`) quando:

- Implementar lógica de estado ou fetch de dados
- Otimizar performance de renderização
- Trabalhar com Server Components vs Client Components
- Tratar Typescript e tipagem

**Sempre use a skill do shadcn** (`/shadcn`) e componentes shadcn/ui quando:
- Criar novos componentes de UI (botões, inputs, cards, modais, etc.)
- Adicionar components ao projeto
- Consultar documentação de componentes shadcn
- Usar primitives do Radix para acessibilidade

## Context7 MCP

Sempre use o Context7 MCP para consultar documentação:
- Verificar APIs de bibliotecas (Next.js, React, Tailwind, shadcn/ui, etc.)
- Pesquisar exemplos atualizados de qualquer biblioteca
- Antes de implementar funcionalidades com bibliotecas desconhecidas
- Consultar documentação oficial para evitar APIs desatualizadas

## Active Technologies
- TypeScript 5 (strict), Node.js 24 local / runtime Node da Vercel + Next.js 16.0 (App Router, Server Actions, `proxy.ts`), React 19.2, (001-painel-admin-redesign)
- Postgres no Neon (fonte de verdade); Upstash Redis só para rate limit (001-painel-admin-redesign)

## Recent Changes
- 001-painel-admin-redesign: painel `/painel` (eventos, inscrições, participantes e saúde, devocionais, mensagens, usuários/papéis, auditoria), site público redesenhado e sistema antigo (Redis, `/admin-*`) removido.
