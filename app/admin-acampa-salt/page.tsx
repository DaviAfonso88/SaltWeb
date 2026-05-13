"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Copy, FileDown, RefreshCw, TrendingUp, Users, Wallet, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Parcela, RegistrationRecord } from "@/lib/acampa/types";
import { generateInscriptionsPDF } from "@/lib/pdf/generator";

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const lotLabel: Record<string, string> = {
  primeiro: "Primeiro Lote",
  segundo: "Segundo Lote",
  terceiro: "Terceiro Lote",
  quarto: "Quarto Lote",
  quinto: "Quinto Lote",
  ultimo: "Ultimo Lote",
};

const categoriaLabel: Record<string, string> = {
  participante: "Participante",
};

const statusLabel: Record<string, string> = {
  pagamento_completo: "Completo",
  pendente_pagamento: "Pendente",
};

const paymentMethodLabel: Record<string, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao: "Cartao",
};

const duplaLabel: Record<string, string> = {
  nao: "Nao",
  irmao: "Irmao",
  conjuge: "Conjuge",
};

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const resolveReceivedAmount = (item: RegistrationRecord) => {
  if (item.status === "pagamento_completo") {
    return item.valorFinal ?? 0;
  }

  if (item.paymentPlan === "carne") {
    return (item.parcelas ?? []).reduce((sum, parcela) => sum + (parcela.pago ? parcela.valor : 0), 0);
  }

  if (item.paymentPlan === "credito") {
    return (item as Record<string, unknown>).valorPagoCredito as number ?? 0;
  }

  return 0;
};

const resolvePendingAmount = (item: RegistrationRecord) => {
  const pending = (item.valorFinal ?? 0) - resolveReceivedAmount(item);
  return pending > 0 ? pending : 0;
};

export default function AdminAcampaSaltPage() {
  const [lote, setLote] = useState("todos");
  const [categoria, setCategoria] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<RegistrationRecord[]>([]);
  const [selectedCarne, setSelectedCarne] = useState<RegistrationRecord | null>(null);
  const [parcelasDraft, setParcelasDraft] = useState<Parcela[]>([]);
  const [savingInstallments, setSavingInstallments] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedCredito, setSelectedCredito] = useState<RegistrationRecord | null>(null);
  const [valorPagoCredito, setValorPagoCredito] = useState("");
  const [savingCredito, setSavingCredito] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<RegistrationRecord | null>(null);
  const [detailsParcelasDraft, setDetailsParcelasDraft] = useState<Parcela[]>([]);
  const [savingDetailsInstallments, setSavingDetailsInstallments] = useState(false);

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
          item.nomeDupla ?? "",
          item.telefone,
          item.email,
          item.igreja,
          item.cidade,
          duplaLabel[item.dupla] ?? item.dupla,
        ].join(" "),
      );
      return haystack.includes(term);
    });
  }, [items, search]);

  const stats = useMemo(() => {
    const participantes = filteredItems.filter((item) => item.dupla === "nao").length;
    const duplas = filteredItems.filter((item) => item.dupla !== "nao").length;
    const total = participantes + duplas;
    const pendentes = filteredItems.filter((item) => item.status === "pendente_pagamento").length;
    const completos = filteredItems.filter((item) => item.status === "pagamento_completo").length;
    const valorRecebido = filteredItems.reduce((sum, item) => sum + resolveReceivedAmount(item), 0);
    const valorRestante = filteredItems.reduce((sum, item) => sum + resolvePendingAmount(item), 0);

    return { total, pendentes, completos, duplas, valorRecebido, valorRestante, participantes };
  }, [filteredItems]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (lote !== "todos") {
      params.set("lote", lote);
    }
    if (categoria !== "todos") {
      params.set("categoria", categoria);
    }
    if (status !== "todos") {
      params.set("status", status);
    }
    return params.toString();
  }, [categoria, lote, status]);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/acampa-salt/list${query ? `?${query}` : ""}`);
      const data = (await response.json()) as RegistrationRecord[] | { message: string };

      if (!response.ok) {
        setError("message" in data ? data.message : "Erro ao carregar inscricoes.");
        return;
      }

      setItems(data as RegistrationRecord[]);
    } catch {
      setError("Falha de conexao ao buscar inscricoes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!copiedId) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedId(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [copiedId]);

  const openInstallments = (item: RegistrationRecord) => {
    setSelectedCarne(item);
    setParcelasDraft(item.parcelas);
  };

  const closeInstallments = () => {
    if (savingInstallments) {
      return;
    }
    setSelectedCarne(null);
    setParcelasDraft([]);
  };

  const toggleInstallment = (index: number, checked: boolean) => {
    setParcelasDraft((current) =>
      current.map((item, idx) => (idx === index ? { ...item, pago: checked } : item))
    );
  };

  const saveInstallments = async () => {
    if (!selectedCarne) {
      return;
    }

    setSavingInstallments(true);
    setError("");
    try {
      const response = await fetch("/api/acampa-salt/installments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCarne.id,
          parcelas: parcelasDraft.map((item) => ({ mes: item.mes, pago: item.pago })),
        }),
      });

      const data = (await response.json()) as RegistrationRecord | { message: string };
      if (!response.ok) {
        setError("message" in data ? data.message : "Falha ao validar parcelas.");
        return;
      }

      const updated = data as RegistrationRecord;
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedCarne(updated);
      setParcelasDraft(updated.parcelas);
    } catch {
      setError("Falha de conexao ao atualizar parcelas.");
    } finally {
      setSavingInstallments(false);
    }
  };

  const openCredito = (item: RegistrationRecord) => {
    setSelectedCredito(item);
    const valorPago = resolveReceivedAmount(item);
    setValorPagoCredito(valorPago > 0 ? valorPago.toString() : "");
  };

  const closeCredito = () => {
    if (savingCredito) {
      return;
    }
    setSelectedCredito(null);
    setValorPagoCredito("");
  };

  const saveCredito = async () => {
    if (!selectedCredito) {
      return;
    }

    const valor = parseFloat(valorPagoCredito.replace(",", "."));
    if (isNaN(valor) || valor < 0) {
      setError("Valor inválido.");
      return;
    }

    setSavingCredito(true);
    setError("");
    try {
      const response = await fetch("/api/acampa-salt/installments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCredito.id,
          valorPagoCredito: valor,
        }),
      });

      const data = (await response.json()) as RegistrationRecord | { message: string };
      if (!response.ok) {
        setError("message" in data ? data.message : "Falha ao salvar pagamento.");
        return;
      }

      const updated = data as RegistrationRecord;
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedCredito(null);
      setValorPagoCredito("");
    } catch {
      setError("Falha de conexao ao salvar pagamento.");
    } finally {
      setSavingCredito(false);
    }
  };

  const openDetails = (item: RegistrationRecord) => {
    setSelectedDetails(item);
    setDetailsParcelasDraft(item.parcelas);
  };

  const closeDetails = () => {
    setSelectedDetails(null);
    setDetailsParcelasDraft([]);
  };

  const toggleDetailsParcela = (index: number) => {
    setDetailsParcelasDraft((current) =>
      current.map((item, idx) => (idx === index ? { ...item, pago: !item.pago } : item))
    );
  };

  const saveDetailsParcelas = async () => {
    if (!selectedDetails) {
      return;
    }

    setSavingDetailsInstallments(true);
    setError("");
    try {
      const response = await fetch("/api/acampa-salt/installments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedDetails.id,
          parcelas: detailsParcelasDraft.map((item) => ({ mes: item.mes, pago: item.pago })),
        }),
      });

      const data = (await response.json()) as RegistrationRecord | { message: string };
      if (!response.ok) {
        setError("message" in data ? data.message : "Falha ao validar parcelas.");
        return;
      }

      const updated = data as RegistrationRecord;
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedDetails(updated);
      setDetailsParcelasDraft(updated.parcelas);
    } catch {
      setError("Falha de conexao ao atualizar parcelas.");
    } finally {
      setSavingDetailsInstallments(false);
    }
  };

  const markAsComplete = async (id: string) => {
    setUpdatingStatusId(id);
    setError("");
    try {
      const response = await fetch("/api/acampa-salt/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "pagamento_completo",
        }),
      });

      const data = (await response.json()) as RegistrationRecord | { message: string };
      if (!response.ok) {
        setError("message" in data ? data.message : "Falha ao atualizar status.");
        return;
      }

      const updated = data as RegistrationRecord;
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError("Falha de conexao ao atualizar status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const clearFilters = () => {
    setLote("todos");
    setCategoria("todos");
    setStatus("todos");
    setSearch("");
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (lote !== "todos") params.set("lote", lote);
      if (categoria !== "todos") params.set("categoria", categoria);
      if (status !== "todos") params.set("status", status);

      const response = await fetch(`/api/acampa-salt/list${params.toString() ? `?${params.toString()}` : ""}`);
      const data = (await response.json()) as RegistrationRecord[] | { message: string };

      if (!response.ok || "message" in data) {
        return;
      }

      generateInscriptionsPDF(data as RegistrationRecord[]);
    } finally {
      setExporting(false);
    }
  };

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
    } catch {
      setError("Nao foi possivel copiar para a area de transferencia.");
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 pb-12 pt-28 md:pb-16 md:pt-32">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Acampa SALT 2026</h1>
        <p className="text-muted-foreground text-lg">Gerencie as inscrições do acampamento</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Inscricoes</p>
              <p className="text-2xl font-bold">
                {stats.total} <span className="text-sm font-normal text-muted-foreground">({stats.participantes} + {stats.duplas} duplas)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
              <TrendingUp className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-amber-500">{stats.pendentes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completos</p>
              <p className="text-2xl font-bold text-green-500">{stats.completos}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <Wallet className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recebido</p>
              <p className="text-2xl font-bold text-emerald-500">{currency(stats.valorRecebido)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/70">
        <CardContent className="grid gap-3 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, numero, WhatsApp, e-mail, igreja..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={lote} onValueChange={setLote}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os lotes</SelectItem>
                  <SelectItem value="primeiro">Primeiro</SelectItem>
                  <SelectItem value="segundo">Segundo</SelectItem>
                  <SelectItem value="terceiro">Terceiro</SelectItem>
                  <SelectItem value="quarto">Quarto</SelectItem>
                  <SelectItem value="quinto">Quinto</SelectItem>
                  <SelectItem value="ultimo">Ultimo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="participante">Participante</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendente_pagamento">Pendente</SelectItem>
                  <SelectItem value="pagamento_completo">Completo</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button onClick={clearFilters} variant="ghost" size="sm" disabled={loading}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
                <Button onClick={exportPDF} disabled={exporting || loading} size="sm" variant="outline">
                  <FileDown className={`h-4 w-4 mr-1 ${exporting ? "animate-spin" : ""}`} />
                  {exporting ? "Gerando..." : "Exportar PDF"}
                </Button>
                <Button onClick={fetchItems} disabled={loading} size="sm">
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>
                Inscricoes{" "}
                <span className="text-muted-foreground">
                  ({filteredItems.length}{filteredItems.length !== items.length ? ` / ${items.length}` : ""})
                </span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-amber-600 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                {stats.pendentes} pendentes
              </span>
              <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {stats.completos} completos
              </span>
              <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                {stats.duplas} duplas
              </span>
              <span className="text-muted-foreground">
                Restante: <span className="font-medium text-amber-500">{currency(stats.valorRestante)}</span>
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
          <div className="rounded-lg border border-border/70">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card/80 backdrop-blur">
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Participante</TableHead>
                  <TableHead>Dupla</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Pago</TableHead>
                  <TableHead className="text-right">Restante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" /> Carregando inscricoes...
                      </span>
                    </TableCell>
                  </TableRow>
                ) : !loading && filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                      Nenhuma inscricao encontrada para os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : null}
                {filteredItems.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${item.status === "pagamento_completo" ? "bg-green-500/5" : "bg-amber-500/5"}`}
                    onClick={() => openDetails(item)}
                  >
                    <TableCell className="whitespace-nowrap font-medium">
                      <div className="flex items-center gap-2">
                        <span>{item.numeroInscricao}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Copiar numero da inscricao"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyText(item.id, item.numeroInscricao);
                          }}
                        >
                          {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {categoriaLabel[item.categoria] ?? item.categoria} • {item.telefone} • {item.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.igreja} • {item.cidade}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.dupla === "nao" ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {duplaLabel[item.dupla] ?? item.dupla}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Qtd: {item.quantidadeConjuges}
                            </span>
                          </div>
                          {(item.nomeDupla ?? "").trim() ? (
                            <p className="text-xs text-muted-foreground">{item.nomeDupla}</p>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.paymentPlan === "carne"
                        ? "Carne SALT (parcelado)"
                        : item.paymentPlan === "credito"
                          ? "Credito - Cartao de credito"
                          : `A vista - ${paymentMethodLabel[item.formaPagamento ?? ""] ?? "Nao informado"}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {lotLabel[item.lote] ?? item.lote}
                        {item.loteTravado ? <Badge variant="secondary">Travado</Badge> : null}
                      </div>
                    </TableCell>
<TableCell className="whitespace-nowrap text-right font-medium">
                      {currency(item.valorFinal)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <span className={resolveReceivedAmount(item) > 0 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                        {currency(resolveReceivedAmount(item))}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {resolvePendingAmount(item) > 0 ? (
                        <span className="text-amber-500 font-medium">{currency(resolvePendingAmount(item))}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.status === "pagamento_completo" ? "default" : "outline"}
                          className={item.status === "pagamento_completo" ? "bg-green-500 hover:bg-green-600" : "border-amber-500 text-amber-600 dark:text-amber-400"}
                        >
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(
                            `${item.id}-full`,
                            [
                              item.numeroInscricao,
                              item.nome,
                              (item.nomeDupla ?? "").trim() ? `Dupla: ${item.nomeDupla}` : "",
                              item.telefone,
                              item.email,
                              item.igreja,
                              item.cidade,
                              `Valor: ${currency(item.valorFinal)}`,
                              `Pendente: ${currency(resolvePendingAmount(item))}`,
                              `Status: ${statusLabel[item.status] ?? item.status}`,
                            ]
                              .filter(Boolean)
                              .join(" | "),
                          );
                        }}
                      >
                        {copiedId === `${item.id}-full` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copiar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCarne} onOpenChange={(open) => (!open ? closeInstallments() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validar parcelas do Carne SALT</DialogTitle>
            <DialogDescription>
              {selectedCarne
                ? `${selectedCarne.numeroInscricao} - ${selectedCarne.nome}${(selectedCarne.nomeDupla ?? "").trim() ? ` (${selectedCarne.nomeDupla})` : ""}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {parcelasDraft.map((parcela, index) => (
              <div
                key={`${parcela.mes}-${index}`}
                className="flex items-center justify-between rounded-md border border-border/70 p-3"
              >
                <div>
                  <p className="text-sm font-medium capitalize">{parcela.mes}</p>
                  <p className="text-xs text-muted-foreground">{currency(parcela.valor)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={parcela.pago}
                    onCheckedChange={(checked) => toggleInstallment(index, checked === true)}
                    id={`parcela-${index}`}
                  />
                  <label htmlFor={`parcela-${index}`} className="text-sm">
                    Pago
                  </label>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeInstallments} disabled={savingInstallments}>
              Fechar
            </Button>
            <Button type="button" onClick={saveInstallments} disabled={savingInstallments}>
              {savingInstallments ? "Salvando..." : "Salvar validacoes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCredito} onOpenChange={(open) => (!open ? closeCredito() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento - Cartao de Credito</DialogTitle>
            <DialogDescription>
              {selectedCredito
                ? `${selectedCredito.numeroInscricao} - ${selectedCredito.nome}${(selectedCredito.nomeDupla ?? "").trim() ? ` (${selectedCredito.nomeDupla})` : ""}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Valor total da inscricao</p>
              <p className="text-xl font-bold">{currency(selectedCredito?.valorFinal ?? 0)}</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="valorPago" className="text-sm font-medium">
                Valor pago
              </label>
              <Input
                id="valorPago"
                type="text"
                placeholder="0,00"
                value={valorPagoCredito}
                onChange={(e) => setValorPagoCredito(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Digite o valor que foi pago pelo participante
              </p>
            </div>

            {selectedCredito && resolvePendingAmount(selectedCredito) > 0 && (
              <div className="rounded-md bg-amber-500/10 p-3">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Restante a pagar: <span className="font-bold">{currency(resolvePendingAmount(selectedCredito))}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCredito} disabled={savingCredito}>
              Fechar
            </Button>
            <Button type="button" onClick={saveCredito} disabled={savingCredito}>
              {savingCredito ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedDetails} onOpenChange={(open) => (!open ? setSelectedDetails(null) : null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Detalhes da Inscricao
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground">
              {selectedDetails?.numeroInscricao} - {selectedDetails?.nome}
            </DialogDescription>
          </DialogHeader>

          {selectedDetails && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Participante</p>
                  <p className="text-sm font-semibold">{selectedDetails.nome}</p>
                  <p className="text-xs text-muted-foreground">{selectedDetails.email}</p>
                  <p className="text-xs text-muted-foreground">{selectedDetails.telefone}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Igreja</p>
                  <p className="text-sm font-semibold">{selectedDetails.igreja}</p>
                  <p className="text-xs text-muted-foreground">{selectedDetails.cidade}</p>
                  <p className="text-xs text-muted-foreground">Idade: {selectedDetails.idade} anos</p>
                </div>
              </div>

              {selectedDetails.dupla !== "nao" && (
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dupla</p>
                    <Badge variant="secondary">{duplaLabel[selectedDetails.dupla]}</Badge>
                    {selectedDetails.quantidadeConjuges > 0 && (
                      <span className="text-xs text-muted-foreground">({selectedDetails.quantidadeConjuges} conjuges)</span>
                    )}
                  </div>
                  {selectedDetails.nomeDupla && (
                    <p className="text-sm font-medium">{selectedDetails.nomeDupla}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border border-border/70 p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lote</p>
                  <p className="text-sm font-semibold">{lotLabel[selectedDetails.lote]}</p>
                  {selectedDetails.loteTravado && <Badge variant="outline" className="text-xs">Travado</Badge>}
                </div>

                <div className="rounded-lg border border-border/70 p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pagamento</p>
                  <p className="text-sm font-semibold">
                    {selectedDetails.paymentPlan === "carne"
                      ? "Carne SALT"
                      : selectedDetails.paymentPlan === "credito"
                        ? "Cartao"
                        : "A vista"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedDetails.formaPagamento ? paymentMethodLabel[selectedDetails.formaPagamento] : "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor Total</p>
                  <p className="text-sm font-bold text-primary">{currency(selectedDetails.valorFinal)}</p>
                  {selectedDetails.valorOriginal !== selectedDetails.valorFinal && (
                    <p className="text-xs text-muted-foreground line-through">De: {currency(selectedDetails.valorOriginal)}</p>
                  )}
                </div>

                <div className="rounded-lg border border-border/70 p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</p>
                  <Badge
                    variant={selectedDetails.status === "pagamento_completo" ? "default" : "outline"}
                    className={selectedDetails.status === "pagamento_completo" ? "bg-green-500" : "border-amber-500 text-amber-600"}
                  >
                    {statusLabel[selectedDetails.status]}
                  </Badge>
                </div>
              </div>

              {selectedDetails.paymentPlan !== "carne" && selectedDetails.paymentPlan !== "credito" && (
                selectedDetails.status === "pendente_pagamento" ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/acampa-salt/status", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: selectedDetails.id,
                            status: "pagamento_completo",
                          }),
                        });

                        if (response.ok) {
                          const updated = await response.json() as RegistrationRecord;
                          setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                          setSelectedDetails(updated);
                        }
                      } catch {
                        setError("Falha ao confirmar pagamento.");
                      }
                    }}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar Pagamento
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/acampa-salt/status", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: selectedDetails.id,
                            status: "pendente_pagamento",
                          }),
                        });

                        if (response.ok) {
                          const updated = await response.json() as RegistrationRecord;
                          setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
                          setSelectedDetails(updated);
                        }
                      } catch {
                        setError("Falha ao cancelar pagamento.");
                      }
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Pagamento
                  </Button>
                )
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-green-500/10 p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Pago</p>
                  <p className="text-xl font-bold text-green-500">{currency(resolveReceivedAmount(selectedDetails))}</p>
                </div>
                <div className="rounded-lg bg-amber-500/10 p-4 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Restante</p>
                  <p className="text-xl font-bold text-amber-500">{currency(resolvePendingAmount(selectedDetails))}</p>
                </div>
              </div>

              {selectedDetails.paymentPlan === "carne" && detailsParcelasDraft.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Parcelas do Carne SALT</p>
                    <p className="text-xs text-muted-foreground">Clique para marcar/desmarcar</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {detailsParcelasDraft.map((parcela, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDetailsParcela(idx)}
                        className={`rounded-md border p-2 flex items-center justify-between transition-all cursor-pointer hover:scale-[1.02] ${
                          parcela.pago 
                            ? "border-green-500 bg-green-500/20" 
                            : "border-border/70 hover:border-amber-500/50"
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-xs font-medium capitalize">{parcela.mes}</p>
                          <p className="text-xs text-muted-foreground">{currency(parcela.valor)}</p>
                        </div>
                        {parcela.pago && <Check className="h-4 w-4 text-green-500" />}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={saveDetailsParcelas}
                    disabled={savingDetailsInstallments}
                    className="w-full"
                  >
                    {savingDetailsInstallments ? "Salvando..." : "Salvar Parcelas"}
                  </Button>
                </div>
              )}

              {selectedDetails.paymentPlan === "credito" && (
                <div className="rounded-lg border border-border/70 p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cartao de Credito</p>
                  <p className="text-sm">
                    Valor pago: <span className="font-medium text-green-500">{currency(selectedDetails.valorPagoCredito ?? 0)}</span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetails(null);
                      openCredito(selectedDetails);
                    }}
                  >
                    Atualizar pagamento
                  </Button>
                </div>
              )}

              <div className="pt-2 border-t border-border/70">
                <p className="text-xs text-muted-foreground">
                  Inscricao realizada em: {new Date(selectedDetails.createdAt).toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mes de inscricao: {selectedDetails.mesInscricao}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSelectedDetails(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
