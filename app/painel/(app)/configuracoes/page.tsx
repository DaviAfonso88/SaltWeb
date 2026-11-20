import { AlertTriangle, MapPin } from "lucide-react";

import { ProgramacaoForm } from "@/components/painel/configuracoes/ProgramacaoForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { requirePermission } from "@/lib/auth/guard";
import { SEXTAS } from "@/lib/programacoes/catalog";
import { getProgramacoesAdmin, type Programacao } from "@/lib/programacoes/queries";
import { conflitosDasSextas, isEncontro, isSexta, ritmoDasSextas } from "@/lib/programacoes/ritmo";
import { describeSchedule } from "@/lib/programacoes/schedule";

export const metadata = { title: "Configurações" };

const fullDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
const formatDay = (iso: string) => fullDate.format(new Date(`${iso}T00:00:00Z`)).replace(".", "");
const joinNames = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} e ${names.at(-1)}` : names[0]);

function Forms({ items }: { items: Programacao[] }) {
  return items.map((p) => (
    <ProgramacaoForm
      // Remonta ao salvar para trazer a nova versão (controle de edição concorrente).
      key={`${p.slug}-${p.version}`}
      programacao={{ slug: p.slug, titulo: p.titulo, schedule: p.schedule, version: p.version }}
    />
  ));
}

export default async function ConfiguracoesPage() {
  await requirePermission("eventos.gerenciar");
  const programacoes = await getProgramacoesAdmin();
  const now = new Date();
  const ritmo = ritmoDasSextas(programacoes, now);
  const conflitos = conflitosDasSextas(programacoes, now);
  const proximas = ritmo.items.filter((i) => i.date).toSorted((a, b) => a.date!.localeCompare(b.date!));
  const encontros = programacoes.filter(isEncontro);
  const semAgenda = encontros.filter((p) => p.semAgenda);

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dia e horário das programações fixas. Ao salvar, o site (home, rodapé, Eventos, Sobre e Primeira vez) passa a mostrar o novo horário."
      />

      <div className="grid max-w-3xl gap-10">
        <section aria-labelledby="sextas-titulo" className="grid gap-5">
          <div className="grid gap-1">
            <h2 id="sextas-titulo" className="font-display text-xl font-semibold">
              {SEXTAS.titulo}
            </h2>
            <p className="text-sm text-text-2">
              Ritmo do mês: cada sexta tem um encontro diferente. O site mostra a próxima em destaque. A 5ª sexta só acontece nos
              meses que têm cinco sextas.
            </p>
          </div>

          {proximas.length ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-semibold">Próximas datas</h3>
              <ol className="grid gap-2 text-sm">
                {proximas.map((i) => (
                  <li key={i.slug} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                    <span>
                      <span className="font-semibold">{i.titulo}</span> <span className="text-text-3">· {i.tag}</span>
                    </span>
                    <span className="tabular-nums text-text-2">
                      {formatDay(i.date!)}
                      {i.time ? ` · ${i.time}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {conflitos.length ? (
            <div role="note" className="flex gap-3 rounded-2xl border border-warning/40 bg-warning-tint p-4 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <div className="grid gap-1">
                <p className="font-semibold">Programações no mesmo dia</p>
                <ul className="grid gap-0.5 text-text-2">
                  {conflitos.map((c) => (
                    <li key={c.titulos.join("|")}>
                      {joinNames(c.titulos)} caem juntas em {formatDay(c.primeiraData)}
                      {c.vezes > 1 ? ` e em mais ${c.vezes - 1} ${c.vezes - 1 === 1 ? "data" : "datas"} nos próximos meses` : ""}. Ajuste a
                      semana do mês de uma delas.
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          <Forms items={programacoes.filter(isSexta)} />
        </section>

        <section aria-labelledby="encontros-titulo" className="grid gap-5">
          <h2 id="encontros-titulo" className="font-display text-xl font-semibold">
            Células
          </h2>
          {semAgenda.length ? (
            <div role="note" className="flex gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-purple" aria-hidden />
              <div className="grid gap-1">
                <p className="font-semibold">{joinNames(semAgenda.map((p) => p.titulo))}</p>
                <p className="text-text-2">
                  Divididas por bairro: cada célula tem o próprio dia e horário, por isso não há horário para configurar aqui. O site
                  mostra &ldquo;{describeSchedule(semAgenda[0].schedule).long}&rdquo; e leva quem quer participar ao cadastro de
                  visitante, onde a pessoa informa o bairro.
                </p>
              </div>
            </div>
          ) : null}
          <Forms items={encontros.filter((p) => !p.semAgenda)} />
        </section>
      </div>
    </>
  );
}
