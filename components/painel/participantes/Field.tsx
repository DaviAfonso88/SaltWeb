import { FieldError } from "@/components/painel/FieldError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Common = { id: string; label: string; error?: string[]; hint?: string; className?: string };

/** Campo de texto controlado com rótulo, dica e erro ligados por `aria-describedby`. */
export function Field({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: Common & Omit<React.ComponentProps<typeof Input>, "id" | "className">) {
  const describedBy = [error?.length ? `${id}-erro` : null, hint ? `${id}-dica` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Input id={id} aria-invalid={error?.length ? true : undefined} aria-describedby={describedBy} className="min-h-11 rounded-xl bg-card" {...props} />
      {hint ? (
        <p id={`${id}-dica`} className="text-xs text-text-3">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-erro`} errors={error} />
    </div>
  );
}

export function AreaField({
  id,
  label,
  error,
  hint,
  className,
  ...props
}: Common & Omit<React.ComponentProps<typeof Textarea>, "id" | "className">) {
  const describedBy = [error?.length ? `${id}-erro` : null, hint ? `${id}-dica` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <Textarea id={id} aria-invalid={error?.length ? true : undefined} aria-describedby={describedBy} className="min-h-24 rounded-xl bg-card" {...props} />
      {hint ? (
        <p id={`${id}-dica`} className="text-xs text-text-3">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-erro`} errors={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  error,
  className,
  children,
  ...props
}: Common & Omit<React.ComponentProps<"select">, "id" | "className">) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <select
        id={id}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={error?.length ? `${id}-erro` : undefined}
        className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm disabled:opacity-60"
        {...props}
      >
        {children}
      </select>
      <FieldError id={`${id}-erro`} errors={error} />
    </div>
  );
}

/** Cartão de seção da ficha. */
export function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h2 id={id} className="font-display text-lg font-semibold">
        {title}
      </h2>
      {description ? <p className="mt-1 text-sm text-text-2">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
