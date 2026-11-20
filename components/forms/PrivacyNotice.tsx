import { ShieldCheck } from "lucide-react";

import { CONTACT_EMAIL } from "@/lib/site-info";

/** Aviso exibido em todo formulário público (FR-021a). */
export function PrivacyNotice({
  purpose = "organizar o evento e falar com você",
  keeper = "responsável pelo evento",
}: {
  /** Para que os dados são usados (texto em destaque). */
  purpose?: string;
  /** Quem da equipe guarda os dados. */
  keeper?: string;
}) {
  return (
    <div className="flex gap-3 rounded-[10px] bg-sand p-4 text-sm text-text-2">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-purple" aria-hidden />
      <p>
        Usamos seus dados <strong>só para {purpose}</strong>. Eles ficam com a equipe da Juventude SALT {keeper} e não
        são compartilhados com terceiros. Para corrigir ou apagar seus dados, escreva para{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-purple underline hover:text-purple-dark">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
