# AGENTS.md — Saltweb

## Dev Commands
```bash
npm run dev      # dev server (http://localhost:3000)
npm run build   # production build
npm run lint   # ESLint (flat config)
npm start      # start production server
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