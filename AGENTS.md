# AGENTS.md — Saltweb

## Dev Commands

```bash
npm run dev      # dev server (http://localhost:3000)
npm run build   # production build
npm run lint   # ESLint (flat config)
npm start      # start production server

## Environment
`.env` contains sensitive credentials:
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

**Never commit `.env`** - it's already gitignored.

## Key Routes
| Route | Description |
|-------|-------------|
| `/` | Home |
| `/sobre` | About |
| `/eventos` | Events |
| `/podcast` | Podcast |
| `/devocional` | Devotional |
| `/acampa-salt` | Camp registration |
| `/contribua` | Donations |
| `/login` | Admin login |
| `/admin-camp` | Camp admin dashboard |
| `/admin-camp/participantes` | Participant list |
| `/admin-camp/participantes/[id]` | Participant profile |
| `/admin-camp/importar` | Import spreadsheets |
| `/admin-camp/usuarios` | User management |
| `/api/*` | API routes |

## Architecture
- Pages: `app/[page]/page.tsx`
- Data: `app/[page]/data.ts`
- Components: `app/components/` and `components/ui/`
- API: `app/api/[route]/route.ts`

## Camp Admin System (`/admin-camp`)

Full participant management system with Excel/CSV import, fuzzy matching, and role-based auth.

### Data Layer
- `lib/participant/types.ts` — Zod schemas, Participant type
- `lib/participant/storage.ts` — Redis CRUD, search, stats
- `lib/participant/constants.ts` — Column aliases, health conditions, permissions

### Smart Import
- `lib/import/mapper.ts` — Auto-maps spreadsheet columns to fields
- `lib/import/matcher.ts` — Fuzzy matching (Levenshtein) for deduplication
- Client-side Excel parsing with `xlsx` library

### Auth
- `lib/auth/config.ts` — Roles: admin, saude, lider, recepcao
- `lib/auth/session.ts` — Cookie-based sessions, bcrypt passwords
- `middleware.ts` — Protects `/admin-camp*` and `/api/camp-admin*`

### API Routes
- `POST /api/camp-admin/auth` — Login/logout
- `GET /api/camp-admin/stats` — Dashboard statistics
- `GET/POST /api/camp-admin/participants` — List/create participants
- `GET/PATCH/DELETE /api/camp-admin/participants/[id]` — CRUD
- `PATCH /api/camp-admin/participants/[id]/health` — Health info
- `POST /api/camp-admin/participants/[id]/notes` — Add observations
- `POST /api/camp-admin/participants/[id]/merge` — Merge participants
- `POST /api/camp-admin/import` — Import spreadsheet data
- `GET/POST/DELETE /api/camp-admin/users` — User management (admin only)

### First Run
After deployment, create an admin user via the API or Redis directly:
```bash
# Example: Create first admin user
curl -X POST http://localhost:3000/api/camp-admin/auth -H 'Content-Type: application/json' -d '{"username":"admin","password":"admin123"}'
```

## Testing
No test framework configured. Do not add tests without discussing with the user.
```
```

## Project Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4 + `@tailwindcss/postcss`
- shadcn/ui (New York style, RSC enabled) + Radix primitives
- TypeScript strict mode
- Zod + react-hook-form + @hookform/resolvers (form validation)
- Upstash Redis + Upstash Ratelimit (API rate limiting)
- Nodemailer (SMTP email)
- Sonner (toasts)
- Swiper (carousels)
- QRCode (QR generation)
- CVA (variant utilities)
- xlsx (Excel/CSV parsing)
- fuse.js (fuzzy search)
- bcryptjs (password hashing)
- recharts (dashboard charts)
- date-fns (date utilities)

## Path Aliases

`@/*` maps to project root — e.g. `@/components`, `@/lib`, `@/hooks`, `@/components/ui`

## shadcn/ui

- Components live in `components/ui/`
- Add: `npx shadcn@latest add <component>`
- Registry/presets: `components.json`

## Tailwind

- Tailwind 4 — config is `tailwind.config.ts` (still used by tooling)
- CSS variables theme with custom colors: `primary` (purple), `secondary` (amber), `background`/`foreground` (dark), `card`, `border`
- Custom animations: `animate-gradient-xy`, `animate-shimmer`, `animate-pulse-glow`
- Custom shadows: `glow`, `glow-lg`, `inner-glow`

## Fonts

- Body: `var(--font-inter)`
- Headings: `var(--font-poppins)`

## Data & Content

- `app/*/data.ts` files hold static content (events, podcast, acampas, etc.)
- `app/devocional/page.tsx` fetches from external JSON (GitHub Pages)
- Admin routes under `app/admin-*`

## API Routes

- `app/api/contact/route.ts` — contact form with nodemailer
- `app/api/acampa/route.ts` — acampamento registration with rate limiting
- Rate limits: check `lib/redis.ts` and Upstash config

## Environment Variables

See `.env` — do not expose or commit real credentials.

## New Events

- `app/festa-na-roca/` — Festa na Roça inscription page
- `app/admin-festa-na-roca/` — Admin panel for Festa na Roça registrations
- `app/api/festa-na-roca/register` — API route for registration
- `app/api/festa-na-roca/list` — API route to list registrations
- `app/projeto-missionario/` — Projeto Missionário SALT (12-14 jun) page
- `app/admin-projeto-missionario/` — Admin panel for Projeto Missionário
- `app/api/projeto-missionario/register` — API route for registration
- `app/api/projeto-missionario/list` — API route to list registrations
- `app/api/projeto-missionario/delete` — API route to delete registration
- `app/api/projeto-missionario/status` — API route to update status
- `lib/projeto-missionario/types.ts` — Zod schema, types, constants
- `lib/projeto-missionario/storage.ts` — Redis CRUD operations
- `lib/pdf/projeto-missionario.ts` — PDF export

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
