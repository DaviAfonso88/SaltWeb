import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-text-2",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-destructive/10 text-destructive",
  brand: "bg-purple-tint text-purple-dark",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const REGISTRATION_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pendente", tone: "warning" },
  confirmed: { label: "Confirmada", tone: "success" },
  cancelled: { label: "Cancelada", tone: "danger" },
};

export const PUBLICATION_STATUS: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  published: { label: "Publicado", tone: "success" },
  archived: { label: "Arquivado", tone: "warning" },
};

export const MESSAGE_STATUS: Record<string, { label: string; tone: Tone }> = {
  new: { label: "Nova", tone: "brand" },
  read: { label: "Lida", tone: "neutral" },
  archived: { label: "Arquivada", tone: "warning" },
};

export const VISITOR_STATUS: Record<string, { label: string; tone: Tone }> = {
  new: { label: "Novo", tone: "brand" },
  contacted: { label: "Contatado", tone: "success" },
  archived: { label: "Arquivado", tone: "neutral" },
};
