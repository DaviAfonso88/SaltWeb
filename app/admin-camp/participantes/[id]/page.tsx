"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Users,
  HeartPulse,
  MessageSquare,
  History,
  Loader2,
  Plus,
  Save,
  Trash2,
  Edit3,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { Participant } from "@/lib/participant/types";

export default function ParticipantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Participant>>({});
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetch(`/api/camp-admin/participants/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setParticipant)
      .catch(() => {
        toast.error("Participante não encontrado");
        router.push("/admin-camp/participantes");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/camp-admin/participants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updated = await res.json();
        setParticipant(updated);
        setEditing(false);
        setEditData({});
        toast.success("Salvo com sucesso!");
      } else {
        toast.error("Erro ao salvar");
      }
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleHealthUpdate = async (healthData: Partial<Participant["saude"]>) => {
    try {
      const res = await fetch(`/api/camp-admin/participants/${id}/health`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(healthData),
      });
      if (res.ok) {
        const updated = await res.json();
        setParticipant(updated);
        toast.success("Saúde atualizada!");
      }
    } catch {
      toast.error("Erro ao atualizar saúde");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/camp-admin/participants/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: newNote }),
      });
      if (res.ok) {
        const note = await res.json();
        setParticipant((prev) =>
          prev
            ? { ...prev, observacoes: [...prev.observacoes, note] }
            : prev
        );
        setNewNote("");
        toast.success("Observação adicionada!");
      }
    } catch {
      toast.error("Erro ao adicionar observação");
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!participant) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin-camp/participantes")}
            className="size-9 shrink-0 hover:bg-amber-500/10 hover:text-amber-400"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-[family-name:var(--font-poppins)] text-xl font-bold tracking-tight sm:text-2xl">
                {participant.nome}
              </h1>
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-xs">
                {participant.numero}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {[participant.igreja, participant.cidade].filter(Boolean).join(" • ") || "Sem informações"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-end">
          {editing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setEditData({});
                }}
                className="border-amber-500/20"
              >
                <X className="mr-1.5 size-3.5" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                {saving ? (
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                ) : (
                  <Save className="mr-1.5 size-3.5" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(true);
                setEditData({
                  nome: participant.nome,
                  sexo: participant.sexo,
                  dataNascimento: participant.dataNascimento,
                  cpf: participant.cpf,
                  celular: participant.celular,
                  whatsapp: participant.whatsapp,
                  email: participant.email,
                });
              }}
              className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400"
            >
              <Edit3 className="mr-1.5 size-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dados" className="w-full">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:justify-start bg-card/50 border border-amber-500/10">
            <TabsTrigger value="dados" className="gap-2 whitespace-nowrap data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
              <User className="size-4" />
              <span className="hidden sm:inline">Dados Pessoais</span>
              <span className="sm:hidden">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="contatos" className="gap-2 whitespace-nowrap data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
              <Phone className="size-4" />
              <span className="hidden sm:inline">Contatos</span>
              <span className="sm:hidden">Contato</span>
            </TabsTrigger>
            <TabsTrigger value="responsaveis" className="gap-2 whitespace-nowrap data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
              <Users className="size-4" />
              <span className="hidden sm:inline">Responsáveis</span>
              <span className="sm:hidden">Resp.</span>
            </TabsTrigger>
            <TabsTrigger value="saude" className="gap-2 whitespace-nowrap data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
              <HeartPulse className="size-4" />
              Saúde
            </TabsTrigger>
            <TabsTrigger value="observacoes" className="gap-2 whitespace-nowrap data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
              <MessageSquare className="size-4" />
              <span className="hidden sm:inline">Observações</span>
              <span className="sm:hidden">Obs.</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2 whitespace-nowrap data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">
              <History className="size-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Dados Pessoais */}
        <TabsContent value="dados">
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldEdit
                    label="Nome Completo"
                    value={editData.nome || ""}
                    onChange={(v) => setEditData((d) => ({ ...d, nome: v }))}
                    className="sm:col-span-2"
                  />
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sexo</Label>
                    <Select
                      value={editData.sexo || ""}
                      onValueChange={(v) =>
                        setEditData((d) => ({ ...d, sexo: v as "M" | "F" }))
                      }
                    >
                      <SelectTrigger className="border-amber-500/10 bg-transparent">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FieldEdit
                    label="Data de Nascimento"
                    value={editData.dataNascimento || ""}
                    onChange={(v) => setEditData((d) => ({ ...d, dataNascimento: v }))}
                    type="date"
                  />
                  <FieldEdit
                    label="CPF"
                    value={editData.cpf || ""}
                    onChange={(v) => setEditData((d) => ({ ...d, cpf: v }))}
                    placeholder="000.000.000-00"
                  />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldDisplay label="Nome Completo" value={participant.nome} />
                  <FieldDisplay
                    label="Sexo"
                    value={
                      participant.sexo === "M"
                        ? "Masculino"
                        : participant.sexo === "F"
                          ? "Feminino"
                          : "Não informado"
                    }
                  />
                  <FieldDisplay
                    label="Data de Nascimento"
                    value={formatDate(participant.dataNascimento || "")}
                  />
                  <FieldDisplay
                    label="Idade"
                    value={
                      participant.idade !== null
                        ? `${participant.idade} anos`
                        : "-"
                    }
                  />
                  <FieldDisplay label="CPF" value={participant.cpf || "-"} />
                  <FieldDisplay
                    label="Tipo Sanguíneo"
                    value={participant.saude?.tipoSanguineo || "-"}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Contatos */}
        <TabsContent value="contatos">
          <div className="flex flex-col gap-4">
            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Contato do Participante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldDisplay label="Celular" value={participant.celular || "-"} />
                  <FieldDisplay label="WhatsApp" value={participant.whatsapp || "-"} />
                  <FieldDisplay label="Email" value={participant.email || "-"} className="sm:col-span-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Contato de Emergência</CardTitle>
              </CardHeader>
              <CardContent>
                {participant.contatoEmergencia ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldDisplay label="Nome" value={participant.contatoEmergencia.nome} />
                    <FieldDisplay label="Parentesco" value={participant.contatoEmergencia.parentesco || "-"} />
                    <FieldDisplay label="Telefone" value={participant.contatoEmergencia.telefone} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum contato de emergência cadastrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Responsáveis */}
        <TabsContent value="responsaveis">
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Responsáveis</CardTitle>
              <CardDescription>
                {participant.responsaveis.length} responsável(es)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {participant.responsaveis.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhum responsável cadastrado
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {participant.responsaveis.map((resp) => (
                    <div key={resp.id} className="rounded-xl border border-amber-500/10 bg-white/[0.02] p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FieldDisplay label="Nome" value={resp.nome} />
                        <FieldDisplay label="Parentesco" value={resp.grauParentesco} />
                        <FieldDisplay label="Telefone" value={resp.telefone} />
                        {resp.whatsapp && (
                          <FieldDisplay label="WhatsApp" value={resp.whatsapp} />
                        )}
                        {resp.email && (
                          <FieldDisplay label="Email" value={resp.email} className="sm:col-span-2" />
                        )}
                      </div>
                      {resp.observacoes && (
                        <div className="mt-3 border-t border-amber-500/10 pt-3">
                          <FieldDisplay label="Observações" value={resp.observacoes} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Saúde */}
        <TabsContent value="saude">
          <div className="flex flex-col gap-4">
            <HealthPanel
              participant={participant}
              onUpdate={handleHealthUpdate}
            />
          </div>
        </TabsContent>

        {/* Tab: Observações */}
        <TabsContent value="observacoes">
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Observações</CardTitle>
              <CardDescription>
                Anotações da equipe sobre o participante
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicionar observação..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  className="border-amber-500/10 focus-visible:ring-amber-500/20"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                  size="icon"
                  className="shrink-0 self-end bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                  {addingNote ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </Button>
              </div>

              <Separator className="bg-amber-500/10" />

              {participant.observacoes.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhuma observação registrada
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...participant.observacoes]
                    .reverse()
                    .map((obs) => (
                      <div key={obs.id} className="rounded-xl border border-amber-500/10 bg-white/[0.02] p-4">
                        <p className="text-sm">{obs.texto}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {obs.autor} •{" "}
                          {new Date(obs.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="historico">
          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              {participant.historico.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Nenhuma alteração registrada
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {[...participant.historico]
                    .reverse()
                    .map((entry) => (
                      <div key={entry.id} className="rounded-xl border border-amber-500/10 bg-white/[0.02] p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {entry.campo}
                            </p>
                            {entry.valorAnterior && (
                              <p className="text-xs text-muted-foreground">
                                De: {entry.valorAnterior}
                              </p>
                            )}
                            {entry.valorNovo && (
                              <p className="text-xs text-emerald-400">
                                Para: {entry.valorNovo}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-left sm:text-right">
                            <p className="text-xs text-muted-foreground">
                              {entry.autor}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString("pt-BR")}{" "}
                              {new Date(entry.createdAt).toLocaleTimeString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const brMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${day}/${month}/${year}`;
  }
  const brShortMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (brShortMatch) {
    const [, day, month, yearShort] = brShortMatch;
    const y = parseInt(yearShort, 10);
    const fullYear = y < 100 ? 2000 + y : y;
    return `${day}/${month}/${fullYear}`;
  }
  const ptMatch = dateStr.match(/^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\.?\s+de\s+(\d{4})$/i);
  if (ptMatch) {
    return `${ptMatch[1]}. de ${ptMatch[2]}`;
  }
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

function FieldDisplay({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className || ""}`}>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function FieldEdit({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-amber-500/10 bg-transparent focus-visible:ring-amber-500/20"
      />
    </div>
  );
}

function HealthPanel({
  participant,
  onUpdate,
}: {
  participant: Participant;
  onUpdate: (data: Partial<Participant["saude"]>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [healthData, setHealthData] = useState<Participant["saude"]>(
    participant.saude
  );

  const addListItem = (field: "alergias" | "medicamentos" | "restricoesAlimentares" | "observacoesMedicas", value: string) => {
    if (!value.trim()) return;
    setHealthData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
    }));
  };

  const removeListItem = (
    field: "alergias" | "medicamentos" | "restricoesAlimentares" | "observacoesMedicas",
    index: number
  ) => {
    setHealthData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onUpdate(healthData);
    setEditing(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold tracking-tight">
          Informações de Saúde
        </h3>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="border-amber-500/20">
                <X className="mr-1.5 size-3.5" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                <Save className="mr-1.5 size-3.5" />
                Salvar
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400">
              <Edit3 className="mr-1.5 size-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      {/* Dados gerais de saúde */}
      <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Dados de Saúde</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldEdit
                label="Tipo Sanguíneo"
                value={healthData.tipoSanguineo || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, tipoSanguineo: v || undefined }))}
                placeholder="Ex: O+, A-"
              />
              <FieldEdit
                label="Condição Médica"
                value={healthData.condicaoEspecificacao || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, condicaoEspecificacao: v || undefined }))}
              />
              <FieldEdit
                label="Deficiência"
                value={healthData.deficiencia || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, deficiencia: v || undefined }))}
              />
              <FieldEdit
                label="Especificação da Deficiência"
                value={healthData.deficienciaEspecificacao || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, deficienciaEspecificacao: v || undefined }))}
              />
              <FieldEdit
                label="Reação das Alergias"
                value={healthData.alergiaReacao || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, alergiaReacao: v || undefined }))}
              />
              <FieldEdit
                label="Medicação para Alergia"
                value={healthData.alergiaMedicacao || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, alergiaMedicacao: v || undefined }))}
              />
              <FieldEdit
                label="Restrições Físicas"
                value={healthData.restricoesFisicas || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, restricoesFisicas: v || undefined }))}
              />
              <FieldEdit
                label="Outra Informação sobre Saúde"
                value={healthData.outraInfoSaude || ""}
                onChange={(v) => setHealthData((d) => ({ ...d, outraInfoSaude: v || undefined }))}
                className="sm:col-span-2"
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldDisplay label="Tipo Sanguíneo" value={healthData.tipoSanguineo || "-"} />
              <FieldDisplay label="Condição Médica" value={healthData.condicoes.length > 0 ? healthData.condicoes.join(", ") : "-"} />
              {healthData.condicaoEspecificacao && (
                <FieldDisplay label="Especificação da Condição" value={healthData.condicaoEspecificacao} />
              )}
              <FieldDisplay label="Deficiência" value={healthData.deficiencia || "-"} />
              {healthData.deficienciaEspecificacao && (
                <FieldDisplay label="Especificação da Deficiência" value={healthData.deficienciaEspecificacao} />
              )}
              <FieldDisplay label="Reação das Alergias" value={healthData.alergiaReacao || "-"} />
              <FieldDisplay label="Medicação para Alergia" value={healthData.alergiaMedicacao || "-"} />
              <FieldDisplay label="Restrições Físicas" value={healthData.restricoesFisicas || "-"} />
              {healthData.outraInfoSaude && (
                <FieldDisplay label="Outra Informação sobre Saúde" value={healthData.outraInfoSaude} className="sm:col-span-2" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Necessidades Especiais */}
      <Card className="border-violet-500/10 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Necessidades Especiais</CardTitle>
          <CardDescription>
            Marque se o participante é portador de necessidades pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="necessidadesEspeciais"
                  checked={healthData.necessidadesEspeciais}
                  onCheckedChange={(checked) =>
                    setHealthData((d) => ({
                      ...d,
                      necessidadesEspeciais: checked === true,
                      necessidadesEspeciaisDescricao: checked === true ? d.necessidadesEspeciaisDescricao : undefined,
                    }))
                  }
                />
                <Label
                  htmlFor="necessidadesEspeciais"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Portador de Necessidades Pessoais
                </Label>
              </div>
              {healthData.necessidadesEspeciais && (
                <div className="space-y-2">
                  <Label htmlFor="necessidadesEspeciaisDescricao" className="text-sm text-muted-foreground">
                    Descreva as necessidades (opcional)
                  </Label>
                  <Textarea
                    id="necessidadesEspeciaisDescricao"
                    placeholder="Ex: Cadeirante, necessita de intérprete de Libras, deficiência visual..."
                    value={healthData.necessidadesEspeciaisDescricao || ""}
                    onChange={(e) =>
                      setHealthData((d) => ({
                        ...d,
                        necessidadesEspeciaisDescricao: e.target.value || undefined,
                      }))
                    }
                    rows={3}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${healthData.necessidadesEspeciais ? "bg-violet-500" : "bg-muted"}`} />
                <span className="text-sm">
                  {healthData.necessidadesEspeciais ? "Sim" : "Não"}
                </span>
              </div>
              {healthData.necessidadesEspeciais && healthData.necessidadesEspeciaisDescricao && (
                <p className="text-sm text-muted-foreground mt-2 pl-4.5">
                  {healthData.necessidadesEspeciaisDescricao}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lists */}
      <div className="grid gap-4 sm:grid-cols-2">
        <HealthListCard
          title="Alergias"
          items={healthData.alergias}
          editing={editing}
          onAdd={(v) => addListItem("alergias", v)}
          onRemove={(i) => removeListItem("alergias", i)}
          accentColor="rose"
        />
        <HealthListCard
          title="Medicamentos"
          items={healthData.medicamentos}
          editing={editing}
          onAdd={(v) => addListItem("medicamentos", v)}
          onRemove={(i) => removeListItem("medicamentos", i)}
          accentColor="amber"
        />
        <HealthListCard
          title="Restrições Alimentares"
          items={healthData.restricoesAlimentares}
          editing={editing}
          onAdd={(v) => addListItem("restricoesAlimentares", v)}
          onRemove={(i) => removeListItem("restricoesAlimentares", i)}
          accentColor="orange"
        />
        <HealthListCard
          title="Observações Médicas"
          items={healthData.observacoesMedicas}
          editing={editing}
          onAdd={(v) => addListItem("observacoesMedicas", v)}
          onRemove={(i) => removeListItem("observacoesMedicas", i)}
          accentColor="violet"
        />
      </div>
    </>
  );
}

function HealthListCard({
  title,
  items,
  editing,
  onAdd,
  onRemove,
  accentColor,
}: {
  title: string;
  items: string[];
  editing: boolean;
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  accentColor: "rose" | "amber" | "orange" | "violet";
}) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    onAdd(newItem);
    setNewItem("");
  };

  const colorMap = {
    rose: { border: "border-rose-500/10", bg: "bg-rose-500/10", text: "text-rose-400", itemBg: "bg-rose-500/5 border-rose-500/10" },
    amber: { border: "border-amber-500/10", bg: "bg-amber-500/10", text: "text-amber-400", itemBg: "bg-amber-500/5 border-amber-500/10" },
    orange: { border: "border-orange-500/10", bg: "bg-orange-500/10", text: "text-orange-400", itemBg: "bg-orange-500/5 border-orange-500/10" },
    violet: { border: "border-violet-500/10", bg: "bg-violet-500/10", text: "text-violet-400", itemBg: "bg-violet-500/5 border-violet-500/10" },
  };

  const colors = colorMap[accentColor];

  return (
    <Card className={`${colors.border} bg-gradient-to-br from-card to-card/50`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.length === 0 && !editing ? (
          <p className="text-sm text-muted-foreground">Nenhum registro</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${colors.itemBg}`}>
              <span className="min-w-0 flex-1 text-sm">{item}</span>
              {editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0 hover:bg-destructive/10"
                  onClick={() => onRemove(i)}
                >
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              )}
            </div>
          ))
        )}
        {editing && (
          <div className="flex gap-2">
            <Input
              placeholder={`Adicionar ${title.toLowerCase()}...`}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="border-amber-500/10 bg-transparent focus-visible:ring-amber-500/20"
            />
            <Button size="icon" onClick={handleAdd} disabled={!newItem.trim()} className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
              <Plus className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
