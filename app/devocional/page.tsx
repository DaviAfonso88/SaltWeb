"use client";

import { useState, useEffect } from "react";
import { getDevocionais, type Devocional } from "./data";
import { ArrowRight, Search, BookOpen, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function DevocionalPage() {
  const [devocionais, setDevocionais] = useState<Devocional[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const devocionaisFiltrados = devocionais
    .filter((d) => (mesSelecionado ? d.mes === mesSelecionado : true))
    .filter((d) =>
      d.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <main className="bg-background">
      <PageHeader
        title="Devocionais"
        subtitle="Inspiração diária para sua caminhada com Deus."
      />

      <section className="py-24 bg-gradient-to-b from-background via-card/20 to-background relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 bg-dot-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : devocionais.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-foreground/70">Nenhum devocional disponível no momento.</p>
            </div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="flex flex-col items-center gap-8 mb-16">
                {/* Search Input */}
                <div className="relative w-full max-w-md group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-300 z-10" />
                  <input
                    type="text"
                    placeholder="Pesquisar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="relative w-full pl-12 pr-5 py-3 rounded-full bg-card/50 border border-border/50 focus:border-primary focus:ring-0 outline-none transition-all duration-300 group-hover:border-primary/50"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex justify-center flex-wrap gap-3">
                  <button
                    onClick={() => setMesSelecionado(null)}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer hover-lift ${
                      mesSelecionado === null
                        ? "bg-primary text-white shadow-glow"
                        : "bg-card/50 border border-border/50 hover:border-primary hover:text-primary text-muted-foreground"
                    }`}
                  >
                    Todos
                  </button>
                  {meses.map((mes) => (
                    <button
                      key={mes}
                      onClick={() => setMesSelecionado(mes)}
                      className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 cursor-pointer hover-lift ${
                        mesSelecionado === mes
                          ? "bg-primary text-white shadow-glow"
                          : "bg-card/50 border border-border/50 hover:border-primary hover:text-primary text-muted-foreground"
                      }`}
                    >
                      {mes}
                    </button>
                  ))}
                </div>
              </div>

              {/* Devotionals Grid */}
              {devocionaisFiltrados.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {devocionaisFiltrados.map((devocional, i) => (
                    <DevocionalCard key={i} devocional={devocional} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-foreground/70">Nenhum devocional encontrado com os filtros aplicados.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function DevocionalCard({ devocional, index }: { devocional: Devocional; index: number }) {
  const { ref: cardRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-card/50 border border-border/50 shadow-lg transition-all duration-500 hover:border-primary/50 hover:shadow-glow hover:shadow-primary/10 hover:-translate-y-2 hover-glow ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Link
        href={devocional.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
      />
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-tl-2xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-primary/0 group-hover:border-primary/30 transition-colors duration-500 rounded-br-2xl" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <Sparkles className="h-5 w-5 text-primary/30 group-hover:text-primary group-hover:animate-pulse transition-all duration-300" />
        </div>

        <h3 className="text-xl font-semibold font-heading text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {devocional.titulo}
        </h3>

        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{devocional.mes}</span>
        </div>
      </div>

      <span className="flex items-center text-sm font-semibold text-primary/70 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1 mt-auto">
        Ler agora <ArrowRight className="ml-2 h-4 w-4" />
      </span>
    </div>
  );
}