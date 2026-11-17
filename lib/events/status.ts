import type { PublicEvent } from "./queries";

/** Inscrições aceitas agora: aberta, com modelo e dentro da data limite (quando houver). */
export function isRegistrationOpen(
  event: Pick<PublicEvent, "registrationOpen" | "formModel" | "registrationClosesAt">,
  now: Date = new Date(),
): boolean {
  if (!event.registrationOpen || !event.formModel) return false;
  return !event.registrationClosesAt || new Date(event.registrationClosesAt) > now;
}

/** Quebra o texto em parágrafos por linha em branco. */
export function paragraphs(text: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
