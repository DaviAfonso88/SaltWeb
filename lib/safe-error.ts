/**
 * Descrição de um erro segura para logs do servidor.
 *
 * O Drizzle inclui a consulta e seus parâmetros na mensagem (`Failed query: ... params: ...`),
 * e os parâmetros podem ser dados pessoais (nome, telefone, e-mail, saúde). Aqui só saem o tipo
 * do erro e o código do Postgres, nunca a mensagem desse tipo de erro.
 */
type WithCode = { code?: unknown; cause?: { code?: unknown } };

export function describeError(error: unknown): string {
  if (!(error instanceof Error)) return "erro desconhecido";

  const info = error as Error & WithCode;
  const raw = info.cause?.code ?? info.code;
  const code = typeof raw === "string" ? raw : undefined;
  const carriesQuery = "params" in error || "query" in error || error.message.startsWith("Failed query");

  if (carriesQuery) return `${error.name}: consulta falhou${code ? ` (código ${code})` : ""}`;
  return `${error.name}: ${error.message.slice(0, 200)}${code ? ` (código ${code})` : ""}`;
}
