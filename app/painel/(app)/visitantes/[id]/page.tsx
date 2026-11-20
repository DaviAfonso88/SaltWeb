import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { PageHeader } from "@/components/painel/PageHeader";
import { StatusBadge, VISITOR_STATUS } from "@/components/painel/StatusBadge";
import { VisitorActions } from "@/components/painel/visitantes/VisitorActions";
import { Button } from "@/components/ui/button";
import { can, requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { ageGroupLabel, howFoundLabel, interestLabels, visitorWhatsappUrl } from "@/lib/visitors/options";
import { getVisitor } from "@/lib/visitors/queries";

export const metadata = { title: "Visitante" };

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-text-3">{label}</dt>
      <dd className="m-0 font-medium">{children || "—"}</dd>
    </div>
  );
}

export default async function VisitorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("visitantes.ver");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const visitor = await getVisitor(id);
  if (!visitor) notFound();

  const whatsappUrl = visitorWhatsappUrl(visitor.whatsapp, visitor.name);
  const interests = interestLabels(visitor.interests);
  const status = VISITOR_STATUS[visitor.status];

  return (
    <>
      <PageHeader
        title={visitor.name}
        description={`Visitante · ${ageGroupLabel(visitor.ageGroup)}`}
        actions={<StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
      />
      <Link href="/painel/visitantes" className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
        ← Voltar aos visitantes
      </Link>

      <div className="grid max-w-3xl gap-6">
        <section aria-labelledby="contato-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="contato-titulo" className="font-display text-lg font-semibold">
              Contato
            </h2>
            {whatsappUrl ? (
              <Button asChild variant="outline" className="min-h-11 rounded-full">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden /> Chamar no WhatsApp
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </Button>
            ) : null}
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="WhatsApp">{visitor.whatsapp}</Item>
            <Item label="Grupo">{ageGroupLabel(visitor.ageGroup)}</Item>
            <Item label="Bairro e cidade">{visitor.neighborhood}</Item>
            <Item label="Como conheceu">{howFoundLabel(visitor.howFound)}</Item>
            {visitor.invitedBy ? <Item label="Convidado por">{visitor.invitedBy}</Item> : null}
            <Item label="Recebido em">{formatDateTime(visitor.createdAt)}</Item>
          </dl>
        </section>

        <section aria-labelledby="interesses-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="interesses-titulo" className="mb-3 font-display text-lg font-semibold">
            Gostaria de
          </h2>
          {interests.length ? (
            <ul className="flex flex-wrap gap-2">
              {interests.map((label) => (
                <li key={label}>
                  <StatusBadge tone="brand" className="px-3 py-1.5 text-sm">
                    {label}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-2">Não marcou nenhuma opção.</p>
          )}
        </section>

        {visitor.contactedAt ? (
          <p role="note" className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-text-2">
            Contatado por <strong className="font-semibold text-foreground">{visitor.contactedByLabel ?? "alguém da equipe"}</strong> em{" "}
            {formatDateTime(visitor.contactedAt)}.
          </p>
        ) : null}

        {visitor.emailError ? (
          <div role="note" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">O e-mail de aviso não foi enviado.</p>
            <p className="mt-1 text-text-2">O cadastro está salvo aqui. Motivo: {visitor.emailError}</p>
          </div>
        ) : null}

        {can(user, "visitantes.gerenciar") ? (
          <VisitorActions id={visitor.id} name={visitor.name} status={visitor.status} wasContacted={Boolean(visitor.contactedAt)} />
        ) : null}
      </div>
    </>
  );
}
