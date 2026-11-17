# Research: Painel administrativo, segurança e redesign do site

**Feature**: `001-painel-admin-redesign` | **Date**: 2026-11-16

Cada item segue o formato Decisão / Racional / Alternativas. Documentação consultada via Context7
(Next.js v16.0.3, Drizzle ORM docs).

## R1. Banco de dados e acesso

- **Decisão**: Postgres no Neon, acessado com Drizzle ORM pelo driver `drizzle-orm/neon-serverless`
  (`Pool` do `@neondatabase/serverless`, WebSocket). Cliente criado sob demanda (lazy) em
  `lib/db/index.ts`, para que `next build` funcione sem `DATABASE_URL`.
- **Racional**: o driver WebSocket suporta transações interativas, necessárias para inscrição com
  estoque (Festa), mescla de participantes, importação e a virada. Drizzle gera SQL tipado, tem
  migrações versionadas (`drizzle-kit generate`) e integra com Zod. Node 24 (local) e o runtime
  Node da Vercel têm `WebSocket` nativo, sem pacote `ws`.
- **Alternativas**: `neon-http` (mais rápido para consulta única, mas sem transação interativa);
  Prisma (gerador e engine pesados, cold start maior); SQL puro (sem tipos nem migrações).

## R2. Migrações e seed

- **Decisão**: `drizzle-kit generate` gera SQL em `drizzle/` (commitado). `drizzle-kit migrate`
  aplica. Scripts npm: `db:generate`, `db:migrate`, `db:seed`, `db:studio`. O seed
  (`scripts/seed.ts`, executado com `tsx`) é idempotente: cria papéis padrão, o evento Acampa SALT
  2026 e os 24 devocionais.
- **Racional**: Princípio II exige migrações versionadas. `tsx` resolve o alias `@/*` e roda
  TypeScript sem build. Nova dependência de desenvolvimento justificada no plano.
- **Alternativas**: `drizzle-kit push` (sem histórico, só protótipo); rodar migração no boot da
  aplicação (arriscado em serverless com várias instâncias).

## R3. Autenticação e sessão

- **Decisão**: login por e-mail e senha (`bcryptjs`, custo 12). Sessão em tabela `sessions` no
  Postgres: token aleatório de 32 bytes no cookie `salt-session` (httpOnly, secure em produção,
  sameSite=lax, 7 dias); no banco fica só o SHA-256 do token. Cada requisição carrega sessão +
  usuário + papel numa única consulta e rejeita usuário inativo, o que encerra o acesso na ação
  seguinte (FR-005). Desativar ou excluir usuário apaga as sessões dele.
- **Racional**: fonte única (Princípio II) e revogação imediata simples. Guardar só o hash impede
  uso de tokens vazados do banco.
- **Alternativas**: sessão no Redis (constituição permite, mas a revogação dependeria de duas
  bases); JWT (não revoga sem lista negra); Auth.js (traz OAuth e adaptadores desnecessários).

## R4. Bloqueio de login e limite de envios públicos

- **Decisão**: `@upstash/ratelimit` (já no projeto) conta as tentativas erradas por e-mail (5 em
  15 min); na 5ª falha grava a chave `salt:lock:login:<hash do e-mail>` com validade de 15 min, que
  bloqueia a conta pelo período inteiro (FR-004) e limite por IP para login e formulários públicos (inscrição, contato,
  servir). Campo-armadilha (honeypot) nos formulários públicos.
- **Racional**: dado efêmero, uso permitido do Redis pela constituição; reaproveita dependência.
- **Alternativas**: contador no Postgres (escritas a cada tentativa, limpeza manual).

## R5. Autorização

- **Decisão**: lista fixa de permissões em código (`lib/auth/permissions.ts`), papéis no banco com
  `permissions text[]` validado contra a lista. Três barreiras:
  1. `proxy.ts` (Next 16 substitui `middleware.ts`): redireciona `/painel/*` sem cookie para o
     login e responde 401 em `/api/painel/*`.
  2. `requirePermission(perm)` no início de toda Server Action, Route Handler e página do painel
     (Server Component). Falha → 403/redirect e registro na auditoria.
  3. Consultas de saúde ficam em módulo separado (`lib/participants/health.ts`) que exige
     `participantes.saude.ver` e nunca é chamado pelas listas sem essa permissão.
- **Racional**: Princípio I (middleware nunca é a única barreira). Em Next 16 o arquivo
  `middleware.ts` está depreciado; `proxy.ts` roda em Node.
- **Alternativas**: tabela `role_permissions` (join extra sem ganho para ~20 permissões); checar só
  no proxy (viola a constituição).

## R6. Mutations e cache das páginas públicas

- **Decisão**: o painel usa Server Actions (formulários com `useActionState`, validação Zod).
  Páginas públicas são dinâmicas (`await connection()`) e leem dados por funções envolvidas em
  `unstable_cache` com tags `eventos` e `devocionais` (revalidate 3600 s). Ações do painel chamam
  `revalidateTag(tag, { expire: 0 })` (expiração imediata; funciona com tags de `unstable_cache`)
  através do helper `expireTag()` em `lib/cache-tags.ts`. `updateTag` não é usado porque a
  documentação só garante o efeito sobre `fetch`/`cacheTag`. Rotas públicas de envio continuam
  como Route Handlers.
- **Racional**: SC-003 (≤ 1 min) atendido na hora. `cacheComponents`/`'use cache'` exigiria
  reestruturar o app inteiro com Suspense; `unstable_cache` segue suportado no Next 16. Páginas
  dinâmicas não acessam o banco no build.
- **Alternativas**: ISR com `revalidate = 60` (consulta o banco no build); `force-dynamic` sem cache
  (consulta o Neon a cada visita e sofre com cold start do Neon).

## R7. Imagens de eventos

- **Decisão**: imagem guardada no Postgres (`event_images`, coluna `bytea`, até 5 MB, JPG/PNG/WebP
  validados pelo cabeçalho do arquivo) e servida por `GET /imagens/eventos/[id]` com
  `Cache-Control: public, max-age=31536000, immutable` (id muda a cada troca de imagem). O
  componente `next/image` otimiza a partir dessa rota (`images.localPatterns`). Limite do corpo
  das Server Actions elevado para 6 MB (`experimental.serverActions.bodySizeLimit`).
- **Racional**: poucos eventos por ano; evita novo serviço e novo segredo. CDN da Vercel cacheia a
  resposta.
- **Alternativas**: Vercel Blob (novo serviço, token e cobrança a configurar); campo só com URL
  (contraria FR-035).

## R8. Modelos de formulário de inscrição

- **Decisão**: registro de modelos em `lib/forms/` — `acampamento`, `festa`, `missao`, `simples`.
  Cada modelo exporta: schema Zod dos parâmetros do evento; fábrica do schema das respostas (recebe
  os parâmetros); cálculo de valor; colunas para lista/exportação; componente público do formulário
  e componente de edição dos parâmetros no painel. Dados comuns ficam em colunas da tabela
  `registrations`; respostas específicas em `answers jsonb`; pagamento em `payment jsonb`.
- **Racional**: FR-015/FR-016. Reaproveita as regras atuais (`lib/acampa/calc.ts`,
  `lib/festa-roca/types.ts`, `lib/projeto-missionario/types.ts`) parametrizadas.
- **Ajustes de regra**:
  - Acampamento: lote vigente = primeiro lote cuja data limite ≥ hoje (fuso de Brasília); depois
    do último, vale o último. Substitui a regra "primeiro sábado do mês", difícil de configurar.
    Desconto de dupla não acumula com desconto de pagamento (regra atual). Carnê: N parcelas
    mensais a partir do mês da inscrição. O campo `loteTravado` (não exposto na interface atual)
    não é mantido.
  - Festa: estoque de cada item = quantidade configurada − inscrições que escolheram o item.
    Calculado dentro de transação com `pg_advisory_xact_lock(event)`, sem contador separado.
  - Missão: períodos configuráveis (id, rótulo) + opção tempo integral.
- **Alternativas**: construtor livre de formulários (rejeitado na clarificação); uma tabela por
  modelo (migração a cada modelo novo).

## R9. Duplicidade e concorrência

- **Decisão**: índice único `(event_id, name_key, phone_key)` em `registrations` (nome normalizado
  sem acento/caixa + só dígitos do telefone). Edição concorrente com versão otimista: colunas
  `version int` em `events`, `participants`, `devotionals`; o UPDATE exige a versão lida e, se
  nada mudar, a ação devolve "registro alterado por outra pessoa".
- **Racional**: FR-021 e Edge Case de edição concorrente com mecanismo simples.

## R10. Importação de planilhas e repetidos

- **Decisão**: a leitura do arquivo (Excel/CSV) continua no navegador com `xlsx`; o navegador envia
  cabeçalhos + linhas (máx. 2.000 linhas) para Server Actions que validam com Zod, sugerem a
  correspondência de colunas (porta de `lib/import/mapper.ts` e `COLUMN_ALIASES`) e classificam as
  linhas em novos / atualizações / possíveis repetidos (porta de `lib/import/matcher.ts`,
  Levenshtein). A correspondência confirmada é salva por "assinatura" (cabeçalhos normalizados) em
  `import_mappings`. Nada é gravado antes da confirmação.
- **Racional**: reaproveita lógica existente e testada em uso; parse no cliente evita enviar o
  arquivo bruto ao servidor.
- **Risco registrado**: `xlsx@0.18.5` do npm tem vulnerabilidades conhecidas (prototype pollution,
  ReDoS) corrigidas só nas versões distribuídas pelo CDN da SheetJS. Mitigação: o parse roda apenas
  no navegador de usuário autenticado com permissão de importação, sobre arquivos que ele mesmo
  escolhe; o servidor recebe só JSON validado. Atualizar para o tarball oficial
  (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`) fica como tarefa opcional.

## R11. Exportações

- **Decisão**: Route Handlers `GET /api/painel/.../export?format=csv|pdf` com checagem de permissão
  e registro na auditoria. Primeiro passo da implementação do PDF: validar `jspdf` +
  `jspdf-autotable` rodando no Node (Route Handler); se não funcionar, o Route Handler devolve JSON
  autorizado/auditado e o PDF é montado no navegador. CSV em UTF-8 com BOM e separador `;` (abre direto no Excel pt-BR). PDF
  com `jspdf` + `jspdf-autotable` (já instalados) gerado no servidor. Exportação de participantes
  só inclui colunas de saúde se o usuário tiver `participantes.saude.ver`.

## R12. Mensagens (Contato e Quero servir)

- **Decisão**: as rotas `/api/contact` e `/api/servir` passam a gravar a mensagem no banco antes de
  tentar o e-mail; o resultado do e-mail fica em `email_sent_at`/`email_error`. Falha no e-mail
  devolve sucesso ao visitante (mensagem salva).

## R13. Virada (cutover) e dados antigos

- **Decisão**: script `scripts/cutover-redis.ts` executado manualmente pelo responsável:
  1. modo padrão `--dry-run`: lista e conta as chaves antigas por prefixo (`acampa:*`,
     `festa-roca:*`, `projeto-missionario:*`, `salt:participant:*`, `salt:participants:*`,
     `salt:import:*`, `salt:auth:*`, `salt:stats:*`);
  2. `--export <arquivo>` opcional grava um JSON local (fora do repositório) antes de excluir;
  3. `--confirm` exige digitar `EXCLUIR` no terminal; exclui com `SCAN` + `DEL` em lotes e imprime
     as quantidades.
  As chaves de rate limit (`@upstash/ratelimit`) não são tocadas. O código antigo (telas, rotas e
  módulos Redis) é removido no mesmo deploy da virada.
- **Racional**: FR-032/FR-033 e a regra da constituição sobre mudanças destrutivas.
- **Prefixos** levantados no código atual: `acampa:inscricao:*`, `acampa:inscricoes:ids`,
  `festa-roca:inscricao:*`, `festa-roca:estoque:*`, `festa-roca:vagas-dinheiro`,
  `projeto-missionario:*` e os `salt:*` de `lib/participant/constants.ts`. O dry-run mostra o que
  existe de fato antes de qualquer exclusão.

## R14. Fuso horário e datas

- **Decisão**: colunas `timestamptz`. Entrada no painel via `datetime-local` interpretada como
  `America/Sao_Paulo` (sem horário de verão desde 2019, offset fixo −03:00). Exibição com
  `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })` em `lib/format.ts`.
  `mes_referencia` dos devocionais é `date` (dia 1 do mês).

## R15. Redesign e design system

- **Decisão**: fontes Inter (corpo) e Inter Tight (títulos) via `next/font/google`, substituindo
  Poppins. Tokens do guia de estilo em `app/globals.css` (`@theme` do Tailwind 4) e mapeados nas
  variáveis do shadcn (`--primary` = roxo #92348C etc.), tema claro. Componentes shadcn existentes
  são reaproveitados; adicionar `form`-relacionados apenas se necessário (`radio-group`, `switch`,
  `sonner` já instalado). Referência visual: canvas do artifact (arquivos `.dc.html` no scratchpad
  da sessão de design).
- **Racional**: Princípio III; painel e site compartilham tokens (FR-046).

## R16. Testes

- **Decisão**: sem framework de testes (constituição). Validação por `npm run lint`,
  `npm run build` e roteiro manual em `quickstart.md`.
