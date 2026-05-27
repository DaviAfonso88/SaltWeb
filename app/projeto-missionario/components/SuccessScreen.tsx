"use client";

import { CheckCircle2, Globe, MapPin, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EVENT_FULL_DATE } from "@/lib/projeto-missionario/types";

type SuccessScreenProps = {
  nome: string;
  interesseCamisa: boolean;
};

export function RegistrationSuccess({
  nome,
  interesseCamisa,
}: SuccessScreenProps) {
  return (
    <Card className="overflow-hidden border-teal-500/30 shadow-xl max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 px-6 py-10 text-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
        <div className="relative">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Inscrição Confirmada!
          </h2>
          <p className="mt-1 text-teal-100">
            Que bom ter você conosco, {nome}!
          </p>
        </div>
      </div>

      <CardHeader className="pb-2 text-center pt-6">
        <CardTitle className="text-xl flex items-center justify-center gap-2 text-foreground">
          <Globe className="h-5 w-5 text-teal-500" />
          Projeto Missionário SALT
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-8 space-y-5">
        <div className="rounded-xl bg-gradient-to-br from-teal-500/5 to-cyan-500/5 border border-teal-500/20 p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 text-teal-500" />
            <span className="font-medium">{EVENT_FULL_DATE}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-teal-500" />
            <span className="font-medium">PIBLS Lagoa Santa</span>
          </div>
        </div>

        {interesseCamisa && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Você manifestou interesse na camisa!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Em breve entraremos em contato sobre a compra.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
          <h4 className="font-semibold text-sm mb-2">Prepare-se</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>Traga sua Bíblia, caderno e disposição</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>
                Se for ficar em tempo integral, traga colchonete e roupa de cama
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">•</span>
              <span>Almoço e janta serão fornecidos</span>
            </li>
          </ul>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Dúvidas? Fale com a liderança da SALT.
        </p>
      </CardContent>
    </Card>
  );
}
