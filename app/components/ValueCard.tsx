"use client";

import { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Lightbulb,
  Heart,
  Handshake,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ValueCardProps = {
  icon: string;
  title: string;
  description: string;
  initialChars?: number;
};

const iconMap: { [key: string]: React.ElementType } = {
  Lightbulb: Lightbulb,
  Heart: Heart,
  Handshake: Handshake,
};

export default function ValueCard({
  icon,
  title,
  description,
  initialChars = 150,
}: ValueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = iconMap[icon] || Lightbulb;

  const needsTruncation = description.length > initialChars;
  const displayDescription =
    needsTruncation && !isExpanded
      ? `${description.substring(0, initialChars)}...`
      : description;

  const { ref: cardRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div 
      ref={cardRef}
      className={`p-8 rounded-2xl bg-card/50 border border-border/50 shadow-lg transition-all duration-700 hover:border-primary/30 hover:shadow-glow hover:shadow-primary/10 hover:-translate-y-2 hover-glow group relative overflow-hidden ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500" />

      <div className="relative z-10">
        <div className="inline-flex p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-4">
          <IconComponent size={28} className="text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold font-heading mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {displayDescription}
        </p>
        
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center text-sm font-semibold text-primary hover:text-primary-light transition-colors duration-300 hover-lift"
          >
            {isExpanded ? (
              <>
                <MinusCircle className="h-4 w-4 mr-1" /> Ler Menos
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" /> Ler Mais
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}