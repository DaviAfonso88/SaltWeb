import { and, count, eq, gte } from "drizzle-orm";
import Link from "next/link";

import { TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/painel/PageHeader";
import { can, requireUser } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { events, messages, registrations, visitors } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { listRetentionWarnings } from "@/lib/participants/health";

export const metadata = { title: "Painel" };

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <p className="text-sm text-text-2">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold tracking-tight">{value}</p>
    </Link>
  );
}

export default async function PanelHome() {
  const user = await requireUser();
  const db = getDb();

  const cards: { label: string; value: number; href: string }[] = [];

  if (can(user, "inscricoes.ver")) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(registrations)
      .where(eq(registrations.status, "pending"));
    cards.push({ label: "Inscrições pendentes", value: total, href: "/painel/inscricoes?situacao=pending" });
  }
  if (can(user, "eventos.gerenciar")) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(events)
      .where(and(eq(events.publication, "published"), gte(events.startsAt, new Date())));
    cards.push({ label: "Próximos eventos publicados", value: total, href: "/painel/eventos" });
  }
  if (can(user, "mensagens.ver")) {
    const [{ total }] = await db.select({ total: count() }).from(messages).where(eq(messages.status, "new"));
    cards.push({ label: "Mensagens novas", value: total, href: "/painel/mensagens" });
  }
  if (can(user, "visitantes.ver")) {
    const [{ total }] = await db.select({ total: count() }).from(visitors).where(eq(visitors.status, "new"));
    cards.push({ label: "Visitantes sem contato", value: total, href: "/painel/visitantes?situacao=new" });
  }

  // Fichas de saúde de acampamentos encerrados há mais de 60 dias: lembrete de exclusão manual.
  const retention = can(user, "participantes.excluir") ? await listRetentionWarnings() : [];

  return (
    <>
      <PageHeader title={`Olá, ${user.name.split(" ")[0]}`} description={`Você está como ${user.roleName}.`} />
      {retention.length ? (
        <section aria-labelledby="retencao-titulo" className="mb-6 rounded-2xl border border-warning/40 bg-warning-tint p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div className="grid gap-2">
              <h2 id="retencao-titulo" className="font-semibold">
                Dados de saúde para excluir
              </h2>
              <p className="text-sm">
                Estes acampamentos terminaram há mais de 60 dias e ainda guardam fichas de saúde. Exporte o que precisar e exclua os participantes para não manter dados sensíveis sem necessidade.
              </p>
              <ul className="grid gap-1 text-sm">
                {retention.map((r) => (
                  <li key={r.eventId}>
                    <Link href={`/painel/participantes?evento=${r.eventId}`} className="font-semibold underline underline-offset-2">
                      {r.title}
                    </Link>{" "}
                    <span className="text-text-2">
                      · terminou em {formatDate(r.endedAt)} · {r.healthRecords} {r.healthRecords === 1 ? "ficha" : "fichas"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {cards.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-2">Use o menu para acessar as áreas disponíveis para o seu papel.</p>
      )}
    </>
  );
}
