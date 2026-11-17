import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";

/** `.site` ativa os tokens do sistema visual do site público (ver app/globals.css). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <SiteNav />
      <main id="conteudo" className="flex-grow">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
