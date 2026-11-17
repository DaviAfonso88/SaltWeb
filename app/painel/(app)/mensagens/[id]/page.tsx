import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { MarkAsRead, MessageActions } from "@/components/painel/mensagens/MessageActions";
import { PageHeader } from "@/components/painel/PageHeader";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { can, requirePermission } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/format";
import { getMessage } from "@/lib/messages/queries";

export const metadata = { title: "Mensagem" };

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-text-3">{label}</dt>
      <dd className="m-0 font-medium">{children || "—"}</dd>
    </div>
  );
}

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("mensagens.ver");
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const message = await getMessage(id);
  if (!message) notFound();

  return (
    <>
      <MarkAsRead id={message.id} status={message.status} />
      <PageHeader
        title={message.name}
        description={message.kind === "contato" ? "Mensagem de contato" : "Quer servir"}
        actions={
          <StatusBadge tone={message.status === "new" ? "brand" : "neutral"}>
            {message.status === "new" ? "Nova" : message.status === "read" ? "Lida" : "Arquivada"}
          </StatusBadge>
        }
      />
      <Link href="/painel/mensagens" className="mb-6 inline-flex min-h-11 items-center text-sm font-semibold text-purple hover:text-purple-dark">
        ← Voltar às mensagens
      </Link>

      <div className="grid max-w-3xl gap-6">
        <section aria-labelledby="dados-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="dados-titulo" className="mb-4 font-display text-lg font-semibold">
            Dados
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Nome">{message.name}</Item>
            <Item label="Recebida em">{formatDateTime(message.createdAt)}</Item>
            {message.email ? (
              <Item label="E-mail">
                <a href={`mailto:${message.email}`} className="text-purple underline hover:text-purple-dark">
                  {message.email}
                </a>
              </Item>
            ) : null}
            {message.whatsapp ? <Item label="WhatsApp">{message.whatsapp}</Item> : null}
            {message.ministry ? <Item label="Ministério">{message.ministry}</Item> : null}
          </dl>
        </section>

        {message.body ? (
          <section aria-labelledby="texto-titulo" className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 id="texto-titulo" className="mb-4 font-display text-lg font-semibold">
              Mensagem
            </h2>
            <p className="whitespace-pre-wrap text-text-2">{message.body}</p>
          </section>
        ) : null}

        {message.emailError ? (
          <div role="note" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">O e-mail de aviso não foi enviado.</p>
            <p className="mt-1 text-text-2">A mensagem está salva aqui. Motivo: {message.emailError}</p>
          </div>
        ) : null}

        <MessageActions id={message.id} status={message.status} name={message.name} canManage={can(user, "mensagens.gerenciar")} />
      </div>
    </>
  );
}
