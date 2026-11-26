import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Abre o WhatsApp da pessoa com o lembrete escrito; quem está no painel toca em enviar. */
export function ReminderButton({ href, name, label = "Lembrete" }: { href: string | null; name: string; label?: string }) {
  if (!href) return <span className="text-xs text-text-3">Telefone sem DDD</span>;
  return (
    <Button asChild variant="outline" className="min-h-11 rounded-full">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle aria-hidden /> {label}
        <span className="sr-only"> no WhatsApp para {name} (abre em nova aba)</span>
      </a>
    </Button>
  );
}
