import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

type BotaoPrimarioProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "subtle";
  className?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
};

export default function BotaoPrimario({
  children,
  href,
  onClick,
  variant = "default",
  className = "",
  target,
  rel,
  disabled = false,
  ...props
}: BotaoPrimarioProps) {

  // Map our variants to shadcn variants
  const getVariant = () => {
    switch (variant) {
      case "outline":
        return "outline";
      case "subtle":
        return "secondary";
      case "default":
      default:
        return "default";
    }
  };

  const content = (
    <span className="flex items-center justify-center gap-2">{children}</span>
  );

  if (href) {
    return (
      <Button
        variant={getVariant()}
        size="lg"
        className={className}
        disabled={disabled}
        asChild
        onClick={onClick}
        {...props}
      >
        <Link href={href} target={target} rel={rel}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant={getVariant()}
      size="lg"
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {content}
    </Button>
  );
}
