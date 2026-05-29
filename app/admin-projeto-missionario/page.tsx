"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  RefreshCw,
  Users,
  Moon,
  Shirt,
  Clock,
  Trash2,
  CreditCard,
  QrCode,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ParticipationRecord } from "@/lib/projeto-missionario/types";

const parcialLabel: Record<string, string> = {
  sextaNoite: "Sexta noite",
  sabadoManha: "Sáb manhã",
  sabadoTarde: "Sáb tarde",
  sabadoNoite: "Sáb noite",
  domingoTarde: "Dom tarde",
};

const statusLabel: Record<string, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
};

const pagamentoLabel: Record<string, string> = {
  pix: "Pix",
  credito: "Cartão",
};

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/70">
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
        style={{ background: color }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: `${color}20`, color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getParticipacaoLabel(record: ParticipationRecord): string {
  if (record.tempoIntegral) return "Integral";
  const selected = Object.entries(record.parcial)
    .filter(([, v]) => v)
    .map(([k]) => parcialLabel[k]);
  return selected.join(", ");
}

export default function AdminProjetoMissionarioPage() {
  const [filtroParticipacao, setFiltroParticipacao] = useState("todos");
  const [filtroCamisa, setFiltroCamisa] = useState("todos");
  const [filtroPagamento, setFiltroPagamento] = useState("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<ParticipationRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const term = normalizeSearch(search);

    let result = items;

    if (filtroParticipacao !== "todos") {
      result = result.filter((item) => {
        if (filtroParticipacao === "integral") return item.tempoIntegral;
        if (filtroParticipacao === "parcial") {
          return !item.tempoIntegral && Object.values(item.parcial).some(Boolean);
        }
        return true;
      });
    }

    if (filtroCamisa !== "todos") {
      result = result.filter(
        (item) => item.interesseCamisa === (filtroCamisa === "sim")
      );
    }

    if (filtroPagamento !== "todos") {
      result = result.filter(
        (item) => item.formaPagamentoCamisa === filtroPagamento
      );
    }

    if (term) {
      result = result.filter((item) => {
        const haystack = normalizeSearch(
          [item.numeroInscricao, item.nome, item.telefone].join(" ")
        );
        return haystack.includes(term);
      });
    }

    return result;
  }, [items, search, filtroParticipacao, filtroCamisa, filtroPagamento]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const integrais = filteredItems.filter((item) => item.tempoIntegral).length;
    const parciais = filteredItems.filter(
      (item) => !item.tempoIntegral && Object.values(item.parcial).some(Boolean)
    ).length;
    const camisaSim = filteredItems.filter((item) => item.interesseCamisa).length;
    const camisaNao = filteredItems.filter((item) => !item.interesseCamisa).length;
    const camisaPix = filteredItems.filter((item) => item.formaPagamentoCamisa === "pix").length;
    const camisaCredito = filteredItems.filter((item) => item.formaPagamentoCamisa === "credito").length;

    return { total, integrais, parciais, camisaSim, camisaNao, camisaPix, camisaCredito };
  }, [filteredItems]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/projeto-missionario/list");
      const data = (await response.json()) as ParticipationRecord[] | { message: string };

      if (!response.ok) {
        setError("message" in data ? data.message : "Erro ao carregar inscrições.");
        return;
      }

      setItems(data as ParticipationRecord[]);
    } catch {
      setError("Falha de conexão ao buscar inscrições.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!copiedId) return;
    const timeout = window.setTimeout(() => setCopiedId(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [copiedId]);

  const clearFilters = () => {
    setFiltroParticipacao("todos");
    setFiltroCamisa("todos");
    setFiltroPagamento("todos");
    setSearch("");
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
    } catch {
      setError("Não foi possível copiar para a área de transferência.");
    }
  };

  const markAs = async (id: string, status: "confirmado" | "pendente") => {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch("/api/projeto-missionario/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const data = (await response.json()) as ParticipationRecord | { message: string };
      if (!response.ok) {
        setError("message" in data ? data.message : "Erro ao atualizar status.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? (data as ParticipationRecord) : item))
      );
    } catch {
      setError("Falha de conexão.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta inscrição?")) return;
    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`/api/projeto-missionario/delete?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as { message: string };
        setError("message" in data ? data.message : "Erro ao excluir inscrição.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== id));
    } catch {
      setError("Falha de conexão.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background/95 px-4 pb-12 pt-28">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-card to-card p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent opacity-50" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                Projeto Missionário SALT
              </h1>
              <p className="mt-1 text-muted-foreground">
                Painel de inscrições • 12 a 14 de Junho de 2026
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={clearFilters} variant="ghost" disabled={loading}>
                Limpar filtros
              </Button>
              <Button onClick={fetchItems} disabled={loading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Carregando..." : "Atualizar"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard icon={Users} label="Total" value={stats.total} color="#14b8a6" />
          <StatCard icon={Moon} label="Integral" value={stats.integrais} color="#0d9488" />
          <StatCard icon={Clock} label="Parcial" value={stats.parciais} color="#06b6d4" />
          <StatCard icon={Shirt} label="Querem camisa" value={stats.camisaSim} color="#f59e0b" />
          <StatCard icon={Shirt} label="Sem camisa" value={stats.camisaNao} color="#6b7280" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard icon={QrCode} label="Pix" value={stats.camisaPix} color="#10b981" />
          <StatCard icon={CreditCard} label="Cartão" value={stats.camisaCredito} color="#8b5cf6" />
        </div>

        {/* Filters */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex flex-wrap gap-3 p-4">
            <div className="min-w-[200px] flex-1">
              <Input
                placeholder="Buscar por nome, número, WhatsApp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border/50 bg-background/50"
              />
            </div>

            <Select value={filtroParticipacao} onValueChange={setFiltroParticipacao}>
              <SelectTrigger className="w-[160px] border-border/50 bg-background/50">
                <SelectValue placeholder="Participação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="integral">Tempo Integral</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroCamisa} onValueChange={setFiltroCamisa}>
              <SelectTrigger className="w-[150px] border-border/50 bg-background/50">
                <SelectValue placeholder="Camisa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Quer camisa</SelectItem>
                <SelectItem value="nao">Não quer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPagamento} onValueChange={setFiltroPagamento}>
              <SelectTrigger className="w-[150px] border-border/50 bg-background/50">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
                <SelectItem value="credito">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50 bg-card/50 overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-gradient-to-r from-muted/20 to-transparent pb-4">
            <CardTitle className="text-lg">
              Inscrições{" "}
              <span className="font-normal text-muted-foreground">
                ({filteredItems.length}
                {filteredItems.length !== items.length ? ` de ${items.length}` : ""})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-muted/50 p-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">Nenhuma inscrição encontrada</p>
                <p className="text-sm text-muted-foreground">
                  {search || filtroParticipacao !== "todos" || filtroCamisa !== "todos" || filtroPagamento !== "todos"
                    ? "Tente ajustar os filtros de busca."
                    : "Aguarde novas inscrições."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/30">
                      <TableHead className="w-[100px]">Número</TableHead>
                      <TableHead>Participante</TableHead>
                      <TableHead className="w-[120px]">WhatsApp</TableHead>
                      <TableHead>Participação</TableHead>
                      <TableHead className="w-[90px]">Camisa</TableHead>
                      <TableHead className="w-[80px]">Tam.</TableHead>
                      <TableHead className="w-[100px]">Pagamento</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead>
                      <TableHead className="w-[110px]">Data</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const selectedParciais = (Object.entries(item.parcial) as [string, boolean][])
                        .filter(([, v]) => v)
                        .map(([k]) => k);

                      return (
                        <TableRow key={item.id} className="border-border/20 transition-colors hover:bg-muted/30">
                          <TableCell className="whitespace-nowrap font-mono text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-primary/70">{item.numeroInscricao}</span>
                              <Button
                                type="button" size="icon" variant="ghost"
                                className="h-6 w-6 opacity-0 transition-opacity hover:opacity-100"
                                onClick={() => copyText(item.id, item.numeroInscricao)}
                              >
                                {copiedId === item.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{item.nome}</p>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.telefone}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {item.tempoIntegral ? (
                                <Badge className="bg-teal-500/20 text-teal-700 dark:text-teal-400 border-0 text-xs">
                                  <Moon className="mr-1 h-3 w-3" />
                                  Integral
                                </Badge>
                              ) : null}
                              {selectedParciais.map((p) => (
                                <Badge key={p} variant="outline" className="border-teal-500/30 text-xs">
                                  {parcialLabel[p]}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.interesseCamisa ? (
                              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-0 text-xs">
                                <Shirt className="mr-1 h-3 w-3" />
                                Sim
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-center">
                            {item.interesseCamisa && item.tamanhoCamisa ? (
                              <span className="text-foreground">{item.tamanhoCamisa}</span>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.interesseCamisa && item.formaPagamentoCamisa ? (
                              <Badge
                                className={`text-xs border-0 ${
                                  item.formaPagamentoCamisa === "pix"
                                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                    : "bg-violet-500/20 text-violet-700 dark:text-violet-400"
                                }`}
                              >
                                {item.formaPagamentoCamisa === "pix" ? (
                                  <QrCode className="mr-1 h-3 w-3" />
                                ) : (
                                  <CreditCard className="mr-1 h-3 w-3" />
                                )}
                                {pagamentoLabel[item.formaPagamentoCamisa] ?? item.formaPagamentoCamisa}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">—</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={item.status === "confirmado" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {item.status === "confirmado" ? "✓" : "○"} {statusLabel[item.status] ?? item.status}
                              </Badge>
                              {item.status === "pendente" ? (
                                <Button
                                  type="button" variant="outline" size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => markAs(item.id, "confirmado")}
                                  disabled={updatingId === item.id}
                                >
                                  {updatingId === item.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </Button>
                              ) : (
                                <Button
                                  type="button" variant="outline" size="sm"
                                  className="h-6 px-2 text-xs text-muted-foreground"
                                  onClick={() => markAs(item.id, "pendente")}
                                  disabled={updatingId === item.id}
                                >
                                  {updatingId === item.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button" variant="ghost" size="sm" className="h-8 text-xs"
                                onClick={() =>
                                  copyText(
                                    `${item.id}-full`,
                                    [
                                      item.numeroInscricao,
                                      item.nome,
                                      item.telefone,
                                      `Participação: ${getParticipacaoLabel(item)}`,
                                      `Camisa: ${item.interesseCamisa ? "Sim" : "Não"}`,
                                      ...(item.interesseCamisa && item.tamanhoCamisa ? [`Tamanho: ${item.tamanhoCamisa}`] : []),
                                      ...(item.interesseCamisa && item.formaPagamentoCamisa ? [`Pagamento: ${pagamentoLabel[item.formaPagamentoCamisa]}`] : []),
                                      `Status: ${statusLabel[item.status]}`,
                                    ].filter(Boolean).join(" | ")
                                  )
                                }
                              >
                                {copiedId === `${item.id}-full` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                              </Button>
                              <Button
                                type="button" variant="ghost" size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive"
                                onClick={() => deleteRegistration(item.id)}
                                disabled={deletingId === item.id}
                              >
                                {deletingId === item.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
