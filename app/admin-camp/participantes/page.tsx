"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  RefreshCw,
  Filter,
  X,
  Loader2,
  Trash2,
  Trash,
  Download,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { Participant } from "@/lib/participant/types";

export default function ParticipantesPage() {
  const router = useRouter();
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSexo, setFilterSexo] = useState("");
  const [filterSaude, setFilterSaude] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/camp-admin/participants?limit=9999");
      const data = await res.json();
      if (res.ok) {
        setAllParticipants(data.participants || []);
      }
    } catch {
      toast.error("Erro ao carregar participantes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  useEffect(() => {
    let filtered = allParticipants;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nome?.toLowerCase().includes(q) ||
          p.numero?.toLowerCase().includes(q)
      );
    }

    if (filterSexo) {
      filtered = filtered.filter((p) => p.sexo === filterSexo);
    }

    if (filterSaude) {
      filtered = filtered.filter((p) => {
        switch (filterSaude) {
          case "alergia":
            return (p.saude?.alergias?.length ?? 0) > 0;
          case "medicamento":
            return (p.saude?.medicamentos?.length ?? 0) > 0;
          case "restricao":
            return (p.saude?.restricoesAlimentares?.length ?? 0) > 0;
          case "ne":
            return p.saude?.necessidadesEspeciais === true;
          case "qualquer":
            return (
              (p.saude?.alergias?.length ?? 0) > 0 ||
              (p.saude?.medicamentos?.length ?? 0) > 0 ||
              (p.saude?.restricoesAlimentares?.length ?? 0) > 0 ||
              p.saude?.necessidadesEspeciais === true
            );
          default:
            return true;
        }
      });
    }

    setParticipants(filtered);
  }, [allParticipants, search, filterSexo, filterSaude]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/camp-admin/participants/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Participante excluído");
        setParticipants((prev) => prev.filter((p) => p.id !== deleteId));
        setDeleteId(null);
      } else {
        toast.error("Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir participante");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const res = await fetch("/api/camp-admin/participants", {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${data.deleted} participante(s) excluído(s)`);
        setParticipants([]);
        setDeleteAllOpen(false);
      } else {
        toast.error(data.error || "Erro ao excluir participantes");
      }
    } catch {
      toast.error("Erro ao excluir participantes");
    } finally {
      setDeletingAll(false);
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      toast.error("Nenhum participante para exportar");
      return;
    }

    const headers = ["Nº", "Nome", "Idade", "Sexo", "Igreja", "Cidade", "Celular", "Email", "Alergias", "Medicamentos", "Restrições Alimentares", "Necessidades Especiais"];
    const rows = participants.map((p) => [
      p.numero || "",
      p.nome || "",
      p.idade?.toString() || "",
      p.sexo === "M" ? "Masculino" : p.sexo === "F" ? "Feminino" : "",
      p.igreja || "",
      p.cidade || "",
      p.celular || "",
      p.email || "",
      p.saude?.alergias?.join("; ") || "",
      p.saude?.medicamentos?.join("; ") || "",
      p.saude?.restricoesAlimentares?.join("; ") || "",
      p.saude?.necessidadesEspeciais ? "Sim" : "Não",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `participantes-salt-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  const clearFilters = () => {
    setSearch("");
    setFilterSexo("");
    setFilterSaude("");
  };

  const hasFilters = search || filterSexo || filterSaude;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight">
            Participantes
          </h1>
          <p className="text-muted-foreground">
            {participants.length} participante{participants.length !== 1 ? "s" : ""} encontrado{participants.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400"
          >
            <Download className="mr-1.5 size-3.5" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParticipants}
          >
            <RefreshCw className="mr-1.5 size-3.5" />
            Atualizar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash className="mr-1.5 size-3.5" />
            Excluir Todos
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/admin-camp/importar")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
          >
            <Plus className="mr-1.5 size-3.5" />
            Importar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou número..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-amber-500/10 focus-visible:ring-amber-500/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filterSexo}
                onValueChange={(val) => setFilterSexo(val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-[150px] border-amber-500/10">
                  <Filter className="mr-2 size-3 text-amber-400" />
                  <SelectValue placeholder="Sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterSaude}
                onValueChange={(val) => setFilterSaude(val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-[200px] border-amber-500/10">
                  <Filter className="mr-2 size-3 text-amber-400" />
                  <SelectValue placeholder="Saúde" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="qualquer">Com qualquer problema</SelectItem>
                  <SelectItem value="alergia">Com alergias</SelectItem>
                  <SelectItem value="medicamento">Usam medicamentos</SelectItem>
                  <SelectItem value="restricao">Restrições alimentares</SelectItem>
                  <SelectItem value="ne">Necessidades especiais</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                  <X className="mr-1 size-3" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-amber-400" />
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <Users className="size-7 text-amber-400" />
              </div>
              <p className="text-muted-foreground">
                Nenhum participante encontrado
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="border-amber-500/20">
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-amber-500/10 hover:bg-transparent">
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nº</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Saúde</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => {
                    const healthBadges = [];
                    if (p.saude?.alergias?.length > 0)
                      healthBadges.push(
                        <Badge key="alergia" className="border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs">
                          Alergia
                        </Badge>
                      );
                    if (p.saude?.medicamentos?.length > 0)
                      healthBadges.push(
                        <Badge key="remedio" className="border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs">
                          Remédio
                        </Badge>
                      );
                    if (p.saude?.restricoesAlimentares?.length > 0)
                      healthBadges.push(
                        <Badge key="dieta" className="border-orange-500/20 bg-orange-500/10 text-orange-400 text-xs">
                          Dieta
                        </Badge>
                      );
                    if (p.saude?.necessidadesEspeciais)
                      healthBadges.push(
                        <Badge key="ne" className="border-violet-500/20 bg-violet-500/10 text-violet-400 text-xs">
                          NE
                        </Badge>
                      );

                    return (
                      <TableRow key={p.id} className="group cursor-pointer border-amber-500/5 transition-colors hover:bg-amber-500/[0.02]" onClick={() => router.push(`/admin-camp/participantes/${p.id}`)}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {p.numero}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.nome}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {healthBadges.length > 0 ? healthBadges : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/10"
                              onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                            >
                              <Trash2 className="size-4" />
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="border-amber-500/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir participante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O participante e todos os seus
              dados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete all confirmation */}
      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent className="border-amber-500/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir TODOS os participantes?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os participantes e seus dados
              serão removidos permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAll ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash className="mr-2 size-4" />
              )}
              Excluir Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
