# Site da Juventude SALT

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwind-css\&logoColor=white)
![Postgres](https://img.shields.io/badge/Postgres-Neon-336791?logo=postgresql\&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

Site oficial e painel administrativo da **Juventude SALT**, o ministério de jovens da Primeira Igreja Batista em Lagoa Santa (MG).

---

## 📖 Sobre o projeto

O projeto tem duas partes:

* **Site público**: início, sobre, eventos (com inscrição online), podcast, devocionais e contribuição.
* **Painel administrativo** (`/painel`): a equipe cria eventos e formulários de inscrição, acompanha inscritos, gerencia participantes dos acampamentos (inclusive fichas de saúde), publica devocionais, lê mensagens do site e controla quem acessa o quê.

Os dados vivem em **Postgres (Neon)**. O **Redis (Upstash)** é usado apenas para limitar requisições (rate limit).

> O painel guarda dados pessoais de inscritos, muitos menores de idade, e dados de saúde. O acesso é por papéis e permissões, e as ações sensíveis ficam registradas em auditoria.

---

## 🚀 Tecnologias

* **Next.js 16 (App Router, Server Actions)** e **React 19**
* **TypeScript** em modo estrito
* **Tailwind CSS 4**, **shadcn/ui** e **Radix UI**
* **Postgres no Neon** com **Drizzle ORM**
* **Zod** para validação
* **Upstash Redis / Ratelimit** para rate limit
* **Nodemailer** (aviso de mensagens), **jsPDF** (exportação em PDF), **xlsx** (importação de planilhas)
* **Vercel** para deploy

---

## 🧱 Estrutura

```
app/
 ├─ (site)/            # site público (home, sobre, eventos, podcast, devocional, contribua)
 ├─ painel/            # painel administrativo (login, eventos, inscrições, participantes, ...)
 └─ api/               # inscrição pública, contato, "quero servir" e exportações do painel
components/
 ├─ site/              # componentes do site público
 ├─ painel/            # componentes do painel, por área
 ├─ forms/             # formulários de inscrição pública
 └─ ui/                # shadcn/ui
lib/                   # regra de negócio por domínio (db, auth, events, registrations, participants, ...)
drizzle/               # migrações SQL
scripts/               # seed do banco e script da virada do Redis
specs/                 # especificação, plano, tarefas e design do painel
```

---

## 🛠️ Como rodar localmente

### Pré-requisitos

* Node.js 20+ (desenvolvido com Node 24)
* NPM
* Um banco Postgres no [Neon](https://neon.tech) (um branch de desenvolvimento basta)

### Instalação

```bash
git clone <url-do-repositorio>
cd saltweb
npm install
```

### Variáveis de ambiente

Crie `.env.local` (não é versionado) com:

| Variável | Para quê |
|----------|----------|
| `DATABASE_URL` | Conexão com o Postgres (Neon) |
| `SETUP_TOKEN` | Código para criar o primeiro administrador em `/painel/setup` |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limit |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` | Envio de e-mail (mensagens do site) |

### Banco de dados

```bash
npm run db:migrate   # cria as tabelas
npm run db:seed      # papéis padrão, evento do Acampa SALT 2026 e devocionais
```

Depois de alterar `lib/db/schema.ts`, gere uma nova migração com `npm run db:generate`.

### Executando

```bash
npm run dev          # http://localhost:3000
```

No primeiro acesso, abra `/painel/setup`, informe o `SETUP_TOKEN` e crie o administrador. Depois entre por `/painel/login` e crie os demais usuários em **Usuários** (cada um recebe um papel).

### Outros comandos

```bash
npm run lint         # ESLint
npm run build        # build de produção
npm start            # servidor de produção
```

---

## 🔄 Virada do sistema antigo

A versão anterior guardava inscrições, participantes e usuários do `/admin-camp` no Redis. Esses dados **não são migrados** e devem ser excluídos na virada, com o script:

```bash
npm run cutover:redis                              # simulação: só conta as chaves (padrão)
npm run cutover:redis -- --export ../cutover.json  # cópia local antes de excluir (guarde fora do repositório)
npm run cutover:redis -- --confirm                 # exclui, depois de digitar EXCLUIR
```

Roteiro: deploy → `db:migrate` → `db:seed` → `/painel/setup` → simulação → (opcional) exportação → `--confirm`. O script preserva as chaves de rate limit e registra a execução na auditoria.

---

## 🌍 Deploy

O deploy é feito pela **Vercel**. Configure as variáveis de ambiente acima no projeto e rode as migrações no banco de produção antes de publicar.

---

## 👨‍💻 Desenvolvido por

<table>
  <tr>
    <td align="center">
      <a href="#">
         <img src="https://avatars.githubusercontent.com/u/89953265?v=4" width="100px;" alt="Foto de Davi Afonso no GitHub"/><br>
        <sub>
          <b>Davi Afonso</b>
        </sub>
      </a>
    </td>
</table>
