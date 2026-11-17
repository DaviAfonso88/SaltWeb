import { acampamentoModel } from "./acampamento";
import { festaModel } from "./festa";
import { missaoModel } from "./missao";
import { simplesModel } from "./simples";
import type { FormModel, FormModelId } from "./types";

export const FORM_MODELS: Record<FormModelId, FormModel> = {
  acampamento: acampamentoModel,
  festa: festaModel,
  missao: missaoModel,
  simples: simplesModel,
};

export const FORM_MODEL_LIST: FormModel[] = Object.values(FORM_MODELS);

export function getFormModel(id: string | null | undefined): FormModel | null {
  return id && id in FORM_MODELS ? FORM_MODELS[id as FormModelId] : null;
}
