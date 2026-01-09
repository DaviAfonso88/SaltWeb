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
    "inline-block px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:bg-transparent hover:shadow-[#e5e7eb]";

  const variantClasses = {
    default: "bg-[#92348c] text-white hover:bg-primary-light hover:shadow-lg ",
    outline: "border-2 border-[#92348c] text-primary hover:bg-[#92348c]",
    subtle: "bg-primary/5 text-primary hover:bg-primary/20",
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
