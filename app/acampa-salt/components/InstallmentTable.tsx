import { Parcela } from "@/lib/acampa/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type InstallmentTableProps = {
  parcelas: Parcela[];
};

export function InstallmentTable({ parcelas }: InstallmentTableProps) {
  const total = parcelas.reduce((sum, parcela) => sum + parcela.valor, 0);
  const paidCount = parcelas.filter((parcela) => parcela.pago).length;
  const progress = parcelas.length > 0 ? (paidCount / parcelas.length) * 100 : 0;

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Parcelas pagas</span>
          <span>
            {paidCount}/{parcelas.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Mes</TableHead>
            <TableHead className="w-1/3">Valor</TableHead>
            <TableHead className="w-1/3">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parcelas.map((parcela) => (
            <TableRow key={parcela.mes}>
              <TableCell className="capitalize">{parcela.mes}</TableCell>
              <TableCell>R$ {parcela.valor.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={parcela.pago ? "default" : "secondary"}>
                  {parcela.pago ? "Pago" : "Pendente"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Total do carne</span>
        <span className="font-semibold">R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
