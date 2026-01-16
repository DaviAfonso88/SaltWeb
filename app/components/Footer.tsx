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
    <footer className="bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#1f1f23] text-foreground py-10 md:py-20 lg:py-15">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-8 lg:gap-16 text-center md:text-left">
          {/* Column 1: Identidade */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/SALT LOGO PRINCIPAL FUNDO ESCURO.png"
                alt="Juventude Salt Logo"
                width={50}
                height={50}
              />
            </Link>{" "}
            <p className="text-muted-foreground mb-6 mt-2">
              Entre em contato conosco!
            </p>
            <div className="flex justify-center md:justify-start space-x-6">
              <a
                href="https://www.instagram.com/saltjuventude_/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-card hover:scale-110 hover:shadow-[0_0_20px_rgba(146,52,140,0.5)] transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=%2B553192919718&text=OL%C3%81%21+Acabei+de+visitar+o+site+da+Salt+Juventude+e+fiquei+interessado%28a%29+no+trabalho+de+voc%C3%AAs.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-card hover:scale-110 hover:shadow-[0_0_20px_rgba(146,52,140,0.5)] transition-all duration-300"
                aria-label="WhatsApp"
              >
                <Smartphone size={24} className="text-primary" />{" "}
              </a>
              <a
                href="https://open.spotify.com/show/0tXOSImjZs2Tl8ZKA9cVpD?si=d67a02d3afe2499f"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-card hover:scale-110 hover:shadow-[0_0_20px_rgba(146,52,140,0.5)] transition-all duration-300"
                aria-label="Spotify"
              >
                <Podcast size={24} className="text-primary" />{" "}
              </a>
            </div>
          </div>

          {/* Column 2: Blog/Links */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold font-heading mb-4">Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold font-heading mb-4">
              Localização
            </h3>
            <p className="text-muted-foreground">
              Primeira Igreja Batista em Lagoa Santa <br />
              Rua Jair Gonçalves Bastos | 64 | Jardim Ipê
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-500 text-center text-muted-foreground text-sm">
          <p>
            &copy; {new Date().getFullYear()} Juventude SALT. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
