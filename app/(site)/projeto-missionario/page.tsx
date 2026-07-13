import { RegistrationForm } from "./components/RegistrationForm";
import PageHeader from "@/app/components/PageHeader";
import PageSection from "@/app/components/PageSection";

export const metadata = {
  title: "Projeto Missionário SALT — inscrição",
  description:
    "Inscreva-se para o Projeto Missionário SALT de 12 a 14 de Junho de 2026. Participe em tempo integral ou parcial.",
};

export default function ProjetoMissionarioPage() {
  return (
    <main>
      <PageHeader
        title="Projeto Missionário SALT"
        subtitle="12 a 14 de Junho • Igreja PIBLS"
      />

      <PageSection>
        <div className="flex justify-center">
          <RegistrationForm />
        </div>
      </PageSection>
    </main>
  );
}
