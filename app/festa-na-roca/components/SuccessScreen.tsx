import { 
  PartyPopper, 
  CheckCircle2, 
  QrCode, 
  Gift, 
  MapPin, 
  CalendarDays, 
  MessageCircle,
  ArrowRight
} from "lucide-react";
import { PIBLS_PIX_KEY } from "@/lib/pix";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuccessScreenProps = {
  nome: string;
  valor: number | null;
  onReset?: () => void;
};

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function RegistrationSuccess({ nome, valor, onReset }: SuccessScreenProps) {
  const showPix = valor && valor > 0;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 shadow-xl max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 px-6 py-8">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-2xl">
            <PartyPopper className="h-12 w-12 text-amber-500" />
          </div>
        </div>
      </div>

      <CardHeader className="pt-16 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
          Inscrição Confirmada!
        </CardTitle>
        <p className="text-muted-foreground">
          Que legal, <span className="font-semibold text-foreground">{nome}</span>! 
          Você vai participar da Festa na Roça. Prepare-se para um dia incrível!
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-8 space-y-6">
        {showPix && (
          <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <QrCode className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold">Confirmar pagamento</h3>
                <p className="text-xs text-muted-foreground">Realize o pagamento de {currency(valor)} via PIX</p>
              </div>
            </div>
            
            <div className="rounded-xl border border-amber-500/30 bg-background/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Chave PIX</span>
                <span className="font-mono font-medium text-amber-700 dark:text-amber-400">{PIBLS_PIX_KEY}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Valor</span>
                <span className="font-bold text-xl text-amber-600">{currency(valor)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Beneficiária</span>
                <span className="text-sm font-medium">PIBLS - Lagoa Santa</span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-500/20 p-4 flex items-start gap-3">
              <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-300">Enviar comprovante</p>
                <p className="text-amber-700 dark:text-amber-400">
                  Mande o comprovante para o irmão Thiago no WhatsApp: (31) 9130-6879
                </p>
              </div>
            </div>
          </div>
        )}

        {!showPix && (
          <div className="rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5 md:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Gift className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-green-700 dark:text-green-300">Contribuição com alimento</h3>
                <p className="text-sm text-muted-foreground">
                  Traga o alimento selecionado no dia do evento. Vamos fazer uma grande festa juntos!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="font-medium">13 de Junho de 2026</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">Sítio em Lagoa Santa</span>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2">
          <p>Algo errado? Entre em contato conosco.</p>
        </div>

        {onReset && (
          <Button onClick={onReset} variant="outline" className="w-full">
            <ArrowRight className="mr-2 h-4 w-4" />
            Fazер outra inscrição
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
