import { ArrowUpRight, Headphones, Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SEXTAS } from "@/lib/programacoes/catalog";
import { getProgramacoes } from "@/lib/programacoes/queries";
import { isEncontro, ritmoDasSextas } from "@/lib/programacoes/ritmo";
import { describeSchedule } from "@/lib/programacoes/schedule";
import { CHURCH_NAME, CHURCH_URL, WHATSAPP_URL } from "@/lib/site-info";

const NAV = [
  { href: "/sobre", label: "Sobre" },
  { href: "/eventos", label: "Eventos" },
  { href: "/devocional", label: "Devocional" },
  { href: "/podcast", label: "Podcast" },
  { href: "/contribua", label: "Contribua" },
  { href: "/visitante", label: "Primeira vez?" },
];

const SOCIAL = [
  { href: "https://www.instagram.com/saltjuventude_/", label: "Instagram da Juventude SALT", icon: Instagram },
  { href: WHATSAPP_URL, label: "WhatsApp da Juventude SALT", icon: MessageCircle },
  { href: "https://open.spotify.com/show/0tXOSImjZs2Tl8ZKA9cVpD", label: "Podcast no Spotify", icon: Headphones },
];

const MAP_URL = "https://www.google.com/maps?q=Primeira+Igreja+Batista+em+Lagoa+Santa,+MG";

/** Nome da igreja com link para o site dela (abre em nova aba e avisa leitores de tela). */
function ChurchLink({ className }: { className?: string }) {
  return (
    <a
      href={CHURCH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-[#7a6b80] underline-offset-4 hover:decoration-white ${className ?? ""}`}
    >
      {CHURCH_NAME}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

const TITLE = "text-[13px] font-semibold uppercase tracking-[0.1em] text-[#b7aebb]";

export async function SiteFooter() {
  const programacoes = await getProgramacoes();
  const sextas = ritmoDasSextas(programacoes);
  const meetings = [
    ...(sextas.next ? [{ name: SEXTAS.titulo, when: `Próxima: ${sextas.next.titulo} · ${sextas.next.quando}` }] : []),
    ...programacoes.filter(isEncontro).map((p) => ({ name: p.titulo, when: describeSchedule(p.schedule).footer })),
  ];

  return (
    <footer className="bg-night text-[15px] leading-relaxed text-[#f5f3f6]">
      <div className="container-site pb-8 pt-[clamp(56px,6vw,80px)]">
        <div className="grid gap-x-8 gap-y-10 border-b border-[#342b38] pb-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Image src="/images/SALT LOGO PRINCIPAL FUNDO ESCURO.png" alt="Juventude SALT" width={905} height={255} className="h-7 w-auto self-start" />
            <p className="max-w-[280px] text-[#b7aebb]">
              Juventude da <ChurchLink className="text-[#f5f3f6]" />. Amar missões, fazer discípulos e servir à Igreja.
            </p>
            <ul className="flex gap-2">
              {SOCIAL.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (abre em nova aba)`}
                    className="flex size-11 items-center justify-center rounded-lg border border-[#3a3040] transition-colors hover:bg-white/10"
                  >
                    <Icon className="size-[18px]" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Rodapé" className="flex flex-col gap-1">
            <h2 className={`${TITLE} mb-2`}>Navegação</h2>
            <ul className="grid gap-0.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-9 items-center text-[#f5f3f6] hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className={TITLE}>Encontros</h2>
            <ul className="grid gap-3">
              {meetings.map((m) => (
                <li key={m.name}>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-[#b7aebb]">{m.when}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className={TITLE}>Endereço</h2>
            <address className="not-italic">
              <ChurchLink />
              <br />
              R. Jair Gonçalves Bastos, 64
              <br />
              Jardim Ipê, Lagoa Santa – MG
            </address>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-fit items-center gap-1.5 font-semibold underline decoration-[#7a6b80] underline-offset-4 hover:decoration-white"
            >
              Como chegar <ArrowUpRight className="size-4" aria-hidden />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 pt-6 text-sm text-[#b7aebb]">
          <p>© {new Date().getFullYear()} Juventude SALT. Todos os direitos reservados.</p>
          <p>
            <ChurchLink />
          </p>
        </div>
      </div>
    </footer>
  );
}
