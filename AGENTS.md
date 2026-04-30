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
| `/api/*` | API routes |

## Architecture
- Pages: `app/[page]/page.tsx`
- Data: `app/[page]/data.ts`
- Components: `app/components/` and `components/ui/`
- API: `app/api/[route]/route.ts`

## Testing
No test framework configured. Do not add tests without discussing with the user.
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
