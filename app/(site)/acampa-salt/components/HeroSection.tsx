import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function HeroSection({ registrationOpen }: { registrationOpen: boolean }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/40 p-6 md:p-10">
      <Badge
        className={
          registrationOpen
            ? ""
            : "border-red-500/20 bg-red-500/10 text-red-400"
        }
      >
        {registrationOpen ? "Inscricoes abertas" : "Inscricoes encerradas"}
      </Badge>
      <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
        Acampa SALT 2026
      </h1>
      <p className="mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
        Participe do Acampa SALT 2026 e garanta sua vaga. Preencha o formulario
        abaixo para realizar sua inscricao.
      </p>

      <Alert className="mt-6 bg-background/80">
        <AlertTitle>Informação importante:</AlertTitle>
        <AlertDescription>
          Cada participante deve levar{" "}
          <strong>1kg de alimento nao perecivel</strong>: arroz, feijao,
          macarrao, entre outros.
        </AlertDescription>
      </Alert>
    </section>
  );
}
