import { ShieldCheck } from "lucide-react";

import { CONTACT_EMAIL } from "@/lib/site-info";

/** Aviso exibido em todo formulário público (FR-021a). */
export function PrivacyNotice() {
  return (
    <div className="flex gap-3 rounded-[10px] bg-sand p-4 text-sm text-text-2">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-purple" aria-hidden />
      <p>
        Usamos seus dados <strong>só para organizar o evento e falar com você</strong>. Eles ficam com a equipe da
        Juventude SALT responsável pelo evento e não são compartilhados com terceiros. Para corrigir ou apagar seus
        dados, escreva para{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-purple underline hover:text-purple-dark">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}
