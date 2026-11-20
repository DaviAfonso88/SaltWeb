import { Sidebar, type NavItem } from "@/components/painel/Sidebar";
import { can, requireUser } from "@/lib/auth/guard";
import { countNewMessages } from "@/lib/messages/queries";
import { countNewVisitors } from "@/lib/visitors/queries";

export const metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser({ allowPasswordChange: true });

  const canMessages = can(user, "mensagens.ver");
  const canVisitors = can(user, "visitantes.ver");
  const [newMessages, newVisitors] = await Promise.all([
    canMessages ? countNewMessages() : 0,
    canVisitors ? countNewVisitors() : 0,
  ]);

  const items: NavItem[] = [{ href: "/painel", label: "Visão geral", icon: "home" }];
  if (can(user, "devocionais.gerenciar")) items.push({ href: "/painel/devocionais", label: "Devocionais", icon: "devocionais" });
  if (canMessages) items.push({ href: "/painel/mensagens", label: "Mensagens", icon: "mensagens", badge: newMessages });
  if (canVisitors) items.push({ href: "/painel/visitantes", label: "Visitantes", icon: "visitantes", badge: newVisitors });
  if (can(user, "eventos.gerenciar")) items.push({ href: "/painel/eventos", label: "Eventos", icon: "eventos" });
  if (can(user, "inscricoes.ver")) items.push({ href: "/painel/inscricoes", label: "Inscrições", icon: "inscricoes" });
  if (can(user, "participantes.ver")) items.push({ href: "/painel/participantes", label: "Participantes", icon: "participantes" });
  if (can(user, "usuarios.gerenciar")) {
    items.push({ href: "/painel/usuarios", label: "Usuários", icon: "usuarios" });
    items.push({ href: "/painel/papeis", label: "Papéis", icon: "papeis" });
  }
  if (can(user, "auditoria.ver")) items.push({ href: "/painel/auditoria", label: "Auditoria", icon: "auditoria" });
  if (can(user, "eventos.gerenciar")) items.push({ href: "/painel/configuracoes", label: "Configurações", icon: "configuracoes" });

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <Sidebar items={items} user={{ name: user.name, roleName: user.roleName }} />
      <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 outline-none px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
