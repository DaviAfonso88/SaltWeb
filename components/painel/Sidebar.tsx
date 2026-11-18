"use client";

import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export type NavIcon =
  | "home"
  | "inscricoes"
  | "eventos"
  | "participantes"
  | "devocionais"
  | "mensagens"
  | "usuarios"
  | "papeis"
  | "auditoria"
  | "configuracoes";

export type NavItem = { href: string; label: string; icon: NavIcon; badge?: number };

const ICONS: Record<NavIcon, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  home: LayoutDashboard,
  inscricoes: ClipboardList,
  eventos: CalendarDays,
  participantes: HeartPulse,
  devocionais: BookOpen,
  mensagens: Mail,
  usuarios: UserCog,
  papeis: ShieldCheck,
  auditoria: ScrollText,
  configuracoes: Settings,
};

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="grid gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = item.href === "/painel" ? pathname === "/painel" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
              active ? "bg-purple-tint text-purple-dark" : "text-text-2 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                <span className="sr-only">{item.badge} novas</span>
                <span aria-hidden>{item.badge}</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({
  items,
  user,
  onNavigate,
}: {
  items: NavItem[];
  user: { name: string; roleName: string };
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <Image src="/images/salt-logo-ink.png" alt="Juventude SALT" width={120} height={36} className="h-8 w-auto self-start" />
      <div className="flex-1 overflow-y-auto">
        <NavList items={items} onNavigate={onNavigate} />
      </div>
      <div className="grid gap-2 border-t border-border pt-4">
        <div className="px-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-text-3">{user.roleName}</p>
        </div>
        <Link
          href="/painel/conta/senha"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-text-2 hover:bg-muted"
        >
          <KeyRound className="size-4" aria-hidden />
          Trocar senha
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-text-2 hover:bg-muted"
          >
            <LogOut className="size-4" aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ items, user }: { items: NavItem[]; user: { name: string; roleName: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-card p-4 lg:block">
        <SidebarBody items={items} user={user} />
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-2 lg:hidden">
        <Image src="/images/salt-logo-ink.png" alt="Juventude SALT" width={96} height={30} className="h-7 w-auto" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-muted"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-card p-4">
            <SheetTitle className="sr-only">Menu do painel</SheetTitle>
            <SidebarBody items={items} user={user} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
