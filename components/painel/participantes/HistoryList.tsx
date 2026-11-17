export type HistoryItem = { id: string; field: string; oldValue: string | null; newValue: string | null; actor: string | null; at: string };

/** Histórico de alterações. Valores de saúde nunca chegam aqui (o histórico guarda só os nomes dos campos). */
export function HistoryList({ items }: { items: HistoryItem[] }) {
  if (!items.length) return <p className="text-sm text-text-2">Nenhuma alteração registrada.</p>;
  return (
    <ol className="grid gap-3">
      {items.map((h) => (
        <li key={h.id} className="rounded-xl border border-border p-3 text-sm">
          <p>
            <strong>{h.field}</strong>
            {h.oldValue || h.newValue ? (
              <>
                {": "}
                {h.oldValue ? <span className="text-text-2 line-through">{h.oldValue}</span> : <span className="text-text-3">vazio</span>}
                {" → "}
                {h.newValue ? <span>{h.newValue}</span> : <span className="text-text-3">vazio</span>}
              </>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-text-3">
            {h.actor ?? "Sistema"} · {h.at}
          </p>
        </li>
      ))}
    </ol>
  );
}
