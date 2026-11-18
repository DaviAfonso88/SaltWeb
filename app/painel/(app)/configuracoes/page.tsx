import { ProgramacaoForm } from "@/components/painel/configuracoes/ProgramacaoForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { requirePermission } from "@/lib/auth/guard";
import { getProgramacoesAdmin } from "@/lib/programacoes/queries";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  await requirePermission("eventos.gerenciar");
  const programacoes = await getProgramacoesAdmin();

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dia e horário das programações fixas. Ao salvar, a home, o rodapé, a página de eventos e a página Sobre passam a mostrar o novo horário."
      />
      <div className="grid max-w-3xl gap-5">
        {programacoes.map((p) => (
          <ProgramacaoForm
            // Remonta ao salvar para trazer a nova versão (controle de edição concorrente).
            key={`${p.slug}-${p.version}`}
            programacao={{ slug: p.slug, titulo: p.titulo, schedule: p.schedule, version: p.version }}
          />
        ))}
      </div>
    </>
  );
}
