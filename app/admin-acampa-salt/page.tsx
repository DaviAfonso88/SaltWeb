"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, RefreshCw, X } from "lucide-react";

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
  isento: "Isento",
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

const resolvePendingAmount = (item: RegistrationRecord) => {
  if (item.status === "isento") {
    return 0;
  }

  if (item.paymentPlan === "carne") {
    return (item.parcelas ?? []).reduce((sum, parcela) => sum + (parcela.pago ? 0 : parcela.valor), 0);
  }

  return item.valorFinal ?? 0;
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
    const total = filteredItems.length;
    const pendentes = filteredItems.filter((item) => item.status === "pendente_pagamento").length;
    const isentos = filteredItems.filter((item) => item.status === "isento").length;
    const duplas = filteredItems.filter((item) => item.dupla !== "nao").length;
    const valorTotal = filteredItems.reduce((sum, item) => sum + (item.valorFinal ?? 0), 0);
    const valorPendente = filteredItems.reduce((sum, item) => sum + resolvePendingAmount(item), 0);

    return { total, pendentes, isentos, duplas, valorTotal, valorPendente };
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

  const markAsIsento = async (id: string) => {
    setUpdatingStatusId(id);
    setError("");
    try {
      const response = await fetch("/api/acampa-salt/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "isento",
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
      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Painel Acampa SALT 2026</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nome, numero, WhatsApp, e-mail, igreja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={lote} onValueChange={setLote}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por lote" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os lotes</SelectItem>
              <SelectItem value="primeiro">Primeiro lote</SelectItem>
              <SelectItem value="segundo">Segundo lote</SelectItem>
              <SelectItem value="terceiro">Terceiro lote</SelectItem>
              <SelectItem value="quarto">Quarto lote</SelectItem>
              <SelectItem value="quinto">Quinto lote</SelectItem>
              <SelectItem value="ultimo">Ultimo lote</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              <SelectItem value="participante">Participante</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente_pagamento">Pendente</SelectItem>
              <SelectItem value="isento">Isento</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 md:col-span-5 md:justify-end">
            <Button onClick={clearFilters} variant="ghost" disabled={loading}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
            <Button onClick={fetchItems} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Inscricoes{" "}
              <span className="text-muted-foreground">
                ({filteredItems.length}{filteredItems.length !== items.length ? ` de ${items.length}` : ""})
              </span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Pendentes: {stats.pendentes}</Badge>
              <Badge variant="secondary">Isentos: {stats.isentos}</Badge>
              <Badge variant="secondary">Duplas: {stats.duplas}</Badge>
              <Badge variant="secondary">Total: {currency(stats.valorTotal)}</Badge>
              <Badge variant="secondary">Pendente: {currency(stats.valorPendente)}</Badge>
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
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Valor</TableHead>
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
                  <TableRow key={item.id} className="odd:bg-muted/20">
                    <TableCell className="whitespace-nowrap font-medium">
                      <div className="flex items-center gap-2">
                        <span>{item.numeroInscricao}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label="Copiar numero da inscricao"
                          onClick={() => copyText(item.id, item.numeroInscricao)}
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
                      {item.paymentPlan === "carne" ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {item.parcelas.filter((parcela) => parcela.pago).length}/{item.parcelas.length}
                          </Badge>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openInstallments(item)}
                          >
                            Validar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {lotLabel[item.lote] ?? item.lote}
                        {item.loteTravado ? <Badge variant="secondary">Travado</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="font-medium">{currency(item.valorFinal)}</p>
                      <p className="text-xs text-muted-foreground">
                        Pendente: {currency(resolvePendingAmount(item))}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === "isento" ? "default" : "secondary"}>
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                        {item.status === "pendente_pagamento" ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => markAsIsento(item.id)}
                            disabled={updatingStatusId === item.id}
                          >
                            {updatingStatusId === item.id ? "Salvando..." : "Marcar isento"}
                          </Button>
                        ) : null}
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
                        onClick={() =>
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
                          )
                        }
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
    </div>
  );
}
