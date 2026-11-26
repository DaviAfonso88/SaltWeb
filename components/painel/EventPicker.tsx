/** Escolha do evento por GET (funciona sem JavaScript), usada nas páginas por evento. */
export function EventPicker({ events, selected }: { events: { id: string; title: string }[]; selected: string }) {
  return (
    <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
      <div className="grid max-w-full gap-1.5">
        <label htmlFor="evento" className="text-sm font-semibold">
          Evento
        </label>
        <select id="evento" name="evento" defaultValue={selected} key={selected} className="min-h-11 max-w-full rounded-xl border border-input bg-card px-3 text-sm">
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-purple-dark">
        Aplicar
      </button>
    </form>
  );
}
