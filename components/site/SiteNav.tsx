"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ButtonLink } from "@/components/site/ButtonLink";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
  { href: "/eventos", label: "Eventos" },
  { href: "/devocional", label: "Devocional" },
  { href: "/podcast", label: "Podcast" },
  { href: "/contribua", label: "Contribua" },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-site flex items-center gap-[clamp(16px,3vw,40px)] py-3.5">
        <Link href="/" className="flex min-h-11 shrink-0 items-center" aria-label="Juventude SALT — página inicial">
          <Image src="/images/salt-logo-ink.png" alt="" width={905} height={255} className="h-7 w-auto" priority />
        </Link>

        <nav aria-label="Principal" className="hidden min-w-0 flex-1 md:flex">
          <ul className="mx-auto flex items-center gap-1">
            {LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center whitespace-nowrap px-3 text-[15px] transition-colors",
                      active
                        ? "font-semibold text-foreground underline decoration-purple decoration-2 underline-offset-[10px]"
                        : "font-medium text-[#4b4952] hover:text-foreground",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ButtonLink href="/#contato" className="hidden min-h-11 whitespace-nowrap px-[18px] md:inline-flex">
            Fale conosco
          </ButtonLink>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-lg border border-line-strong bg-white text-foreground hover:bg-sand md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </SheetTrigger>
            {/* O conteúdo do Sheet vai para um portal fora de .site: a classe leva os tokens do site junto. */}
            <SheetContent side="right" className="site w-[min(86vw,360px)] gap-0 bg-white p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Navegação do site</SheetDescription>
              <nav aria-label="Menu móvel" className="mt-14 grid gap-1 p-4">
                {LINKS.map((l) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <SheetClose key={l.href} asChild>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center rounded-lg px-4 text-lg",
                          active ? "bg-purple-tint font-semibold text-purple-dark" : "font-medium text-foreground hover:bg-sand",
                        )}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                <SheetClose asChild>
                  <Link
                    href="/#contato"
                    className="mt-3 flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:bg-purple-dark"
                  >
                    Fale conosco
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
