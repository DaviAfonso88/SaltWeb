"use client";

import { useState } from "react";
import SectionLabel from "../SectionLabel";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ChevronRight, Camera } from "lucide-react";

const images = [
  { src: "/images/invasão.jpeg", alt: "Invasão", size: "large" },
  { src: "/images/acampamento.jpeg", alt: "Acampamento", size: "medium" },
  { src: "/images/orla.jpeg", alt: "Projeto Missiónario", size: "medium" },
  { src: "/images/avalanche.jpg", alt: "Avalanche", size: "small" },
  { src: "/images/pescador.jpeg", alt: "Pescador", size: "small" },
  { src: "/images/turma-de-minas.jpeg", alt: "Turma de Minas", size: "small" },
];

export default function Gallery() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "large":
        return "md:col-span-2 md:row-span-2";
      case "medium":
        return "md:col-span-1 md:row-span-1";
      default:
        return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <section className="section-spacing bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden noise-overlay">
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="container-elegant relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-1000 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <SectionLabel>
            Momentos
          </SectionLabel>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-foreground">
            Nossa Juventud em <span className="text-fill-gradient bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">Ação</span>
          </h2>
        </div>

        {/* Masonry-style grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 auto-rows-[200px]">
          {images.map((img, i) => (
            <GalleryItem
              key={i}
              img={img}
              index={i}
              sizeClasses={getSizeClasses(img.size)}
              onClick={() => setSelectedImage(i)}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a 
            href="#"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors duration-300 group"
          >
            <span className="text-lg font-medium">Ver mais fotos</span>
            <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-foreground/50 hover:text-foreground transition-colors duration-300"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={images[selectedImage].src} 
            alt={images[selectedImage].alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

interface GalleryItemProps {
  img: { src: string; alt: string; size: string };
  index: number;
  sizeClasses: string;
  onClick: () => void;
}

function GalleryItem({ img, index, sizeClasses, onClick }: GalleryItemProps) {
  const { ref: itemRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      ref={itemRef}
      className={`group relative overflow-hidden rounded-xl cursor-pointer ${sizeClasses} border border-border/30 shadow-lg hover:shadow-glow hover:shadow-primary/10 transition-all duration-500 hover-lift hover-glow ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <img
        src={img.src}
        alt={img.alt}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent flex flex-col items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="text-foreground text-lg font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-lg">
          {img.alt}
        </span>
      </div>
      
      {/* Icon indicator */}
      <div className="absolute top-4 right-4 p-2 rounded-full bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Camera className="w-4 h-4 text-foreground" />
      </div>
      
      {/* Hover border effect */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/30 rounded-xl transition-colors duration-500" />
    </div>
  );
}