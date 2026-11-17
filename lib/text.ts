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

export function slugify(text: string): string {
  return normalizeKey(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
