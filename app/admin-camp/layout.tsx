import { AdminSidebar, MobileSidebar } from "@/components/admin/AdminSidebar";

export default function AdminCampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-4 border-b border-amber-500/10 bg-background/80 backdrop-blur-sm px-4 py-3 lg:px-6">
          <MobileSidebar />
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-[oklch(0.145_0.005_60)] p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
