import { FieldError } from "@/components/painel/FieldError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<typeof Input>, "id" | "name"> & {
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  wrapperClassName?: string;
};

/** Rótulo + campo + dica + erro, com `aria-describedby` correto. */
export function TextField({ name, label, errors, hint, wrapperClassName, className, ...props }: Props) {
  const errId = `${name}-erro`;
  const hintId = `${name}-dica`;
  const describedBy = [errors?.length ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", wrapperClassName)}>
      <Label htmlFor={name} className="text-sm font-semibold">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        className={cn("min-h-11 rounded-xl bg-card", className)}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-text-3">
          {hint}
        </p>
      ) : null}
      <FieldError id={errId} errors={errors} />
    </div>
  );
}
