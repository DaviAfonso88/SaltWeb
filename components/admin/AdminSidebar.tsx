"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Upload,
  UserCog,
  LogOut,
  Tent,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/admin-camp", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin-camp/participantes", label: "Participantes", icon: Users },
  { href: "/admin-camp/importar", label: "Importar", icon: Upload },
  { href: "/admin-camp/usuarios", label: "Usuários", icon: UserCog },
] as const;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/camp-admin/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[oklch(0.18_0.01_60)] to-[oklch(0.145_0_0)]">
      <div className="relative px-5 py-6">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-[0_0_20px_oklch(0.7_0.15_70/0.1)]">
            <Tent className="size-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-poppins)] text-sm font-semibold tracking-tight text-foreground">
              SALT Acampamento
            </h2>
            <p className="text-[11px] font-medium uppercase tracking-widest text-amber-400/60">
              Administração
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin-camp"
                ? pathname === "/admin-camp"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/15 to-orange-500/5 text-amber-300 shadow-[inset_0_1px_0_oklch(1_0_0/0.05)]"
                    : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-400" />
                )}
                <item.icon
                  className={`size-4 transition-colors ${isActive ? "text-amber-400" : "text-muted-foreground group-hover:text-foreground"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col border-r border-amber-500/10 transition-all duration-300 ease-out ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <div className="flex items-center justify-end px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>
        {collapsed ? (
          <TooltipProvider>
            <nav className="flex flex-col items-center gap-2 px-2 py-4">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/admin-camp"
                    ? pathname === "/admin-camp"
                    : pathname.startsWith(item.href);
                return (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={`relative flex size-9 items-center justify-center rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-br from-amber-500/15 to-orange-500/5 text-amber-300"
                            : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-400" />
                        )}
                        <item.icon className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="border-amber-500/10 bg-[oklch(0.22_0.01_60)]"
                    >
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        ) : (
          <NavContent />
        )}
      </aside>
    </>
  );
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-amber-500/10 p-0">
        <NavContent />
      </SheetContent>
    </Sheet>
  );
}
