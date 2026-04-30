import { Check } from "lucide-react";
import { JUVENTUDE_PIX_KEY, PIBLS_PIX_KEY } from "@/lib/pix";

type SuccessScreenProps = {
  nome: string;
  valor: number | null;
};

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function RegistrationSuccess({ nome, valor }: SuccessScreenProps) {
  const showPix = valor && valor > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="rounded-full bg-green-500/10 p-6">
        <Check className="h-16 w-16 text-green-500" />
      </div>
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Inscrição Confirmada!
        </h2>
        <p className="text-muted-foreground">
          Obrigado, <span className="font-medium text-foreground">{nome}</span>!
          Sua inscrição na Festa na Roça foi registrada com sucesso.
        </p>
      </div>

      {showPix && (
        <div className="mt-4 w-full max-w-md space-y-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="space-y-2">
            <p className="font-medium text-foreground">
              Para confirmar, realize o pagamento de {currency(valor)} via PIX:
            </p>
          </div>

          <div className="space-y-3 rounded-lg bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chave PIX:</span>
              <span className="font-mono font-medium">{PIBLS_PIX_KEY}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className="font-bold text-amber-600">
                {currency(valor)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Beneficiário:
              </span>
              <span className="text-sm text-foreground">
                Primeira Igreja Batista em Lagoa Santa
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/10 p-3 text-sm">
            <p className="font-medium">Enviar comprovante para:</p>
            <p className="text-muted-foreground">
              Irmão Thiago (WhatsApp: (31) 9130-6879)
            </p>
          </div>
        </div>
      )}

      {!showPix && (
        <p className="text-sm text-muted-foreground">
          Traga o alimento selecionado no dia do evento!
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        Tem algo de errado? Entre em contato conosco.
      </p>
    </div>
  );
}
