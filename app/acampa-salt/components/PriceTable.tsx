import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, CalendarDays, CreditCard, Users, Percent, Info } from "lucide-react";

const lots = [
  { month: "Fevereiro", lot: "Primeiro", price: 285 },
  { month: "Março", lot: "Segundo", price: 295 },
  { month: "Abril", lot: "Terceiro", price: 305 },
  { month: "Maio", lot: "Quarto", price: 315 },
  { month: "Junho", lot: "Quinto", price: 325 },
  { month: "Julho", lot: "Último", price: 335 },
];

export function PriceTable() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent lg:col-span-1">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
              <Percent className="h-4 w-4 text-amber-600" />
            </div>
            <CardTitle className="text-lg">Descontos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-background/60 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Dupla</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cônjuges ou irmãos: <span className="font-semibold text-green-500">15% OFF</span> no total
            </p>
          </div>
          <div className="rounded-lg bg-background/60 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">À vista</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-green-500 font-medium">PIX:</span> 5% OFF</p>
              <p><span className="text-green-500 font-medium">Dinheiro:</span> 10% OFF</p>
              <p><span className="text-muted-foreground">Crédito:</span> sem desconto</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
            <Info className="h-3 w-3 flex-shrink-0" />
            <span>Descontos não são acumulativos</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Lotes por mês</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {lots.map((item, index) => (
              <div
                key={item.month}
                className="group relative overflow-hidden rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-primary/50 hover:bg-muted/50"
              >
                <div className="absolute right-0 top-0 h-12 w-12 translate-x-6 -translate-y-6 rounded-full bg-primary/10 transition-transform group-hover:scale-150"></div>
                <p className="text-xs font-medium text-muted-foreground">{item.month}</p>
                <p className="text-sm font-semibold">{item.lot} Lote</p>
                <p className="text-lg font-bold text-primary">R$ {item.price}</p>
                {index === 0 && (
                  <Badge className="absolute right-2 top-2 bg-amber-500 text-[10px]">Mais barato</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 lg:col-span-3">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
              <CreditCard className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-lg">Formas de pagamento</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-500">À</span>
              Pagamento à vista
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">PIX</span>
                <Badge variant="outline" className="border-green-500/50 text-green-500">5% OFF</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Dinheiro</span>
                <Badge variant="outline" className="border-green-500/50 text-green-500">10% OFF</Badge>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Crédito</span>
                <Badge variant="secondary">Sem desconto</Badge>
              </li>
            </ul>
          </div>
          
          <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-500">C</span>
              Carnê SALT (parcelado)
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Parcelamento em 6x (fevereiro a julho)</p>
              <p>Baseado no lote vigente do mês</p>
              <p className="flex items-center gap-2">
                <Info className="h-3 w-3 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400">Sem acumulação de descontos</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
