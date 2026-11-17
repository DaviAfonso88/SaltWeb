import { cn } from "@/lib/utils";

/** Mensagem de erro de campo; use `id={`${campo}-erro`}` com `aria-describedby` no input. */
export function FieldError({
  id,
  errors,
  className,
}: {
  id?: string;
  errors?: string[];
  className?: string;
}) {
  if (!errors?.length) return null;
  return (
    <p id={id} role="alert" className={cn("text-sm text-destructive", className)}>
      {errors[0]}
    </p>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
