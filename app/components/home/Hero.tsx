"use client";

import { useEffect, useRef, useState } from "react";
import BotaoPrimario from "../BotaoPrimario";
import TypewriterEffect from "../TypewriterEffect";
import Image from "next/image";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Modern Background - Animated Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background animate-gradient-slow" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Floating orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, rgba(146, 52, 140, 0.4) 0%, transparent 70%)",
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2 + scrollY * 0.1}px)`,
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, rgba(167, 78, 159, 0.4) 0%, transparent 70%)",
            transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5 + scrollY * 0.15}px)`,
            animationDelay: "1s",
          }}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 right-20 w-2 h-2 bg-primary/30 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        />
        <div 
          className="absolute bottom-40 left-20 w-3 h-3 bg-primary/20 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div 
          className="absolute top-1/3 left-1/3 w-4 h-4 border border-primary/10 rounded-full animate-spin-slow"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="relative z-10 container-elegant py-32 flex flex-col md:flex-row items-center justify-between gap-16">
        {/* Left Section: Content */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-8">
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold font-heading text-foreground tracking-tight leading-[1.1]">
              Juventude <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Salt</span>
            </h1>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary-light">
              <TypewriterEffect text="Seja luz, seja Salt" />
            </h2>
          </div>

          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto md:mx-0 relative">
            <span className="relative z-10">
              Uma juventude que vive a fé com propósito, amizade e impacto,
              conectando pessoas e transformando vidas.
            </span>
            <span className="absolute -inset-x-6 -inset-y-2 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl blur-lg opacity-0 hover:opacity-100 transition-opacity duration-500" />
          </p>

          <div className="flex justify-center md:justify-start">
            <BotaoPrimario
              href="/eventos"
              className="text-base md:text-lg relative overflow-hidden group hover-lift"
            >
              <span className="relative z-10">Nossos eventos</span>
              <span className="absolute inset-0 bg-primary-light/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            </BotaoPrimario>
          </div>
        </div>

        {/* Right Section: Image with enhanced effects */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <div 
            className="relative group"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.5}deg) rotateX(${-mousePosition.y * 0.5}deg)`,
              transition: "transform 0.3s ease-out",
            }}
          >
            {/* Glow effect behind */}
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse-glow scale-75" />
            
            {/* Animated ring */}
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-spin-slow scale-90" />
            <div className="absolute inset-0 border border-primary/10 rounded-full animate-spin-slow scale-110" style={{ animationDirection: "reverse", animationDuration: "25s" }} />
            
            {/* Main image */}
            <Image
              src="/images/SALT SIMBOLO DEGRADE.png"
              alt="Juventude Salt Logo"
              width={400}
              height={400}
              className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 transform transition-all duration-500 group-hover:scale-105 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs uppercase tracking-widest text-foreground/50">Scroll</span>
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-bounce-gentle" />
        </div>
      </div>
    </section>
  );
}