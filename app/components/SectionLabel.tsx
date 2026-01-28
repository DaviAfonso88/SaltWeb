import React from "react";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
  withMargin?: boolean;
};

export default function SectionLabel({ 
  children, 
  className = "",
  withMargin = true 
}: SectionLabelProps) {
  return (
    <span className={`inline-block text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase ${withMargin ? 'mb-4' : ''} ${className}`}>
      {children}
    </span>
  );
}
