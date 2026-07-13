"use client";

import { useEffect, useState } from "react";
import {
  UserCog,
  Plus,
  Trash2,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { ROLE_LABELS } from "@/lib/participant/constants";

interface User {
  username: string;
  role: string;
  displayName: string;
  createdAt: string;
}

const ROLE_STYLES: Record<string, { icon: React.ReactNode; className: string }> = {
  admin: {
    icon: <ShieldCheck className="size-3.5" />,
    className: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  },
  saude: {
    icon: <ShieldAlert className="size-3.5" />,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  lider: {
    icon: <Shield className="size-3.5" />,
    className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  recepcao: {
    icon: <Eye className="size-3.5" />,
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "recepcao",
  });

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/camp-admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.displayName) {
      toast.error("Preencha todos os campos");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/camp-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Usuário criado!");
        setDialogOpen(false);
        setForm({ username: "", password: "", displayName: "", role: "recepcao" });
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao criar usuário");
      }
    } catch {
      toast.error("Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      const res = await fetch(
        `/api/camp-admin/users?username=${deleteUser}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Usuário excluído");
        setUsers((prev) => prev.filter((u) => u.username !== deleteUser));
        setDeleteUser(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao excluir");
      }
    } catch {
      toast.error("Erro ao excluir usuário");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight">
            Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie os acessos ao sistema
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
              <Plus className="mr-1.5 size-3.5" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="border-amber-500/10">
            <DialogHeader>
              <DialogTitle>Criar Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome de exibição</Label>
                <Input
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  placeholder="João Silva"
                  className="border-amber-500/10 focus-visible:ring-amber-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Usuário</Label>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="joao.silva"
                  className="border-amber-500/10 focus-visible:ring-amber-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Senha</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="border-amber-500/10 focus-visible:ring-amber-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Perfil</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, role: v }))
                  }
                >
                  <SelectTrigger className="border-amber-500/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="saude">Equipe de Saúde</SelectItem>
                    <SelectItem value="lider">Líder</SelectItem>
                    <SelectItem value="recepcao">Recepção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-amber-500/20"
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={creating} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                {creating && (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                )}
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-amber-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <UserCog className="size-7 text-amber-400" />
              </div>
              <p className="text-muted-foreground">
                Nenhum usuário cadastrado
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-amber-500/10 hover:bg-transparent">
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Usuário</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Perfil</TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Criado em</TableHead>
                  <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.recepcao;
                  return (
                    <TableRow key={user.username} className="group border-amber-500/5 transition-colors hover:bg-amber-500/[0.02]">
                      <TableCell className="font-mono text-sm">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`gap-1.5 ${roleStyle.className}`}>
                          {roleStyle.icon}
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive opacity-60 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                          onClick={() => setDeleteUser(user.username)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent className="border-amber-500/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário perderá acesso ao
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
