"use client";

import { CircleCheck, FileUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";

import { FormError } from "@/components/painel/FieldError";
import { StatusBadge } from "@/components/painel/StatusBadge";
import { Button } from "@/components/ui/button";
import { commitImport, previewImport } from "@/lib/participants/import-actions";
import { fieldLabel, IGNORED, TARGET_FIELDS, type ColumnMapping } from "@/lib/participants/import/mapper";
import { MAX_IMPORT_ROWS, type ImportCommitResult, type ImportPreview, type PreviewPerson, type RowDecision } from "@/lib/participants/import/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const STEPS = ["Arquivo", "Colunas", "Prévia", "Resultado"];

type Parsed = { fileName: string; headers: string[]; rows: Record<string, string | null>[] };

function decodeCsv(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

async function readSpreadsheet(file: File): Promise<Parsed> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const isText = /\.(csv|txt)$/i.test(file.name);
  const workbook = isText ? XLSX.read(decodeCsv(buffer), { type: "string" }) : XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("A planilha está vazia.");

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "", blankrows: false });
  if (matrix.length < 2) throw new Error("A planilha precisa de um cabeçalho e ao menos uma linha de dados.");

  const used = new Set<string>();
  const headers = (matrix[0] as unknown[]).map((cell, i) => {
    const base = String(cell ?? "").trim() || `Coluna ${i + 1}`;
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base} (${n})`;
    used.add(name);
    return name;
  });

  const rows = matrix
    .slice(1)
    .map((cells) => Object.fromEntries(headers.map((h, i) => [h, String((cells as unknown[])[i] ?? "").trim() || null])))
    .filter((row) => Object.values(row).some(Boolean));
  if (!rows.length) throw new Error("Nenhuma linha de dados encontrada.");
  return { fileName: file.name, headers, rows };
}

const dateBr = (d: string | null) => (d ? d.split("-").reverse().join("/") : null);
const summary = (p: PreviewPerson) => [p.church, p.city, dateBr(p.birthDate), p.mobile].filter(Boolean).join(" · ");

function PersonLine({ p, children }: { p: PreviewPerson; children?: React.ReactNode }) {
  return (
    <li className="grid gap-1 rounded-xl border border-border p-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-text-3">Linha {p.row}</span>
        <strong>{p.name}</strong>
        {summary(p) ? <span className="text-text-2">{summary(p)}</span> : null}
      </div>
      {p.warnings.length ? (
        <ul className="list-disc pl-5 text-xs text-warning">
          {p.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </li>
  );
}

function Group({ title, count, tone, children, open }: { title: string; count: number; tone: "success" | "brand" | "warning" | "danger"; children: React.ReactNode; open?: boolean }) {
  if (!count) return null;
  return (
    <details open={open} className="rounded-2xl border border-border bg-card px-4 py-1">
      <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 font-semibold">
        {title}
        <StatusBadge tone={tone}>{count}</StatusBadge>
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}

function decisionFromValue(value: string): RowDecision | undefined {
  if (value === "new" || value === "skip") return value;
  if (value.startsWith("update:")) return { update: value.slice("update:".length) };
  return undefined;
}

export function ImportWizard({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  const [step, setStep] = useState(1);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const [done, setDone] = useState<ImportCommitResult | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    if (file.size > MAX_FILE_BYTES) return setError("O arquivo passa de 5 MB. Divida a planilha em partes.");
    startTransition(async () => {
      try {
        const data = await readSpreadsheet(file);
        if (data.rows.length > MAX_IMPORT_ROWS) return setError(`A planilha tem ${data.rows.length.toLocaleString("pt-BR")} linhas; o limite é ${MAX_IMPORT_ROWS.toLocaleString("pt-BR")} por importação. Divida em partes.`);
        const result = await previewImport(eventId, { fileName: data.fileName, headers: data.headers, rows: data.rows });
        if (!result.ok) return setError(result.error);
        setParsed(data);
        setMapping(result.data!.mapping);
        setStep(2);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível ler o arquivo.");
      }
    });
  }

  function toPreview() {
    if (!parsed) return;
    setError(undefined);
    startTransition(async () => {
      const result = await previewImport(eventId, { fileName: parsed.fileName, headers: parsed.headers, rows: parsed.rows, mapping });
      if (!result.ok) return setError(result.error);
      setPreview(result.data!);
      setDecisions({});
      setStep(3);
    });
  }

  function confirm() {
    if (!parsed || !preview) return;
    setError(undefined);
    const chosen: Record<string, RowDecision> = {};
    for (const [row, value] of Object.entries(decisions)) {
      const d = decisionFromValue(value);
      if (d) chosen[row] = d;
    }
    startTransition(async () => {
      const result = await commitImport(eventId, { fileName: parsed.fileName, headers: parsed.headers, rows: parsed.rows, mapping: preview.mapping, decisions: chosen });
      if (!result.ok) return setError(result.error);
      setDone(result.data!);
      setStep(4);
    });
  }

  const hasName = Object.values(mapping).includes("nome");
  const willWrite = preview
    ? preview.totals.novos + preview.totals.atualizacoes + preview.revisao.filter((r) => decisionFromValue(decisions[r.row] ?? "") && decisionFromValue(decisions[r.row] ?? "") !== "skip").length
    : 0;
  const selectClass = "min-h-11 w-full max-w-md rounded-xl border border-input bg-background px-3 text-sm";

  return (
    <div className="grid gap-6">
      <ol className="flex flex-wrap gap-2" aria-label="Etapas da importação">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={step === i + 1 ? "step" : undefined}
            className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm ${step === i + 1 ? "border-primary bg-purple-tint font-semibold text-purple-dark" : step > i + 1 ? "border-border bg-card text-text-2" : "border-border text-text-3"}`}
          >
            <span aria-hidden className="tabular-nums">
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <FormError message={error} />

      {step === 1 ? (
        <section aria-labelledby="passo1" className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 id="passo1" className="font-display text-lg font-semibold">
            Escolha a planilha de {eventTitle}
          </h2>
          <p className="text-sm text-text-2">
            Excel (.xlsx, .xls) ou CSV, com os nomes das colunas na primeira linha, até {MAX_IMPORT_ROWS.toLocaleString("pt-BR")} linhas. O arquivo é lido no seu navegador; só o conteúdo segue para o servidor ao continuar.
          </p>
          <input ref={fileInput} type="file" accept=".xlsx,.xls,.csv,.txt" className="sr-only" id="arquivo" onChange={(e) => onFile(e.target.files?.[0])} />
          <div>
            <Button type="button" className="min-h-11 rounded-full" disabled={pending} onClick={() => fileInput.current?.click()}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Lendo…
                </>
              ) : (
                <>
                  <FileUp aria-hidden /> Escolher arquivo
                </>
              )}
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 && parsed ? (
        <section aria-labelledby="passo2" className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div>
            <h2 id="passo2" className="font-display text-lg font-semibold">
              Associe as colunas aos campos
            </h2>
            <p className="mt-1 text-sm text-text-2">
              {parsed.fileName} · {parsed.rows.length} linhas. As sugestões vêm dos nomes das colunas (e do mapeamento salvo de planilhas parecidas). Ajuste o que estiver errado.
            </p>
          </div>

          {!hasName ? (
            <p role="alert" className="rounded-lg border border-warning/40 bg-warning-tint px-3 py-2 text-sm">
              Escolha qual coluna é o <strong>Nome</strong> para continuar.
            </p>
          ) : null}

          <ul className="grid gap-3">
            {parsed.headers.map((h, i) => {
              const samples = parsed.rows
                .map((r) => r[h])
                .filter(Boolean)
                .slice(0, 2);
              return (
                <li key={h} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[1fr_1fr] md:items-center">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">{h}</p>
                    <p className="truncate text-xs text-text-3">{samples.length ? `Ex.: ${samples.join(" | ")}` : "Coluna vazia"}</p>
                  </div>
                  <div>
                    <label htmlFor={`map-${i}`} className="sr-only">
                      Campo para a coluna {h}
                    </label>
                    <select id={`map-${i}`} value={mapping[h] ?? IGNORED} onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))} className={selectClass}>
                      <option value={IGNORED}>{fieldLabel(IGNORED)}</option>
                      {TARGET_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {fieldLabel(f)}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => setStep(1)} disabled={pending}>
              Voltar
            </Button>
            <Button type="button" className="min-h-11 rounded-full" onClick={toPreview} disabled={pending || !hasName}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Analisando…
                </>
              ) : (
                "Ver prévia"
              )}
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 && preview ? (
        <section aria-labelledby="passo3" className="grid gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
            <h2 id="passo3" className="font-display text-lg font-semibold">
              Prévia da importação
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                ["Novos", preview.totals.novos],
                ["Atualizações", preview.totals.atualizacoes],
                ["Para revisar", preview.totals.revisao],
                ["Com problema", preview.totals.invalidas],
                ["Linhas vazias", preview.totals.vazias],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl border border-border p-3">
                  <dt className="text-xs text-text-3">{label}</dt>
                  <dd className="m-0 font-display text-2xl font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-text-2">Atualizações só preenchem campos vazios do cadastro existente; nada é sobrescrito. Linhas para revisar ficam de fora, a não ser que você decida.</p>
          </div>

          <Group title="Para revisar (possíveis repetidos)" count={preview.revisao.length} tone="warning" open>
            <ul className="grid gap-2">
              {preview.revisao.map((r) => (
                <PersonLine key={r.row} p={r}>
                  <label htmlFor={`rev-${r.row}`} className="sr-only">
                    Decisão para a linha {r.row}
                  </label>
                  <select id={`rev-${r.row}`} value={decisions[r.row] ?? "skip"} onChange={(e) => setDecisions((d) => ({ ...d, [r.row]: e.target.value }))} className={selectClass}>
                    <option value="skip">Pular esta linha</option>
                    <option value="new">Criar como novo cadastro</option>
                    {r.candidates.map((c) => (
                      <option key={c.id} value={`update:${c.id}`}>
                        Atualizar {c.name} ({Math.round(c.score * 100)}%{c.reason ? `, ${c.reason.toLowerCase()}` : ""})
                      </option>
                    ))}
                  </select>
                </PersonLine>
              ))}
            </ul>
          </Group>

          <Group title="Atualizações de cadastros existentes" count={preview.atualizacoes.length} tone="brand">
            <ul className="grid gap-2">
              {preview.atualizacoes.map((r) => (
                <PersonLine key={r.row} p={r}>
                  <p className="text-xs text-text-2">
                    Atualiza <strong>{r.candidate.name}</strong> ({Math.round(r.candidate.score * 100)}%{r.candidate.reason ? `, ${r.candidate.reason.toLowerCase()}` : ""})
                  </p>
                  <label htmlFor={`upd-${r.row}`} className="sr-only">
                    Decisão para a linha {r.row}
                  </label>
                  <select id={`upd-${r.row}`} value={decisions[r.row] ?? "default"} onChange={(e) => setDecisions((d) => ({ ...d, [r.row]: e.target.value }))} className={selectClass}>
                    <option value="default">Atualizar o cadastro sugerido</option>
                    <option value="new">Criar como novo cadastro</option>
                    <option value="skip">Pular esta linha</option>
                  </select>
                </PersonLine>
              ))}
            </ul>
          </Group>

          <Group title="Novos participantes" count={preview.novos.length} tone="success">
            <ul className="grid gap-2">
              {preview.novos.map((r) => (
                <PersonLine key={r.row} p={r} />
              ))}
            </ul>
          </Group>

          <Group title="Linhas com problema (não serão importadas)" count={preview.invalidas.length} tone="danger">
            <ul className="grid gap-2">
              {preview.invalidas.map((r) => (
                <li key={r.row} className="rounded-xl border border-border p-3 text-sm">
                  <span className="text-text-3">Linha {r.row}</span> {r.name ? <strong>{r.name}: </strong> : null}
                  {r.reason}
                </li>
              ))}
            </ul>
          </Group>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-11 rounded-full" onClick={() => setStep(2)} disabled={pending}>
              Voltar às colunas
            </Button>
            <Button type="button" className="min-h-11 rounded-full" onClick={confirm} disabled={pending || willWrite === 0}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden /> Importando…
                </>
              ) : (
                `Confirmar importação (${willWrite})`
              )}
            </Button>
          </div>
        </section>
      ) : null}

      {step === 4 && done ? (
        <section aria-labelledby="passo4" className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6" role="status">
          <div className="flex items-center gap-3">
            <CircleCheck className="size-7 text-success" aria-hidden />
            <h2 id="passo4" className="font-display text-lg font-semibold">
              Importação concluída
            </h2>
          </div>
          <ul className="grid gap-1 text-sm">
            <li>
              <strong>{done.created}</strong> participante(s) criado(s)
            </li>
            <li>
              <strong>{done.updated}</strong> cadastro(s) atualizado(s)
            </li>
            <li>
              <strong>{done.skipped}</strong> linha(s) pulada(s)
            </li>
            <li>
              <strong>{done.invalid}</strong> linha(s) com problema
            </li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="min-h-11 rounded-full">
              <Link href={`/painel/participantes?evento=${eventId}`}>Ver participantes</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-full"
              onClick={() => {
                setParsed(null);
                setPreview(null);
                setDone(null);
                setDecisions({});
                setStep(1);
              }}
            >
              Importar outra planilha
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
