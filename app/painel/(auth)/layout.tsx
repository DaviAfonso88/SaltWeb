import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Image
          src="/images/salt-logo-ink.png"
          alt="Juventude SALT"
          width={160}
          height={48}
          className="mx-auto mb-8 h-10 w-auto"
          priority
        />
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </main>
  );
}
