"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { workshops } from "../oficinas-salt/workshopsData";

type Registration = {
  id: string;
  nome: string;
  data: string;
  oficinas: string[];
};

export default function AdminOficinasPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeText = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const workshopTotals = useMemo(() => {
    const totals = workshops.map((workshop) => ({
      id: workshop.id,
      name: workshop.name,
      category: workshop.category,
      total: 0,
    }));

    const workshopIndexByName = new Map(
      workshops.map((workshop, index) => [normalizeText(workshop.name), index]),
    );

    for (const registration of registrations) {
      for (const oficina of registration.oficinas) {
        const index = workshopIndexByName.get(normalizeText(oficina));
        if (index !== undefined) totals[index].total += 1;
      }
    }

    return totals
      .filter((workshop) => workshop.total > 0)
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "pt-BR"));
  }, [registrations]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/oficinas");
      if (!response.ok) throw new Error("Falha ao carregar dados");
      const data = await response.json();
      setRegistrations(data.reverse());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `oficinas_inscricoes_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Painel Administrativo" subtitle="Gerencie as inscrições das oficinas e exporte os dados." />

      <div className="container mx-auto px-6 -mt-10 relative z-10">
        <Card className="shadow-2xl border-primary/10 bg-card/80 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-2xl font-bold">Inscritos ({registrations.length})</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button size="sm" onClick={exportToJson} variant="default" className="bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {workshopTotals.map((workshop) => (
                <Card key={workshop.id} className="border-primary/15 bg-background/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{workshop.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold leading-none">{workshop.total}</p>
                    <p className="text-xs text-muted-foreground mt-2">inscrições ({workshop.category})</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando dados do Redis...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">Nenhuma inscrição encontrada ainda.</p>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-bold">Data</TableHead>
                      <TableHead className="font-bold">Nome Completo</TableHead>
                      <TableHead className="font-bold">Oficinas Selecionadas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(reg.data).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="font-medium">{reg.nome}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {reg.oficinas.map((oficina: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {oficina}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
