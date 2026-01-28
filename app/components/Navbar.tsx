"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import BotaoPrimario from "./BotaoPrimario";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/sobre", label: "SOBRE" },
  { href: "/eventos", label: "EVENTOS" },
  { href: "/devocional", label: "DEVOCIONAL" },
  { href: "/podcast", label: "PODCAST" },
  { href: "/contribua", label: "CONTRIBUA" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        hasScrolled
          ? "bg-card/80 backdrop-blur-xl shadow-lg shadow-primary/5 border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="container-elegant py-5 flex justify-between items-center">
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/SALT LOGO PRINCIPAL FUNDO ESCURO.png"
              alt="Juventude Salt Logo"
              width={50}
              height={50}
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex flex-grow justify-center">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-medium text-sm text-foreground/80 hover:text-primary transition-all duration-300 relative group tracking-wide uppercase"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden md:flex flex-shrink-0">
          <BotaoPrimario href="/#contato" className="w-full uppercase">
            Contato
          </BotaoPrimario>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border/50 transition-all duration-300 px-6 py-6">
          <ul className="flex flex-col items-start gap-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-semibold text-base text-foreground/80 hover:text-primary transition-colors duration-300 uppercase tracking-wide"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 w-full">
            <BotaoPrimario href="/#contato" className="  w-full">
              Contato
            </BotaoPrimario>
          </div>
        </div>
      )}
    </header>
  );
}
