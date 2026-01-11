"use client";

import { useState, useEffect } from "react";
import { getDevocionais, type Devocional } from "./data";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DevocionalPage() {
  const [devocionais, setDevocionais] = useState<Devocional[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const data = await getDevocionais();
      setDevocionais(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const meses = [...new Set(devocionais.map((d) => d.mes))];

  const devocionaisFiltrados = mesSelecionado
    ? devocionais.filter((d) => d.mes === mesSelecionado)
    : devocionais;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Carregando devocionais...</p>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="py-24 text-center bg-card/20 bg-gradient-to-b from-[#18181b] via-[#1f1f23] to-[#27272a]">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-bold font-heading animate-fade-in">
            Devocionais
          </h1>
          <p className="mt-4 text-lg text-foreground/80 max-w-2xl mx-auto animate-fade-in">
            Inspiração diária para sua caminhada com Deus.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-24 bg-gradient-to-b from-[#27272a] via-[#1f1f23] to-[#18181b]">
        <div className="container mx-auto px-6">
          {/* Filter */}
          <div className="flex justify-center flex-wrap gap-3 mb-12">
            <button
              onClick={() => setMesSelecionado(null)}
              className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 cursor-pointer hover:scale-105 ${
                mesSelecionado === null
                  ? "bg-primary text-white shadow-md"
                  : "bg-transparent border border-muted-foreground/30 hover:border-primary text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {meses.map((mes) => (
              <button
                key={mes}
                onClick={() => setMesSelecionado(mes)}
                className={`px-5 py-2 rounded-full font-semibold transition-all duration-300 cursor-pointer hover:scale-105 ${
                  mesSelecionado === mes
                    ? "bg-primary text-white shadow-md"
                    : "bg-transparent border border-muted-foreground/30 hover:border-primary text-muted-foreground hover:text-foreground"
                }`}
              >
                {mes}
              </button>
            ))}
          </div>

          {/* Devotionals Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {devocionaisFiltrados.length === 0 && !loading ? (
              <p className="col-span-full text-center text-foreground/70">
                Nenhum devocional encontrado para o mês selecionado.
              </p>
            ) : (
              devocionaisFiltrados.map((devocional, i) => (
                <Link
                  href={devocional.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={i}
                  className="group block p-6 rounded-xl bg-gradient-to-br from-[#27272a] via-[#2e2e32] to-[#18181b] shadow-sm transition-all duration-300 hover:shadow-[#92348c] "
                >
                  <h3 className="text-xl font-semibold font-heading text-foreground mb-2">
                    {devocional.titulo}
                  </h3>
                  <span className="flex items-center text-sm font-semibold text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1">
                    Ler agora <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
