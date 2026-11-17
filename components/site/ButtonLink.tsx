import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "secondary" | "text";

const VARIANTS: Record<Variant, string> = {
  primary: "min-h-12 bg-primary px-[22px] text-primary-foreground hover:bg-purple-dark",
  dark: "min-h-11 bg-ink px-4 text-white hover:bg-ink/85",
  secondary: "min-h-12 border border-line-strong bg-white px-[22px] text-foreground hover:bg-sand",
  text: "min-h-11 px-0 text-purple hover:text-purple-dark",
};

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: Variant;
  /** Seta final: "next" para ir adiante, "external" para link externo. */
  icon?: "next" | "external";
};

/** Botão/link do sistema visual: 8 px de raio, alvo de toque ≥ 44 px. Externos abrem em nova aba e avisam leitores de tela. */
export function ButtonLink({ href, variant = "primary", icon, className, children, ...props }: Props) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const Icon = icon === "external" ? ArrowUpRight : icon === "next" ? ArrowRight : null;
  const small = variant === "text" || variant === "dark";
  const classes = cn(
    "inline-flex items-center gap-2 rounded-lg text-[15px] font-semibold no-underline transition-colors",
    VARIANTS[variant],
    variant === "text" && "gap-1.5",
    className,
  );
  const content = (
    <>
      {children}
      {Icon ? <Icon className={small ? "size-4" : "size-[18px]"} aria-hidden /> : null}
    </>
  );

  if (external) {
    const newTab = href.startsWith("http");
    return (
      <a href={href} className={classes} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
        {newTab ? <span className="sr-only"> (abre em nova aba)</span> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
