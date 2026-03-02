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
          <CardTitle>Valores especiais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Pastores e lideres de Ecossistemas</TableCell>
                <TableCell>Gratuito</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Lideranca</TableCell>
                <TableCell>R$ 70</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Voluntarios</TableCell>
                <TableCell>R$ 100</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Lotes por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
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
                <TableCell>Marco</TableCell>
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
            <h3 className="font-semibold">Pagamento a vista</h3>
            <p className="text-sm text-muted-foreground">Pix: 5% de desconto</p>
            <p className="text-sm text-muted-foreground">Dinheiro: 10% de desconto</p>
            <p className="text-sm text-muted-foreground">Cartao de credito: sem desconto</p>
            <p className="text-sm text-muted-foreground">
              Plano de credito: somente cartao de credito (sem desconto)
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Carne SALT (parcelado)</h3>
            <p className="text-sm text-muted-foreground">
              1o lote de fevereiro (referencia R$ 285), com parcelas fixas de R$ 48 de fevereiro a
              julho.
            </p>
            <p className="text-sm text-muted-foreground">
              No Carne SALT nao ha desconto por forma de pagamento.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
