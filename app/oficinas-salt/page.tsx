"use client";

import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WorkshopSelector } from "./WorkshopSelector";
import { workshops } from "./workshopsData";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function OficinasSaltPage() {
  const [nome, setNome] = useState("");
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWorkshopChange = (id: string, checked: boolean) => {
    setError(null);
    if (checked) {
      if (selectedWorkshops.length >= 2) {
        setError("Você pode selecionar no máximo 2 oficinas.");
        return;
      }
      setSelectedWorkshops((prev) => [...prev, id]);
    } else {
      setSelectedWorkshops((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim()) {
      setError("Por favor, informe seu nome completo.");
      return;
    }

    if (selectedWorkshops.length === 0) {
      setError("Por favor, selecione pelo menos uma oficina.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/oficinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          oficinas: selectedWorkshops.map(id => {
            const w = workshops.find(workshop => workshop.id === id);
            return `${w?.name} (${w?.instructor})`;
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao realizar inscrição.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader 
          title="Inscrição Confirmada!" 
          subtitle="Sua participação nas oficinas foi registrada com sucesso." 
        />
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <Card className="w-full max-w-2xl border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Tudo certo, {nome.split(' ')[0]}!</CardTitle>
              <CardDescription>
                Estamos ansiosos para te ver lá.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Oficinas selecionadas:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {selectedWorkshops.map(id => {
                    const w = workshops.find(workshop => workshop.id === id);
                    return <li key={id}>{w?.name} — {w?.instructor}</li>;
                  })}
                </ul>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Caso precise alterar algo, entre em contato com a equipe de organização.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Voltar para o Início
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader 
        title="Oficinas SALT" 
        subtitle="Escolha até 2 oficinas para participar e aprimorar seus conhecimentos com profissionais da nossa comunidade." 
      />

      <div className="container mx-auto px-6 -mt-10 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-2xl border-primary/10 bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl">Formulário de Inscrição</CardTitle>
            <CardDescription>
              Preencha seus dados e selecione as oficinas de seu interesse.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome" className="text-base font-semibold">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value);
                    if (error) setError(null);
                  }}
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label className="text-base font-semibold">Selecione as Oficinas</Label>
                  <span className={`text-xs font-medium ${selectedWorkshops.length > 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {selectedWorkshops.length}/2 selecionadas
                  </span>
                </div>
                
                <WorkshopSelector
                  selectedIds={selectedWorkshops}
                  onChange={handleWorkshopChange}
                  disabled={selectedWorkshops.length >= 2}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-6 border-t border-border flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                disabled={loading || !nome.trim() || selectedWorkshops.length === 0 || selectedWorkshops.length > 2}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Inscrição"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Ao confirmar, sua participação será registrada para as oficinas selecionadas.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
