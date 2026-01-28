import Link from "next/link";
import React from "react";

type BotaoPrimarioProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "subtle";
  className?: string;
  target?: string;
  rel?: string;
};

export default function BotaoPrimario({
  children,
  href,
  onClick,
  variant = "default",
  className = "",
  target,
  rel,
  ...props
}: BotaoPrimarioProps) {
  const baseClasses =
    "inline-flex items-center justify-center px-8 py-3.5 font-semibold rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background";

  const variantClasses = {
    default: "bg-primary text-white hover:bg-primary-light hover:shadow-glow hover:shadow-primary/50",
    outline: "border-2 border-primary/60 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-glow",
    subtle: "bg-primary/10 text-primary hover:bg-primary/20 hover:shadow-inner-glow",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const content = (
    <span className="flex items-center justify-center gap-2">{children}</span>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClasses}>
      {content}
    </button>
  );
}
