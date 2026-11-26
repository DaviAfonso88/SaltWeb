import { chosenItems, companionsOf } from "./festa";
import type { Answers } from "./types";

/** Módulo puro: estado do formulário Festa, usado na inscrição pública e no painel. */

export type FestaDraft = {
  faixa: string | undefined;
  tipo: "membro" | "convidado" | undefined;
  convidadoPor: string;
  observacao: "normal" | "nao_consigo";
  contribuicao: "alimento" | "valor" | "ambos" | undefined;
  /** Nome do item → unidades; só entram os escolhidos. */
  itens: Record<string, number>;
  acompanhantes: { id: number; nome: string; faixa: string }[];
};

export function emptyDraft(): FestaDraft {
  return { faixa: undefined, tipo: undefined, convidadoPor: "", observacao: "normal", contribuicao: undefined, itens: {}, acompanhantes: [] };
}

/** Estado inicial para editar uma inscrição gravada. */
export function draftFromAnswers(a: Answers): FestaDraft {
  return {
    faixa: typeof a.faixaEtaria === "string" ? a.faixaEtaria : undefined,
    tipo: a.tipoParticipante === "convidado" ? "convidado" : a.tipoParticipante === "membro" ? "membro" : undefined,
    convidadoPor: typeof a.convidadoPor === "string" ? a.convidadoPor : "",
    observacao: a.observacao === "nao_consigo" ? "nao_consigo" : "normal",
    contribuicao:
      a.tipoContribuicao === "alimento" || a.tipoContribuicao === "valor" || a.tipoContribuicao === "ambos" ? a.tipoContribuicao : undefined,
    itens: Object.fromEntries(chosenItems(a).map((i) => [i.nome, i.quantidade])),
    acompanhantes: companionsOf(a).map((c, id) => ({ id, nome: c.nome, faixa: c.faixaEtaria })),
  };
}

export const takesItems = (d: FestaDraft) => d.observacao === "normal" && (d.contribuicao === "alimento" || d.contribuicao === "ambos");
export const paysValue = (d: FestaDraft) => d.observacao === "normal" && (d.contribuicao === "valor" || d.contribuicao === "ambos");

/** Formato que o schema de respostas espera (a validação é toda dele). */
export function draftToAnswers(d: FestaDraft) {
  const items = takesItems(d) ? d.itens : null;
  return {
    faixaEtaria: d.faixa,
    tipoParticipante: d.tipo,
    convidadoPor: d.tipo === "convidado" ? d.convidadoPor : undefined,
    observacao: d.observacao,
    tipoContribuicao: d.observacao === "normal" ? d.contribuicao : undefined,
    itens: items ? Object.keys(items) : undefined,
    quantidades: items ?? undefined,
    acompanhantes: d.acompanhantes.map((c) => ({ nome: c.nome, faixaEtaria: c.faixa || undefined })),
  };
}

export function addCompanion(d: FestaDraft): FestaDraft {
  const id = d.acompanhantes.reduce((max, c) => Math.max(max, c.id), -1) + 1;
  return { ...d, acompanhantes: [...d.acompanhantes, { id, nome: "", faixa: "" }] };
}
