"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AcampamentoConfigEditor } from "@/components/painel/eventos/config/AcampamentoConfigEditor";
import { FestaConfigEditor } from "@/components/painel/eventos/config/FestaConfigEditor";
import { MissaoConfigEditor } from "@/components/painel/eventos/config/MissaoConfigEditor";
import { FormError } from "@/components/painel/FieldError";
import { SubmitButton } from "@/components/painel/SubmitButton";
import { TextField } from "@/components/painel/TextField";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/action-result";
import { saveEvent } from "@/lib/events/actions";
import type { AcampamentoConfig } from "@/lib/forms/acampamento";
import type { FestaConfig } from "@/lib/forms/festa";
import type { MissaoConfig } from "@/lib/forms/missao";
import { FORM_MODEL_LIST, getFormModel } from "@/lib/forms/registry";
import type { FormModelId } from "@/lib/forms/types";

// Mesmo limite de lib/events/images.ts (aquele módulo importa o banco, então não vem para o cliente).
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TOO_BIG = "A imagem deve ter no máximo 5 MB.";

export type EventFormValues = {
  id: string;
  version: number;
  title: string;
  slug: string;
  summary: string;
  description: string;
  startsAt: string;
  endsAt: string;
  locationName: string;
  locationAddress: string;
  locationMapUrl: string;
  imageUrl: string | null;
  imageAlt: string;
  category: string;
  featured: boolean;
  externalUrl: string;
  externalLabel: string;
  formModel: FormModelId | null;
  formConfig: Record<string, unknown>;
  registrationOpen: boolean;
  registrationClosesAt: string;
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-text-2">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function CheckField({ id, name, label, defaultChecked, hint }: { id: string; name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <div className="flex min-h-11 items-start gap-3">
      <Checkbox id={id} name={name} defaultChecked={defaultChecked} className="mt-1" />
      <div>
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </Label>
        {hint ? <p className="text-xs text-text-3">{hint}</p> : null}
      </div>
    </div>
  );
}

export function EventForm({ event, modelLocked }: { event?: EventFormValues; modelLocked?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<ActionResult<{ id: string }> | undefined>();
  const [pending, startTransition] = useTransition();
  const [model, setModel] = useState<FormModelId | "">(event?.formModel ?? "");
  const [config, setConfig] = useState<Record<string, unknown>>(() =>
    event?.formModel ? event.formConfig : {},
  );
  const [preview, setPreview] = useState<string | null>(event?.imageUrl ?? null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const chosen = formData.get("image");
    if (chosen instanceof File && chosen.size > MAX_IMAGE_BYTES) {
      // O limite do corpo das Server Actions (6 MB) rejeitaria o envio antes da validação do servidor.
      setImageError(IMAGE_TOO_BIG);
      return;
    }
    startTransition(async () => {
      const result = await saveEvent(undefined, formData);
      setState(result);
      if (result.ok) {
        toast.success(result.message ?? "Evento salvo.");
        if (!event && result.data) router.push(`/painel/eventos/${result.data.id}`);
        else router.refresh();
      } else if (result.conflict) {
        toast.error(result.error);
      }
    });
  }

  const errors = state && !state.ok ? state.fieldErrors : undefined;

  function chooseModel(next: FormModelId | "") {
    setModel(next);
    const def = next ? getFormModel(next) : null;
    // Ao voltar para o modelo original, recupera os parâmetros salvos; senão usa o padrão do modelo.
    setConfig(next && next === event?.formModel ? event.formConfig : (def?.defaultConfig() ?? {}));
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImageError(file && file.size > MAX_IMAGE_BYTES ? IMAGE_TOO_BIG : null);
    setHasNewImage(Boolean(file));
    setPreview(file ? URL.createObjectURL(file) : (e.target.dataset.original ?? null));
  }

  const configErrors = errors?.formConfig;

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6" noValidate>
      {event ? (
        <>
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="version" value={event.version} />
        </>
      ) : null}
      <input type="hidden" name="formConfig" value={JSON.stringify(config)} />

      {state && !state.ok && state.conflict ? (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <p className="font-semibold text-destructive">Outra pessoa alterou este evento.</p>
          <p className="mt-1 text-text-2">
            {state.error}{" "}
            <button type="button" className="font-semibold underline" onClick={() => router.refresh()}>
              Recarregar agora
            </button>
          </p>
        </div>
      ) : null}

      <Section title="Dados gerais">
        <TextField name="title" label="Título" defaultValue={event?.title} required maxLength={120} errors={errors?.title} />
        <TextField
          name="slug"
          label="Endereço (opcional)"
          defaultValue={event?.slug}
          hint="Parte final do link, ex.: acampa-salt-2026. Se vazio, é gerado a partir do título."
          errors={errors?.slug}
        />
        <TextField name="summary" label="Resumo (opcional)" defaultValue={event?.summary} maxLength={300} hint="Aparece nos cartões da lista." errors={errors?.summary} />
        <div className="grid gap-1.5">
          <Label htmlFor="description" className="text-sm font-semibold">
            Descrição (opcional)
          </Label>
          <Textarea id="description" name="description" rows={6} defaultValue={event?.description} maxLength={5000} className="rounded-xl bg-card" />
          <p className="text-xs text-text-3">Uma linha em branco separa os parágrafos.</p>
        </div>
        <TextField name="category" label="Categoria (opcional)" defaultValue={event?.category} maxLength={40} hint="Ex.: Acampamento, Festa, Missões." errors={errors?.category} />
        <CheckField id="featured" name="featured" label="Evento em destaque" defaultChecked={event?.featured} hint="Aparece na página inicial. Só um evento fica em destaque por vez." />
      </Section>

      <Section title="Data e local">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="startsAt" label="Início" type="datetime-local" defaultValue={event?.startsAt} required errors={errors?.startsAt} />
          <TextField name="endsAt" label="Término (opcional)" type="datetime-local" defaultValue={event?.endsAt} errors={errors?.endsAt} />
        </div>
        <TextField name="locationName" label="Nome do local (opcional)" defaultValue={event?.locationName} maxLength={120} />
        <TextField name="locationAddress" label="Endereço (opcional)" defaultValue={event?.locationAddress} maxLength={250} />
        <TextField name="locationMapUrl" label="Link do mapa (opcional)" type="url" defaultValue={event?.locationMapUrl} errors={errors?.locationMapUrl} />
      </Section>

      <Section title="Imagem">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) não passa pelo otimizador
          <img src={preview} alt="Prévia da imagem do evento" className="max-h-56 w-full rounded-xl border border-border object-cover" />
        ) : null}
        <div className="grid gap-1.5">
          <Label htmlFor="image" className="text-sm font-semibold">
            {event?.imageUrl ? "Trocar imagem" : "Imagem (opcional)"}
          </Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            data-original={event?.imageUrl ?? undefined}
            onChange={onImage}
            className="min-h-11 rounded-xl bg-card"
            aria-describedby="image-dica"
          />
          <p id="image-dica" className="text-xs text-text-3">
            JPG, PNG ou WebP, até 5 MB.
          </p>
          {imageError ?? errors?.image?.[0] ? (
            <p role="alert" className="text-sm text-destructive">
              {imageError ?? errors?.image?.[0]}
            </p>
          ) : null}
        </div>
        {event?.imageUrl && !hasNewImage ? (
          <CheckField id="removeImage" name="removeImage" label="Remover a imagem atual" />
        ) : null}
        <TextField
          name="imageAlt"
          label="Descrição da imagem"
          defaultValue={event?.imageAlt}
          maxLength={200}
          hint="Obrigatória quando há imagem. Descreve a foto para quem usa leitor de tela."
          errors={errors?.imageAlt}
        />
      </Section>

      <Section title="Link externo" description="Opcional. Mostra um botão na página do evento (ex.: ingressos em outro site).">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="externalUrl" label="Link" type="url" defaultValue={event?.externalUrl} errors={errors?.externalUrl} />
          <TextField name="externalLabel" label="Texto do botão" defaultValue={event?.externalLabel} maxLength={40} />
        </div>
      </Section>

      <Section title="Inscrições" description="Escolha o modelo do formulário e ajuste os parâmetros. As respostas aparecem em Inscrições.">
        <div className="grid gap-1.5">
          <Label htmlFor="formModel" className="text-sm font-semibold">
            Modelo do formulário
          </Label>
          <select
            id="formModel"
            name="formModel"
            value={model}
            disabled={modelLocked}
            onChange={(e) => chooseModel(e.target.value as FormModelId | "")}
            className="min-h-11 rounded-xl border border-input bg-card px-3 text-sm disabled:opacity-60"
          >
            <option value="">Sem inscrição neste site</option>
            {FORM_MODEL_LIST.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          {modelLocked ? (
            <>
              {/* select desabilitado não envia valor; reenvia o modelo atual */}
              <input type="hidden" name="formModel" value={model} />
              <p className="text-xs text-text-3">O modelo não pode mudar depois da primeira inscrição.</p>
            </>
          ) : (
            <p className="text-xs text-text-3">{model ? getFormModel(model)?.description : "O evento não terá formulário de inscrição."}</p>
          )}
          {errors?.formModel ? (
            <p role="alert" className="text-sm text-destructive">
              {errors.formModel[0]}
            </p>
          ) : null}
        </div>

        {model === "acampamento" ? (
          <AcampamentoConfigEditor value={config as AcampamentoConfig} onChange={setConfig} errors={configErrors} />
        ) : null}
        {model === "festa" ? <FestaConfigEditor value={config as FestaConfig} onChange={setConfig} errors={configErrors} /> : null}
        {model === "missao" ? <MissaoConfigEditor value={config as MissaoConfig} onChange={setConfig} errors={configErrors} /> : null}

        {model ? (
          <div className="grid gap-4 border-t border-border pt-4">
            <CheckField id="registrationOpen" name="registrationOpen" label="Inscrições abertas" defaultChecked={event?.registrationOpen} />
            <TextField
              name="registrationClosesAt"
              label="Encerrar automaticamente em (opcional)"
              type="datetime-local"
              defaultValue={event?.registrationClosesAt}
              errors={errors?.registrationClosesAt}
              wrapperClassName="max-w-xs"
            />
          </div>
        ) : null}
      </Section>

      <FormError message={state && !state.ok && !state.fieldErrors && !state.conflict ? state.error : undefined} />
      {state && !state.ok && state.fieldErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div>
        <SubmitButton disabled={pending} pendingLabel="Salvando…" className="rounded-full px-8">
          {event ? "Salvar evento" : "Criar evento"}
        </SubmitButton>
      </div>
    </form>
  );
}
