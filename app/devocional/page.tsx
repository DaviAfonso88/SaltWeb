"use client";

import { useState, useEffect } from "react";
import { getDevocionais, type Devocional } from "./data";
import { ArrowRight, Search, BookOpen } from "lucide-react";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";

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
    <main>
      <PageHeader
        title="Devocionais"
        subtitle="Inspiração diária para sua caminhada com Deus."
      />

      <PageSection>
        {loading ? (
          <p className="text-center text-foreground/70">
            Carregando devocionais...
          </p>
        ) : devocionais.length === 0 ? (
          <p className="text-center text-foreground/70">
            Nenhum devocional disponível no momento.
          </p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-6 mb-12">
              {/* Search Input */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
                <input
                  type="text"
                  placeholder="Pesquisar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-5 py-2.5 rounded-full bg-transparent border border-muted-foreground/30 focus:border-primary focus:ring-0 outline-none transition-colors duration-300"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex justify-center flex-wrap gap-3">
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
            </div>

            {/* Devotionals Grid or "Not Found" message */}
            {devocionaisFiltrados.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {devocionaisFiltrados.map((devocional, i) => (
                  <Link
                    href={devocional.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    className="group flex flex-col justify-between p-6 rounded-xl bg-[#18181b] border-2 border-transparent shadow-sm transition-all duration-300 hover:border-primary/60 hover:scale-105"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold font-heading text-foreground pr-4">
                          {devocional.titulo}
                        </h3>
                        <BookOpen className="h-8 w-8 text-primary/70 shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {devocional.mes}
                      </p>
                    </div>
                    <span className="flex items-center text-sm font-semibold text-primary/80 transition-all duration-300 group-hover:text-primary group-hover:translate-x-1">
                      Ler agora <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-foreground/70">
                Nenhum devocional encontrado com os filtros aplicados.
              </p>
            )}
          </>
        )}
      </PageSection>
    </main>
  );
}
