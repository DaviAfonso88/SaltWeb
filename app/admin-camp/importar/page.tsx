"use client";

import { useCallback, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileDown,
  Search,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import { autoMapColumns, getFieldLabel } from "@/lib/import/mapper";

type Step = "upload" | "mapping" | "preview" | "result";

interface ParsedFile {
  filename: string;
  headers: string[];
  rows: Record<string, string | null | undefined>[];
  totalRows: number;
}

interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
}

const TARGET_FIELDS = [
  "nome",
  "dataNascimento",
  "idade",
  "sexo",
  "cpf",
  "tipoSanguineo",
  "responsavelNome",
  "responsavelParentesco",
  "responsavelTelefone",
  "email",
  "contatoEmergenciaNome",
  "contatoEmergenciaParentesco",
  "contatoEmergenciaTelefone",
  "condicaoSaude",
  "condicaoEspecificacao",
  "deficiencia",
  "deficienciaEspecificacao",
  "possuiAlergias",
  "alergias",
  "alergiaReacao",
  "alergiaMedicacao",
  "utilizaMedicamentosContinuos",
  "medicamentos",
  "possuiRestricoesAlimentares",
  "restricoesAlimentares",
  "possuiRestricoesFisicas",
  "restricoesFisicas",
  "outraInfoSaude",
  "declaracao",
  "ignored",
];

export default function ImportarPage() {
  const [step, setStep] = useState<Step>("upload");
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    newParticipants: number;
    updatedParticipants: number;
    conflicts: number;
    details: { created: string[]; updated: string[]; conflictRows: number[] };
  } | null>(null);

  const parseCSV = (text: string, filename: string): ParsedFile => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      return { filename, headers: [], rows: [], totalRows: 0 };
    }

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string | null | undefined> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || null;
      });
      return row;
    });

    return { filename, headers, rows, totalRows: rows.length };
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: ParsedFile[] = [];

    for (const file of Array.from(fileList)) {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "csv") {
        const text = await file.text();
        const parsed = parseCSV(text, file.name);
        if (parsed.rows.length > 0) {
          newFiles.push(parsed);
        }
      } else if (ext === "xlsx" || ext === "xls") {
        try {
          const XLSX = await import("xlsx");
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json<Record<string, string | number | null>>(sheet, {
            defval: null,
          });

          const excelSerialToDate = (serial: number): string => {
            const utcDays = Math.floor(serial - 25569);
            const utcMs = utcDays * 86400 * 1000;
            const d = new Date(utcMs);
            const day = String(d.getUTCDate()).padStart(2, "0");
            const month = String(d.getUTCMonth() + 1).padStart(2, "0");
            const year = d.getUTCFullYear();
            return `${day}/${month}/${year}`;
          };

          if (data.length > 0) {
            const headers = Object.keys(data[0]);
            const rows = data.map((row) => {
              const mapped: Record<string, string | null | undefined> = {};
              headers.forEach((h) => {
                const val = row[h];
                if (val == null) {
                  mapped[h] = null;
                } else if (typeof val === "number" && val > 30 && val < 60000 && !Number.isInteger(val) || (typeof val === "number" && Number.isInteger(val) && val > 30 && val < 60000)) {
                  mapped[h] = excelSerialToDate(val);
                } else {
                  mapped[h] = String(val);
                }
              });
              return mapped;
            });
            newFiles.push({
              filename: file.name,
              headers,
              rows,
              totalRows: rows.length,
            });
          }
        } catch {
          toast.error(`Erro ao ler ${file.name}`);
        }
      } else {
        toast.error(`Formato não suportado: ${file.name}`);
      }
    }

    if (newFiles.length > 0) {
      setFiles(newFiles);
      setCurrentFileIndex(0);
      const autoMappings = autoMapColumns(newFiles[0].headers);
      setMappings(autoMappings);
      setStep("mapping");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleMappingChange = (targetField: string, sourceColumn: string) => {
    if (sourceColumn === "__none__") {
      setMappings((prev) =>
        prev.map((m) =>
          m.targetField === targetField
            ? { ...m, targetField: "ignored", confidence: 0 }
            : m
        )
      );
      return;
    }
    setMappings((prev) =>
      prev.map((m) => {
        if (m.targetField === targetField) {
          return { ...m, targetField: "ignored", confidence: 0 };
        }
        if (m.sourceColumn === sourceColumn) {
          return { ...m, targetField, confidence: 1 };
        }
        return m;
      })
    );
  };

  const handleImport = async () => {
    setImporting(true);
    let totalNew = 0;
    let totalUpdated = 0;
    let totalConflicts = 0;
    const allCreated: string[] = [];
    const allUpdated: string[] = [];
    const allConflictRows: number[] = [];

    try {
      for (const file of files) {
        const res = await fetch("/api/camp-admin/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: file.rows,
            filename: file.filename,
            customMappings: mappings,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          totalNew += data.newParticipants || 0;
          totalUpdated += data.updatedParticipants || 0;
          totalConflicts += data.conflicts || 0;
          allCreated.push(...(data.details?.created || []));
          allUpdated.push(...(data.details?.updated || []));
          allConflictRows.push(...(data.details?.conflictRows || []));
        }
      }

      setImportResult({
        newParticipants: totalNew,
        updatedParticipants: totalUpdated,
        conflicts: totalConflicts,
        details: {
          created: allCreated,
          updated: allUpdated,
          conflictRows: allConflictRows,
        },
      });
      setStep("result");
      toast.success("Importação concluída!");
    } catch {
      toast.error("Erro ao importar dados");
    } finally {
      setImporting(false);
    }
  };

  const nextFile = () => {
    if (currentFileIndex < files.length - 1) {
      const next = currentFileIndex + 1;
      setCurrentFileIndex(next);
      const autoMappings = autoMapColumns(files[next].headers);
      setMappings(autoMappings);
    }
  };

  const prevFile = () => {
    if (currentFileIndex > 0) {
      const prev = currentFileIndex - 1;
      setCurrentFileIndex(prev);
      const autoMappings = autoMapColumns(files[prev].headers);
      setMappings(autoMappings);
    }
  };

  const reset = () => {
    setFiles([]);
    setCurrentFileIndex(0);
    setMappings([]);
    setImportResult(null);
    setStep("upload");
  };

  const currentFile = files[currentFileIndex];

  const steps: Step[] = ["upload", "mapping", "preview", "result"];
  const currentStepIndex = steps.indexOf(step);

  const stepLabels: Record<Step, string> = {
    upload: "Enviar",
    mapping: "Mapear",
    preview: "Revisar",
    result: "Resultado",
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-3xl font-bold tracking-tight">
          Importar Planilhas
        </h1>
        <p className="text-muted-foreground">
          Importe planilhas Excel ou CSV com dados dos participantes
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                  step === s
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                    : i < currentStepIndex
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < currentStepIndex ? (
                  <Check className="size-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline ${
                  step === s ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {stepLabels[s]}
              </span>
            </div>
            {i < 3 && (
              <div className={`mx-2 h-px w-6 transition-colors sm:w-12 ${
                i < currentStepIndex ? "bg-amber-500/30" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step: Upload */}
      {step === "upload" && (
        <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="group flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-amber-500/20 p-16 text-center transition-all duration-300 hover:border-amber-500/40 hover:bg-amber-500/[0.02]"
            >
              <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 transition-transform duration-300 group-hover:scale-110">
                <Upload className="size-10 text-amber-400" />
              </div>
              <div>
                <p className="text-xl font-semibold">
                  Arraste planilhas aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar arquivos
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: .xlsx, .xls, .csv
              </p>
              <Label className="cursor-pointer">
                <Input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  multiple
                  onChange={handleFileInput}
                />
                <Button variant="outline" asChild className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-400">
                  <span>
                    <FileSpreadsheet className="mr-1.5 size-3.5" />
                    Selecionar Arquivos
                  </span>
                </Button>
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Mapping */}
      {step === "mapping" && currentFile && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <FileSpreadsheet className="size-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{currentFile.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {currentFile.totalRows} registros encontrados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {files.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevFile}
                    disabled={currentFileIndex === 0}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentFileIndex + 1} / {files.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextFile}
                    disabled={currentFileIndex === files.length - 1}
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Mapeamento de Colunas</CardTitle>
              <CardDescription>
                Para cada campo do sistema, selecione a coluna correspondente da planilha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[500px] overflow-y-auto">
                <div className="flex flex-col divide-y">
                  {TARGET_FIELDS.filter((f) => f !== "ignored").map((field) => {
                    const mapped = mappings.find((m) => m.targetField === field);
                    const sourceColumn = mapped?.sourceColumn || "";
                    const sampleValue =
                      sourceColumn && currentFile.rows[0]
                        ? currentFile.rows[0][sourceColumn] || "-"
                        : "-";
                    return (
                      <div
                        key={field}
                        className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3"
                      >
                        <span className="min-w-0 flex-1 text-sm font-medium" title={getFieldLabel(field)}>
                          {getFieldLabel(field)}
                        </span>
                        <div className="w-full sm:w-[240px] sm:shrink-0">
                          <ColumnPicker
                            label={getFieldLabel(field)}
                            options={currentFile.headers}
                            value={sourceColumn}
                            onChange={(val) => handleMappingChange(field, val)}
                          />
                        </div>
                        <span className="hidden truncate text-xs text-muted-foreground sm:block sm:w-[160px] sm:shrink-0 sm:text-right">
                          {sourceColumn ? sampleValue : "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={reset} className="border-amber-500/20">
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={importing} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
              Importar
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && (
        <div className="flex flex-col gap-4">
          {importing ? (
            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="size-8 animate-spin text-amber-400" />
                <p className="text-muted-foreground">Importando dados...</p>
                <Progress value={50} className="w-64" />
              </CardContent>
            </Card>
          ) : importResult ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-emerald-500/10 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/15">
                      <CheckCircle2 className="size-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight">
                        {importResult.newParticipants}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Novos participantes
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-blue-500/10 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/15">
                      <FileDown className="size-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight">
                        {importResult.updatedParticipants}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Registros atualizados
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/15">
                      <AlertCircle className="size-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight">
                        {importResult.conflicts}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Conflitos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {importResult.details.conflictRows.length > 0 && (
                <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Linhas com Conflito
                    </CardTitle>
                    <CardDescription>
                      Estas linhas possuem participantes similares. Verifique
                      manualmente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Linhas:{" "}
                      {importResult.details.conflictRows.join(", ")}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button onClick={reset} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                  Nova Importação
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = "/admin-camp/participantes")
                  }
                  className="border-amber-500/20"
                >
                  Ver Participantes
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-amber-500/10 bg-gradient-to-br from-card to-card/50">
              <CardContent className="flex flex-col items-center gap-4 py-12">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
                  <AlertCircle className="size-7 text-amber-400" />
                </div>
                <p className="text-muted-foreground">
                  Nenhum resultado disponível
                </p>
                <Button onClick={reset} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ColumnPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((h) =>
    h.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setOpen(true);
        }}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-amber-500/10 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground hover:bg-amber-500/[0.03] hover:text-accent-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/20"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || "Selecionar coluna..."}
        </span>
        <svg className="size-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!flex max-h-[80vh] w-[95vw] max-w-lg flex-col overflow-hidden border-amber-500/10 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar coluna..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-amber-500/10 focus-visible:ring-amber-500/20"
                autoFocus
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-amber-500/10">
              <button
                type="button"
                onClick={() => {
                  onChange("__none__");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-amber-500/[0.05]"
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  !value || value === "__none__"
                    ? "border-amber-500 bg-amber-500/20 text-amber-400"
                    : "border-muted-foreground/30"
                }`}>
                  {(!value || value === "__none__") && <Check className="size-3" />}
                </span>
                Nenhuma
              </button>
              {filtered.map((header) => (
                <button
                  key={header}
                  type="button"
                  onClick={() => {
                    onChange(header);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-amber-500/[0.05]"
                >
                  <span className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    value === header
                      ? "border-amber-500 bg-amber-500/20 text-amber-400"
                      : "border-muted-foreground/30"
                  }`}>
                    {value === header && <Check className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{header}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma coluna encontrada
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
