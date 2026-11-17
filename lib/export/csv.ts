export type CsvColumn<T> = { header: string; value: (row: T) => string };

const escape = (value: string) => {
  // Neutraliza fórmulas de planilha (=, +, -, @) em células de texto digitadas por visitantes.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[";\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** CSV em UTF-8 com BOM e `;` como separador: abre direto no Excel em português. */
export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const lines = [columns.map((c) => escape(c.header)).join(";")];
  for (const row of rows) lines.push(columns.map((c) => escape(c.value(row))).join(";"));
  return `﻿${lines.join("\r\n")}\r\n`;
}
