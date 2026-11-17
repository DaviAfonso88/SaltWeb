import { Eyebrow } from "@/components/site/Eyebrow";
import { cn } from "@/lib/utils";

/** Rótulo (eyebrow) + título de seção. `as` define o nível do título para manter a hierarquia correta. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Tag id={id} className="font-display text-[clamp(28px,2.8vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em]">
        {title}
      </Tag>
      {description ? <p className="max-w-[460px] text-text-2">{description}</p> : null}
    </div>
  );
}

/** Cabeçalho de página (h1): rótulo, título de 40–56 px e texto de apoio, como nas páginas internas do design. */
export function PageHeader({
  eyebrow,
  title,
  description,
  id = "page-title",
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  /** Conteúdo abaixo do título (ex.: imagem larga da página Sobre). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cn("pb-[clamp(32px,4vw,48px)] pt-[clamp(48px,6vw,88px)]", className)}>
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-5">
          <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
            <p className="eyebrow">{eyebrow}</p>
            <h1 id={id} className="font-display text-[clamp(36px,4.4vw,56px)] font-semibold leading-[1.08] tracking-[-0.025em]">
              {title}
            </h1>
          </div>
          {description ? <p className="max-w-[400px] flex-[1_1_320px] text-lg text-text-2">{description}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
