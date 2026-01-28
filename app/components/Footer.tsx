"use client";

import Link from "next/link";
import { Instagram, Smartphone, Podcast } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "/sobre", label: "Sobre" },
  { href: "/eventos", label: "Eventos" },
  { href: "/devocional", label: "Devocional" },
  { href: "/podcast", label: "Podcast" },
  { href: "/contribua", label: "Contribua" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-card via-background to-card border-t border-border/50 text-foreground py-16">
      <div className="container-elegant">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Column 1: Logo & Social */}
          <div className="space-y-6">
            <div className="flex justify-center md:justify-start">
              <Link href="/" className="transition-transform duration-300 hover:scale-105">
                <Image
                  src="/images/SALT LOGO PRINCIPAL FUNDO ESCURO.png"
                  alt="Juventude Salt Logo"
                  width={70}
                  height={70}
                  className="drop-shadow-lg"
                />
              </Link>
            </div>
            <p className="text-foreground/60 text-sm font-medium uppercase tracking-wide">Nossas redes:</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://www.instagram.com/saltjuventude_/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-card/50 border border-border/50 text-foreground/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=%2B553192919718&text=OL%C3%81%21+Acabei+de+visitar+o+site+da+Salt+Juventude+e+fiquei+interessado%28a%29+no+trabalho+de+voc%C3%AAs.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-card/50 border border-border/50 text-foreground/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              >
                <Smartphone size={20} />
              </a>
              <a
                href="https://open.spotify.com/show/0tXOSImjZs2Tl8ZKA9cVpD?si=d67a02d3afe2499f"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-card/50 border border-border/50 text-foreground/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              >
                <Podcast size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold uppercase tracking-wider text-foreground">
              Links
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground/60 hover:text-primary transition-colors duration-300 relative group inline-block"
                  >
                    <span className="relative">{link.label}</span>
                    <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Location */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold uppercase tracking-wider text-foreground">
              Localização
            </h3>
            <p className="text-foreground/60 leading-relaxed">
              Primeira Igreja Batista em Lagoa Santa <br />
              Rua Jair Gonçalves Bastos, 64 <br />
              Jardim Ipê, Lagoa Santa - MG
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 text-center text-foreground/40 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Juventude SALT. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
