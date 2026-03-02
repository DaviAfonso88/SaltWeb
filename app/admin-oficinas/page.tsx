"use client";

import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Download, RefreshCw } from "lucide-react";

export default function AdminOficinasPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/oficinas");
      if (!response.ok) throw new Error("Falha ao carregar dados");
      const data = await response.json();
      // Ordenar por data (mais recente primeiro)
      setRegistrations(data.reverse());
    } catch (err) {
      setError("Não foi possível carregar a lista.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha simples para controle de acesso rápido
    // Em produção, você deve usar algo mais robusto ou uma Env
    if (password === "salt2026") {
      setIsAuthenticated(true);
      fetchRegistrations();
    } else {
      alert("Senha incorreta");
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `oficinas_inscricoes_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Área Restrita</CardTitle>
            <p className="text-sm text-muted-foreground">Insira a senha para acessar a lista de inscritos.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Senha de acesso" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
                autoFocus
              />
              <Button type="submit" className="w-full">Acessar Painel</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Painel Administrativo" 
        subtitle="Gerencie as inscrições das oficinas e exporte os dados." 
      />

      <div className="container mx-auto px-6 -mt-10 relative z-10">
        <Card className="shadow-2xl border-primary/10 bg-card/80 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-2xl font-bold">Inscritos ({registrations.length})</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchRegistrations} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button size="sm" onClick={exportToJson} variant="default" className="bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                          {new Date(reg.data).toLocaleString('pt-BR')}
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
