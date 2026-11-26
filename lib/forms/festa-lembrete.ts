import { formatCurrency } from "@/lib/format";
import { PIX_KEY_DISPLAY } from "@/lib/pix";
import { whatsappUrlForPhone } from "@/lib/text";

import { chosenItems, companionsOf, formatItem, wantsValue, type ChosenItem } from "./festa";
import type { Answers } from "./types";

/** O que a pessoa se comprometeu a levar e a pagar em um evento Festa. */
export type FestaContribuicao = {
  itens: ChosenItem[];
  /** null quando não há contribuição em dinheiro. */
  valorCentavos: number | null;
  acompanhantes: string[];
};

export function festaContribuicao(answers: Answers, valorCentavos: number): FestaContribuicao {
  return {
    itens: chosenItems(answers),
    valorCentavos: wantsValue(answers) ? valorCentavos : null,
    acompanhantes: companionsOf(answers).map((c) => c.nome),
  };
}

export const hasContribution = (c: FestaContribuicao) => c.itens.length > 0 || c.valorCentavos !== null;

type Reminder = {
  /** `equipe`: o painel envia para a pessoa. `propria`: a pessoa salva no próprio WhatsApp. */
  de: "equipe" | "propria";
  telefone: string;
  nome: string;
  numero: number;
  evento: string;
  quando: string;
  local?: string | null;
  contribuicao: FestaContribuicao;
  /**
   * Contribuição em valor: `true` avisa que o pagamento foi recebido, `false` manda a chave Pix e
   * omitido não fala de pagamento (quem envia não tem acesso a essa informação).
   */
  pago?: boolean;
};

export function festaReminderText({ de, nome, numero, evento, quando, local, contribuicao, pago }: Omit<Reminder, "telefone">): string {
  const own = de === "propria";
  const first = nome.trim().split(/\s+/)[0] ?? "";
  const intro = own
    ? `Lembrete da minha inscrição em *${evento}* (nº ${numero}).`
    : `Oi, ${first}! Aqui é da Juventude SALT. Passando para lembrar da sua inscrição em *${evento}* (nº ${numero}).`;

  const blocks = [intro];
  const { itens, valorCentavos, acompanhantes } = contribuicao;
  if (itens.length) {
    blocks.push([own ? "*Fiquei de levar:*" : "*Você ficou de levar:*", ...itens.map((i) => `• ${formatItem(i)}`)].join("\n"));
  }
  if (valorCentavos !== null) {
    const line = `*Contribuição:* ${formatCurrency(valorCentavos)}`;
    if (pago === undefined) blocks.push(line);
    else blocks.push(pago ? `${line} (pagamento recebido)` : `${line}\nPix (chave CNPJ): ${PIX_KEY_DISPLAY}`);
  }
  if (acompanhantes.length) blocks.push(`*Acompanhantes:* ${acompanhantes.join(", ")}`);
  blocks.push([`Quando: ${quando}`, local ? `Onde: ${local}` : null].filter(Boolean).join("\n"));
  if (!own) blocks.push("Esperamos você!");

  return blocks.join("\n\n");
}

/** Abre a conversa com o telefone informado já com o lembrete escrito; o envio é manual. */
export function festaReminderUrl({ telefone, ...reminder }: Reminder): string | null {
  return whatsappUrlForPhone(telefone, festaReminderText(reminder));
}
