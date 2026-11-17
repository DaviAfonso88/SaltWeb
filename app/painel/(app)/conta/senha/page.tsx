import { ChangePasswordForm } from "@/components/painel/auth/ChangePasswordForm";
import { PageHeader } from "@/components/painel/PageHeader";
import { requireUser } from "@/lib/auth/guard";

export const metadata = { title: "Trocar senha" };

export default async function ChangePasswordPage() {
  const user = await requireUser({ allowPasswordChange: true });
  return (
    <>
      <PageHeader
        title="Trocar senha"
        description={
          user.mustChangePassword
            ? "Por segurança, defina uma senha pessoal antes de continuar."
            : "Ao trocar a senha, as outras sessões abertas são encerradas."
        }
      />
      <ChangePasswordForm />
    </>
  );
}
