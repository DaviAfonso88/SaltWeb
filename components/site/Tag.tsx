import { cn } from "@/lib/utils";

/** Selo do sistema visual: 6 px de raio, texto de 13 px. */
export function Tag({ tone = "neutral", className, ...props }: React.ComponentProps<"span"> & { tone?: "neutral" | "success" | "brand" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-[13px] font-semibold",
        tone === "neutral" && "bg-muted font-medium text-text-2",
        tone === "success" && "bg-success-tint text-success",
        tone === "brand" && "bg-purple-tint text-purple-dark",
        className,
      )}
      {...props}
    />
  );
}
