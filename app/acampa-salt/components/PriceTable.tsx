import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PriceTable() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Regras de desconto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Dupla de cônjuges ou irmãos: 15% de desconto sobre o valor total
              da quantidade informada.
            </p>
            <p className="text-sm text-muted-foreground">
              Nenhum desconto é acumulativo.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Lotes por mês</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Fevereiro</TableCell>
                <TableCell>Primeiro Lote</TableCell>
                <TableCell>R$ 285</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Março</TableCell>
                <TableCell>Segundo Lote</TableCell>
                <TableCell>R$ 295</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Abril</TableCell>
                <TableCell>Terceiro Lote</TableCell>
                <TableCell>R$ 305</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Maio</TableCell>
                <TableCell>Quarto Lote</TableCell>
                <TableCell>R$ 315</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Junho</TableCell>
                <TableCell>Quinto Lote</TableCell>
                <TableCell>R$ 325</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Julho</TableCell>
                <TableCell>Ultimo Lote</TableCell>
                <TableCell>R$ 335</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 lg:col-span-2">
        <CardHeader>
          <CardTitle>Forma de pagamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold">Pagamento á vista</h3>
            <p className="text-sm text-muted-foreground">Pix: 5% de desconto</p>
            <p className="text-sm text-muted-foreground">
              Dinheiro: 10% de desconto
            </p>
            <p className="text-sm text-muted-foreground">
              Cartão de crédito: sem desconto
            </p>
            <p className="text-sm text-muted-foreground">
              Plano de crédito: somente cartão de crédito (sem desconto)
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Carnê SALT (parcelado)</h3>
            <p className="text-sm text-muted-foreground">
              Disponível em todos os meses, com base no lote vigente.
            </p>
            <p className="text-sm text-muted-foreground">
              No Carnê SALT não há acumulação de descontos.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
