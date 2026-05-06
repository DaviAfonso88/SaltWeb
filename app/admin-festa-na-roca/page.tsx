"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Users, Wallet, Utensils, Banknote, DollarSign, Trash2, Package } from "lucide-react";

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
import { RegistrationRecord } from "@/lib/festa-roca/types";

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const statusLabel: Record<string, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
};

const observacaoLabel: Record<string, string> = {
  normal: "Normal",
  nao_consigo: "Não consegue",
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

export default function AdminFestaNaRocaPage() {
  const [tipoContribuicao, setTipoContribuicao] = useState("todos");
  const [tipoParticipante, setTipoParticipante] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<RegistrationRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stock, setStock] = useState<{ items: { name: string; stock: number }[]; moneyVagas: number } | null>(null);

  const filteredItems = useMemo(() => {
    const term = normalizeSearch(search);
    if (!term) {
      return items;
    }

    return items.filter((item) => {
      const haystack = normalizeSearch(
        [
          item.numeroInscricao,
          item.nome,
          item.telefone,
          item.observacao ?? "",
          item.tipoContribuicao ?? "",
          item.tipoParticipante,
          item.nomeConvidadoPor ?? "",
          (item.ingredientes ?? []).join(" "),
        ].join(" "),
      );
      return haystack.includes(term);
    });
  }, [items, search]);

  const stats = useMemo(() => {
    const total = filteredItems.length;
    const confirmados = filteredItems.filter(
      (item) => item.status === "confirmado"
    ).length;
    const alimentos = filteredItems.filter(
      (item) => item.tipoContribuicao === "alimento" && item.observacao !== "nao_consigo"
    ).length;
    const valores = filteredItems.filter(
      (item) => item.tipoContribuicao === "valor" && item.observacao !== "nao_consigo"
    ).length;
    const valorTotal = filteredItems.reduce(
      (sum, item) =>
        item.status === "confirmado" && item.tipoContribuicao === "valor"
          ? sum + (item.valor ?? 0)
          : sum,
      0
    );
    const naoConsigo = filteredItems.filter(
      (item) => item.observacao === "nao_consigo"
    ).length;
    const membros = filteredItems.filter(
      (item) => item.tipoParticipante === "membro"
    ).length;
    const convidados = filteredItems.filter(
      (item) => item.tipoParticipante === "convidado"
    ).length;

    return {
      total,
      confirmados,
      alimentos,
      valores,
      valorTotal,
      naoConsigo,
      membros,
      convidados,
    };
  }, [filteredItems]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (tipoContribuicao !== "todos") {
      params.set("tipoContribuicao", tipoContribuicao);
    }
    if (tipoParticipante !== "todos") {
      params.set("tipoParticipante", tipoParticipante);
    }
    if (status !== "todos") {
      params.set("status", status);
    }
    return params.toString();
  }, [tipoContribuicao, tipoParticipante, status]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/festa-na-roca/list${query ? `?${query}` : ""}`
      );
      const data =
        (await response.json()) as RegistrationRecord[] | { message: string };

      if (!response.ok) {
        setError("message" in data ? data.message : "Erro ao carregar inscrições.");
        return;
      }

      setItems(data as RegistrationRecord[]);
    } catch {
      setError("Falha de conexão ao buscar inscrições.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchStock = async () => {
    try {
      const response = await fetch("/api/festa-na-roca/estoque");
      if (response.ok) {
        const data = (await response.json()) as { items: { name: string; stock: number }[]; moneyVagas: number };
        setStock(data);
      }
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    if (!copiedId) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedId(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [copiedId]);

  const clearFilters = () => {
    setTipoContribuicao("todos");
    setTipoParticipante("todos");
    setStatus("todos");
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

  const markAsPaid = async (id: string) => {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch("/api/festa-na-roca/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "confirmado" }),
      });

      const data = (await response.json()) as RegistrationRecord | { message: string };
      if (!response.ok) {
        setError("message" in data ? data.message : "Erro ao confirmar pagamento.");
        return;
      }

      setItems((current) =>
        current.map((item) => (item.id === id ? (data as RegistrationRecord) : item))
      );
    } catch {
      setError("Falha de conexão.");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta inscrição? O estoque será devolvido.")) {
      return;
    }
    setDeletingId(id);
    setError("");
    try {
      const response = await fetch(`/api/festa-na-roca/delete?id=${id}`, {
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
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                Festa na Roça
              </h1>
              <p className="mt-1 text-muted-foreground">
                Painel de inscrições • {new Date().getFullYear()}
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <StatCard
            icon={Users}
            label="Total"
            value={stats.total}
            color="#92348c"
          />
          <StatCard
            icon={Check}
            label="Confirmados"
            value={stats.confirmados}
            color="#22c55e"
          />
          <StatCard
            icon={Utensils}
            label="Alimentos"
            value={stats.alimentos}
            color="#f59e0b"
          />
          <StatCard
            icon={Banknote}
            label="Valor"
            value={stats.valores}
            color="#10b981"
          />
          <StatCard
            icon={Wallet}
            label="Arrecadado"
            value={currency(stats.valorTotal)}
            color="#14b8a6"
          />
          <StatCard
            icon={Users}
            label="Não consegue"
            value={stats.naoConsigo}
            color="#ef4444"
          />
        </div>

        {/* Stock Info */}
        {stock && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Estoque disponível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stock.items
                  .filter((item) => item.stock > 0)
                  .slice(0, 8)
                  .map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                    >
                      <span className="text-sm truncate">{item.name}</span>
                      <span className="font-bold text-primary">{item.stock}</span>
                    </div>
                  ))}
              </div>
              {stock.items.filter((item) => item.stock > 0).length > 8 && (
                <div className="text-sm text-muted-foreground">
                  +{stock.items.filter((item) => item.stock > 0).length - 8} outros itens disponíveis
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <span className="text-sm font-medium">Vagas dinheiro (R$ 40)</span>
                <span className="font-bold text-amber-600">{stock.moneyVagas}</span>
              </div>
              <Button
                onClick={fetchStock}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar estoque
              </Button>
            </CardContent>
          </Card>
        )}

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

            <Select
              value={tipoContribuicao}
              onValueChange={setTipoContribuicao}
            >
              <SelectTrigger className="w-[160px] border-border/50 bg-background/50">
                <SelectValue placeholder="Contribuição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="alimento">Alimento</SelectItem>
                <SelectItem value="valor">Valor</SelectItem>
                <SelectItem value="nao_consigo">Não consegue</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={tipoParticipante}
              onValueChange={setTipoParticipante}
            >
              <SelectTrigger className="w-[140px] border-border/50 bg-background/50">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="membro">Membro</SelectItem>
                <SelectItem value="convidado">Convidado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] border-border/50 bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
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
                {filteredItems.length !== items.length
                  ? ` de ${items.length}`
                  : ""}
                )
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
                  {search || tipoContribuicao !== "todos" || tipoParticipante !== "todos"
                    ? "Tente ajustar os filtros de busca."
                    : "Aguarde novas inscricões."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="border-border/30">
                      <TableHead className="w-[100px]">Número</TableHead>
                      <TableHead>Participante</TableHead>
                      <TableHead>Faixa</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Ingredientes</TableHead>
                      <TableHead>Contribuição</TableHead>
                      <TableHead>Participante</TableHead>
                      <TableHead>Convidado por</TableHead>
                      <TableHead className="w-[90px]">Status</TableHead>
                      <TableHead className="w-[130px]">Data</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item, index) => (
                      <TableRow
                        key={item.id}
                        className="border-border/20 transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="whitespace-nowrap font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-primary/70">
                              {item.numeroInscricao}
                            </span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 opacity-0 transition-opacity hover:opacity-100"
                              onClick={() =>
                                copyText(item.id, item.numeroInscricao)
                              }
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item.nome}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-border/50 text-xs"
                          >
                            {item.faixaEtaria}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-mono text-sm">
                          {item.telefone}
                        </TableCell>
                        <TableCell>
                          {item.observacao === "nao_consigo" ? (
                            <span className="text-xs text-muted-foreground">-</span>
                          ) : (item.ingredientes ?? []).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.ingredientes?.map((ing) => (
                                <Badge
                                  key={ing}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {ing}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.observacao === "nao_consigo" ? (
                            <Badge
                              variant="destructive"
                              className="text-xs"
                            >
                              <span className="mr-1">•</span>
                              Isento
                            </Badge>
                          ) : item.tipoContribuicao === "alimento" ? (
                            <Badge
                              variant="secondary"
                              className="bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs"
                            >
                              <Utensils className="mr-1 h-3 w-3" />
                              Alimento
                            </Badge>
                          ) : item.tipoContribuicao === "valor" ? (
                            <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                              {currency(item.valor ?? 0)}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.tipoParticipante === "membro"
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {item.tipoParticipante === "membro"
                              ? "Membro"
                              : "Convidado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.nomeConvidadoPor ? (
                            <span className="text-sm">{item.nomeConvidadoPor}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                item.status === "confirmado"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.status === "confirmado" ? "✓" : "○"}{" "}
                              {statusLabel[item.status] ?? item.status}
                            </Badge>
                            {item.tipoContribuicao === "valor" &&
                              item.status === "pendente" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => markAsPaid(item.id)}
                                  disabled={updatingId === item.id}
                                >
                                  {updatingId === item.id ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <DollarSign className="h-3 w-3" />
                                  )}
                                  {""}
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
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                copyText(
                                  `${item.id}-full`,
                                  [
                                    item.numeroInscricao,
                                    item.nome,
                                    `Faixa: ${item.faixaEtaria}`,
                                    item.telefone,
                                    `Obs: ${observacaoLabel[item.observacao ?? "normal"]}`,
                                    item.observacao === "nao_consigo"
                                      ? ""
                                      : `Ingredientes: ${(item.ingredientes ?? []).join(", ")}`,
                                    item.observacao === "nao_consigo"
                                      ? ""
                                      : `Contribuição: ${item.tipoContribuicao}${
                                          item.valor ? ` (${currency(item.valor)})` : ""
                                        }`,
                                    `Tipo: ${item.tipoParticipante}`,
                                    item.nomeConvidadoPor
                                      ? `Convidado por: ${item.nomeConvidadoPor}`
                                      : "",
                                    `Status: ${statusLabel[item.status]}`,
                                  ]
                                    .filter(Boolean)
                                    .join(" | "),
                                )
                              }
                            >
                              {copiedId === `${item.id}-full` ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => deleteRegistration(item.id)}
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
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