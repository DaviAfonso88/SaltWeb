/** Minúsculas, sem acento, espaços simples. */
export function normalizeKey(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function onlyDigits(text: string): string {
  return text.replace(/\D/g, "");
}

/** Chave de telefone: só dígitos (sem código do país 55 quando vier com 12–13 dígitos). */
export function phoneKey(text: string): string {
  const digits = onlyDigits(text);
  return digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits;
}

/** Link do WhatsApp para um número brasileiro com mensagem pronta; `null` se não parece ter DDD. */
export function whatsappUrlForPhone(phone: string, text: string): string | null {
  const digits = onlyDigits(phone);
  const full = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits.startsWith("55") && digits.length >= 12 ? digits : null;
  return full ? `https://wa.me/${full}?text=${encodeURIComponent(text)}` : null;
}

export function slugify(text: string): string {
  return normalizeKey(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
