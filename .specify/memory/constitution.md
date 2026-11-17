<!--
Sync Impact Report
- Version change: template → 1.0.0 (ratificação inicial)
- Princípios definidos: I. Segurança e Privacidade por Padrão; II. Fonte de Dados Única e Validada;
  III. Interface Consistente e Acessível; IV. Server-First; V. Simplicidade
- Seções adicionadas: Restrições Técnicas; Fluxo de Desenvolvimento; Governance
- Templates: ✅ plan-template.md (Constitution Check genérico, compatível)
            ✅ spec-template.md (sem mudanças necessárias)
            ✅ tasks-template.md (testes opcionais, compatível com o Princípio de testes do projeto)
- TODOs: nenhum
-->

# Saltweb Constitution

## Core Principles

### I. Segurança e Privacidade por Padrão (NON-NEGOTIABLE)

- Toda página administrativa e toda operação de dados restrita MUST verificar, no servidor, uma
  sessão válida E a permissão específica da ação. O middleware é apenas a primeira barreira; ele
  nunca substitui a checagem na própria rota/ação.
- Dados pessoais (nomes, telefones, idades, dados de saúde, dados de menores) MUST NOT ser
  expostos por nenhuma rota pública. Rotas públicas só aceitam envio (inscrição, contato) e
  devolvem o mínimo necessário.
- Menor privilégio: cada usuário recebe só as permissões de que precisa. Ações sensíveis
  (excluir, exportar, alterar permissões) MUST ficar registradas em log de auditoria.
- Segredos vivem apenas em variáveis de ambiente; `.env` MUST NOT ser commitado.

Racional: o sistema guarda dados de jovens e adolescentes; um vazamento tem impacto real (LGPD).

### II. Fonte de Dados Única e Validada

- O banco relacional (Postgres) é a fonte de verdade para todo dado persistente: usuários,
  papéis, eventos, inscrições, devocionais e mensagens.
- O Redis é usado apenas para dados efêmeros (limite de requisições, cache, sessões); nenhum
  dado de negócio pode existir somente nele.
- Toda entrada externa (formulários, parâmetros, corpo de requisição) MUST ser validada com Zod
  na fronteira antes de tocar o banco.
- Mudanças de esquema MUST ser feitas por migrações versionadas no repositório.

### III. Interface Consistente e Acessível

- Componentes de UI MUST vir de shadcn/ui (`components/ui/`) e primitivas Radix; novos
  componentes seguem o mesmo padrão antes de criar algo do zero.
- O visual MUST seguir o guia de estilo aprovado do redesign (cores, tipografia, raios,
  espaçamentos) via tokens do Tailwind, sem valores soltos repetidos.
- Acessibilidade mínima: contraste WCAG AA, alvos de toque ≥ 44px, rótulos em todos os campos,
  navegação por teclado, e layout funcional a partir de 360px de largura sem rolagem horizontal.

### IV. Server-First

- Server Components por padrão; Client Components só onde há interatividade real.
- Busca de dados e verificação de permissão acontecem no servidor.
- TypeScript estrito; `any` MUST NOT ser usado sem justificativa explícita em comentário.

### V. Simplicidade

- Reutilizar antes de criar; resolver o problema atual (YAGNI).
- Nova dependência só com justificativa registrada no plano (o que resolve e por que as
  existentes não bastam).

## Restrições Técnicas

- Stack: Next.js 16 (App Router) + React 19, Tailwind CSS 4, shadcn/ui, TypeScript strict,
  Zod + react-hook-form, Postgres gerenciado (Neon), Upstash Redis (rate limit), Nodemailer.
- Alias de caminhos: `@/*` aponta para a raiz do projeto.
- Documentação de bibliotecas MUST ser consultada via Context7 antes de usar APIs novas ou
  pouco conhecidas.

## Fluxo de Desenvolvimento

- Trabalho guiado pelo Spec Kit: `/speckit.specify` → `/speckit.clarify` → `/speckit.plan` →
  `/speckit.tasks` → `/speckit.implement`.
- Antes de qualquer merge: `npm run lint` e `npm run build` MUST passar sem erros.
- O projeto não tem framework de testes. Testes automatizados só são adicionados após decisão
  explícita com o responsável; até lá, cada história é validada pelo roteiro de verificação
  manual do `quickstart.md` da feature.
- Mudanças destrutivas em dados de produção (exclusões em massa, limpeza de base) exigem
  confirmação explícita do responsável no momento da execução.

## Governance

- Esta constituição prevalece sobre outras práticas do repositório. `AGENTS.md` traz as
  orientações operacionais do dia a dia e não pode contradizê-la.
- Emendas são feitas por PR que altera este arquivo, atualiza o Sync Impact Report e aplica
  versionamento semântico (MAJOR: remoção/redefinição de princípio; MINOR: princípio ou seção
  nova; PATCH: redação).
- Todo plano (`plan.md`) MUST passar pelo Constitution Check; violações precisam de
  justificativa na seção Complexity Tracking.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
