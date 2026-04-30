import { RegistrationForm } from "./components/RegistrationForm";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";

export const metadata = {
  title: "Festa na Roça - inscrição",
  description:
    "Inscreva-se para a Festa na Roça da Juventude SALT. Traga um alimento ou contribua com valor simbólico de R$ 30.",
};

export default function FestaNaRocaPage() {
  return (
    <main>
      <PageHeader
        title="Festa na Roça"
        subtitle="Um dia de muita curtição no sítio com forró, quadrilha e comida boa!"
      />

      <PageSection>
        <div className="flex justify-center">
          <RegistrationForm />
        </div>
      </PageSection>
    </main>
  );
}