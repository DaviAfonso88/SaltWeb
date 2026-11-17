"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  EMPTY_FICHA,
  FICHA_AVISO_PADRAO,
  FICHA_GRUPOS,
  FICHA_TEXTOS_PADRAO,
  MAX_EXTRAS,
  newExtraId,
  type FichaConfig,
  type FichaExtra,
  type FichaTextKey,
} from "@/lib/forms/ficha-config";

type Props = {
  /** Eventos antigos podem não ter `ficha`: nesse caso valem os textos padrão. */
  value: FichaConfig | undefined;
  onChange: (next: FichaConfig) => void;
  disabled?: boolean;
};

/** Edita os textos da ficha de saúde do acampamento e as perguntas extras. Vale para todos os inscritos do evento. */
export function FichaConfigEditor({ value, onChange, disabled }: Props) {
  const ficha = value ?? EMPTY_FICHA;

  /** Guarda só o que difere do padrão: o texto igual ao padrão remove a personalização. */
  function setTexto(key: FichaTextKey, field: "pergunta" | "dica", text: string) {
    const padrao = FICHA_TEXTOS_PADRAO[key][field] ?? "";
    const atual = { ...ficha.textos[key] };
    if (text.trim() === padrao || text.trim() === "") delete atual[field];
    else atual[field] = text;
    const textos = { ...ficha.textos };
    if (atual.pergunta || atual.dica) textos[key] = atual;
    else delete textos[key];
    onChange({ ...ficha, textos });
  }

  const setExtra = (id: string, patch: Partial<FichaExtra>) => onChange({ ...ficha, extras: ficha.extras.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const addExtra = () =>
    onChange({ ...ficha, extras: [...ficha.extras, { id: newExtraId(), tipo: "texto", pergunta: "", dica: "", obrigatoria: false }] });

  const personalizado = Object.keys(ficha.textos).length > 0 || ficha.aviso.trim() !== "";

  return (
    <fieldset className="grid gap-5 rounded-xl border border-border p-4 sm:p-5" disabled={disabled}>
      <legend className="px-1 text-sm font-semibold">Ficha de saúde</legend>
      <p className="text-xs text-text-3">
        Vale para todos os inscritos deste acampamento. Mudar um texto não altera respostas já enviadas. As perguntas extras guardam o texto da pergunta no
        momento da resposta.
      </p>

      <div className="grid gap-1.5">
        <Label htmlFor="ficha-aviso" className="text-sm font-semibold">
          Aviso de privacidade da ficha
        </Label>
        <Textarea
          id="ficha-aviso"
          className="min-h-20 rounded-xl bg-card"
          value={ficha.aviso}
          placeholder={FICHA_AVISO_PADRAO}
          onChange={(e) => onChange({ ...ficha, aviso: e.target.value })}
          maxLength={600}
        />
        <p className="text-xs text-text-3">Deixe vazio para usar o texto padrão (mostrado acima, em cinza).</p>
      </div>

      {FICHA_GRUPOS.map((grupo) => (
        <div key={grupo.titulo} className="grid gap-3 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">{grupo.titulo}</h3>
          {grupo.keys.map((key) => {
            const padrao = FICHA_TEXTOS_PADRAO[key];
            const custom = ficha.textos[key];
            return (
              <div key={key} className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor={`ficha-${key}`} className="text-xs text-text-2">
                    Texto
                  </Label>
                  <Input
                    id={`ficha-${key}`}
                    className="min-h-11 rounded-xl bg-card"
                    value={custom?.pergunta ?? padrao.pergunta}
                    onChange={(e) => setTexto(key, "pergunta", e.target.value)}
                    maxLength={200}
                  />
                </div>
                {padrao.dica !== undefined ? (
                  <div className="grid gap-1.5">
                    <Label htmlFor={`ficha-${key}-dica`} className="text-xs text-text-2">
                      Dica abaixo do campo
                    </Label>
                    <Input
                      id={`ficha-${key}-dica`}
                      className="min-h-11 rounded-xl bg-card"
                      value={custom?.dica ?? padrao.dica}
                      onChange={(e) => setTexto(key, "dica", e.target.value)}
                      maxLength={300}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}

      {personalizado ? (
        <div>
          <Button type="button" variant="ghost" className="min-h-11 text-sm" onClick={() => onChange({ ...ficha, aviso: "", textos: {} })}>
            <RotateCcw aria-hidden /> Restaurar todos os textos padrão
          </Button>
        </div>
      ) : null}

      <div className="grid gap-3 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Perguntas extras</h3>
        <p className="text-xs text-text-3">
          Aparecem ao fim da ficha (até {MAX_EXTRAS}). As respostas ficam na aba “Ficha de saúde” do participante. Apagar uma pergunta aqui não apaga as respostas já
          recebidas.
        </p>

        {ficha.extras.map((extra, i) => (
          <div key={extra.id} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_11rem] sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor={`extra-${extra.id}-pergunta`} className="text-sm font-semibold">
                Pergunta {i + 1}
              </Label>
              <Input
                id={`extra-${extra.id}-pergunta`}
                className="min-h-11 rounded-xl bg-card"
                value={extra.pergunta}
                onChange={(e) => setExtra(extra.id, { pergunta: e.target.value })}
                maxLength={200}
                placeholder="Ex.: Toma vacina contra tétano em dia?"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`extra-${extra.id}-tipo`} className="text-sm font-semibold">
                Tipo de resposta
              </Label>
              <select
                id={`extra-${extra.id}-tipo`}
                className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm"
                value={extra.tipo}
                onChange={(e) => setExtra(extra.id, { tipo: e.target.value as FichaExtra["tipo"] })}
              >
                <option value="texto">Texto livre</option>
                <option value="simnao">Sim ou não</option>
              </select>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor={`extra-${extra.id}-dica`} className="text-xs text-text-2">
                Dica (opcional)
              </Label>
              <Input
                id={`extra-${extra.id}-dica`}
                className="min-h-11 rounded-xl bg-card"
                value={extra.dica}
                onChange={(e) => setExtra(extra.id, { dica: e.target.value })}
                maxLength={300}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <div className="flex min-h-11 items-center gap-3">
                <Switch id={`extra-${extra.id}-obrig`} checked={extra.obrigatoria} onCheckedChange={(checked) => setExtra(extra.id, { obrigatoria: checked })} />
                <Label htmlFor={`extra-${extra.id}-obrig`} className="cursor-pointer text-sm">
                  Resposta obrigatória
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 text-destructive"
                onClick={() => onChange({ ...ficha, extras: ficha.extras.filter((e) => e.id !== extra.id) })}
              >
                <Trash2 aria-hidden /> Remover pergunta {i + 1}
              </Button>
            </div>
          </div>
        ))}

        {ficha.extras.length < MAX_EXTRAS ? (
          <Button type="button" variant="outline" className="min-h-11 w-fit rounded-full" onClick={addExtra}>
            <Plus aria-hidden /> Adicionar pergunta
          </Button>
        ) : null}
      </div>
    </fieldset>
  );
}
