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
    <footer className="bg-gradient-to-br from-[#18181b] via-[#27272a] to-[#1f1f23] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Column 1: Logo & Social */}
          <div className="space-y-4">
            <div className="flex justify-center md:justify-start">
              <Link href="/">
                <Image
                  src="/images/SALT LOGO PRINCIPAL FUNDO ESCURO.png"
                  alt="Juventude Salt Logo"
                  width={60}
                  height={60}
                />
              </Link>
            </div>
            <p className="text-gray-400">Nossas redes:</p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://www.instagram.com/saltjuventude_/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=%2B553192919718&text=OL%C3%81%21+Acabei+de+visitar+o+site+da+Salt+Juventude+e+fiquei+interessado%28a%29+no+trabalho+de+voc%C3%AAs.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Smartphone size={24} />
              </a>
              <a
                href="https://open.spotify.com/show/0tXOSImjZs2Tl8ZKA9cVpD?si=d67a02d3afe2499f"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <Podcast size={24} />
              </a>
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wider">
              Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 relative group"
                  >
                    <span>{link.label}</span>
                    <span className="absolute bottom-[-2px] left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold uppercase tracking-wider">
              Localização
            </h3>
            <p className="text-gray-400">
              Primeira Igreja Batista em Lagoa Santa <br />
              Rua Jair Gonçalves Bastos, 64 <br />
              Jardim Ipê, Lagoa Santa - MG
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Juventude SALT. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
