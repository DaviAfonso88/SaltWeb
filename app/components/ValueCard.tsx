"use client";

import React, { useState } from "react";
import {
  PlusCircle,
  MinusCircle,
  Lightbulb,
  Heart,
  Handshake,
} from "lucide-react";

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

  return (
    <div className="p-8 rounded-lg bg-gradient-to-br from-[#27272a] via-[#2e2e32] to-[#18181b] border border-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 relative">
      <div className="absolute top-4 left-4 text-primary">
        <IconComponent size={28} className="text-[#92348c]" />
      </div>
      <h3 className="text-xl font-semibold font-heading mb-2 text-foreground pt-8">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {displayDescription}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center text-sm font-semibold text-primary hover:text-primary-light transition-colors duration-300"
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
  );
}
