"use client";

import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  Receipt,
  UserCog,
  UserPlus,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export type NavIcon =
  | "home"
  | "inscricoes"
  | "estoque"
  | "gastos"
  | "eventos"
  | "participantes"
  | "devocionais"
  | "mensagens"
  | "visitantes"
  | "usuarios"
  | "papeis"
  | "auditoria"
  | "configuracoes";

export type NavItem = {
  /** Sem `href` vira só o título do grupo (a pessoa vê os submenus, mas não a página principal). */
  href?: string;
  label: string;
  icon: NavIcon;
  badge?: number;
  children?: NavItem[];
};

const ICONS: Record<NavIcon, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  home: LayoutDashboard,
  inscricoes: ClipboardList,
  estoque: Package,
  gastos: Receipt,
  eventos: CalendarDays,
  participantes: HeartPulse,
  devocionais: BookOpen,
  mensagens: Mail,
  visitantes: UserPlus,
  usuarios: UserCog,
  papeis: ShieldCheck,
  auditoria: ScrollText,
  configuracoes: Settings,
};

const ENTRY = "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors";
const ENTRY_ACTIVE = "bg-purple-tint text-purple-dark";
const ENTRY_IDLE = "text-text-2 hover:bg-muted hover:text-foreground";

const isActive = (href: string | undefined, pathname: string) =>
  !!href && (href === "/painel" ? pathname === href : pathname.startsWith(href));

function EntryContent({ item }: { item: NavItem }) {
  const Icon = ICONS[item.icon];
  return (
    <>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          <span className="sr-only">{item.badge} novas</span>
          <span aria-hidden>{item.badge}</span>
        </span>
      ) : null}
    </>
  );
}

function NavLink({
  item,
  href,
  pathname,
  highlight,
  onNavigate,
  className,
}: {
  item: NavItem;
  href: string;
  pathname: string;
  /** Destaque diferente de "é a página atual" (título de um submenu). */
  highlight?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const current = isActive(href, pathname);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={cn(ENTRY, (highlight ?? current) ? ENTRY_ACTIVE : ENTRY_IDLE, className)}
    >
      <EntryContent item={item} />
    </Link>
  );
}

/** Item com submenu: começa aberto quando a página atual está nele; depois vale o que a pessoa escolher. */
function NavGroup({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const listId = useId();
  const children = item.children ?? [];
  const childActive = children.some((c) => isActive(c.href, pathname));
  const selfActive = isActive(item.href, pathname);
  const open = choice ?? (childActive || selfActive);
  // Fechado, o título do grupo indica que a página atual está lá dentro.
  const highlight = selfActive || (!open && childActive);
  const toggle = { type: "button" as const, "aria-expanded": open, "aria-controls": listId, onClick: () => setChoice(!open) };
  const chevron = <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />;

  return (
    <>
      {item.href ? (
        <div className="flex items-center gap-1">
          <NavLink item={item} href={item.href} pathname={pathname} highlight={highlight} onNavigate={onNavigate} className="flex-1" />
          <button {...toggle} aria-label={`Submenu de ${item.label}`} className={cn(ENTRY, ENTRY_IDLE, "size-11 justify-center px-0")}>
            {chevron}
          </button>
        </div>
      ) : (
        <button {...toggle} className={cn(ENTRY, highlight ? ENTRY_ACTIVE : ENTRY_IDLE)}>
          <EntryContent item={item} />
          {chevron}
        </button>
      )}
      <ul id={listId} hidden={!open} className="ml-5 grid gap-1 border-l border-border pl-2">
        {children.map((child) =>
          child.href ? (
            <li key={child.href} className="grid">
              <NavLink item={child} href={child.href} pathname={pathname} onNavigate={onNavigate} />
            </li>
          ) : null,
        )}
      </ul>
    </>
  );
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Painel">
      <ul className="grid gap-1">
        {items.map((item) => (
          <li key={item.label} className="grid gap-1">
            {item.children?.length ? (
              <NavGroup item={item} pathname={pathname} onNavigate={onNavigate} />
            ) : item.href ? (
              <NavLink item={item} href={item.href} pathname={pathname} onNavigate={onNavigate} />
            ) : null}
          </li>
        ))}
      </ul>
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
