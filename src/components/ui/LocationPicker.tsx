"use client";

import { Check, MapPin, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { LOCATIONS } from "@/lib/options";

type Option = { value: string; city: string; region: string };

const OPTIONS: Option[] = LOCATIONS.map((value) => {
  const [city, ...rest] = value.split(", ");
  return { value, city, region: rest.join(", ") };
});

/** Metro Manila first, then provinces A–Z. */
function groupByRegion(options: Option[]) {
  const groups = new Map<string, Option[]>();
  for (const o of options) groups.set(o.region, [...(groups.get(o.region) ?? []), o]);
  return [...groups.entries()].sort(([a], [b]) =>
    a === "Metro Manila" ? -1 : b === "Metro Manila" ? 1 : a.localeCompare(b),
  );
}

/** Case- and accent-insensitive ("parañaque" matches "paranaque"). */
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * City picker for the search bar. Submits the full LOCATIONS value as `name`.
 * Accessible combobox: type to filter, ↑/↓ to move, Enter to pick, Esc to close.
 */
export function LocationPicker({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const initial = OPTIONS.find((o) => o.value === defaultValue) ?? null;
  const [selected, setSelected] = useState<Option | null>(initial);
  const [query, setQuery] = useState(initial?.city ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Show everything when the box still shows the chosen city; otherwise filter.
  const filtering = query.trim() !== "" && query !== selected?.city;
  const matches = useMemo(() => {
    if (!filtering) return OPTIONS;
    const q = fold(query.trim());
    return OPTIONS.filter((o) => fold(o.value).includes(q)).sort(
      (a, b) => Number(!fold(a.city).startsWith(q)) - Number(!fold(b.city).startsWith(q)),
    );
  }, [query, filtering]);
  const groups = useMemo(() => (filtering ? [["Matches", matches] as const] : groupByRegion(matches)), [filtering, matches]);
  const flat = groups.flatMap(([, opts]) => opts);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function pick(o: Option) {
    setSelected(o);
    setQuery(o.city);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + flat.length) % Math.max(flat.length, 1));
    } else if (e.key === "Enter" && open && flat[active]) {
      e.preventDefault(); // pick instead of submitting the form
      pick(flat[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  let index = -1;
  return (
    <div ref={rootRef} className="relative flex items-center gap-3 px-3 sm:w-64 sm:border-l sm:border-line">
      <MapPin className="h-5 w-5 shrink-0 text-brand" />
      {/* Full value if picked from the list; otherwise whatever was typed (the server matches it). */}
      <input type="hidden" name={name} value={selected && query === selected.city ? selected.value : query} />
      <input
        ref={inputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && flat[active] ? `${listId}-${active}` : undefined}
        aria-label="Location"
        value={query}
        placeholder="Location"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="h-11 w-full bg-transparent text-ink outline-none placeholder:text-muted"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear location"
          onClick={() => {
            setQuery("");
            setSelected(null);
            setActive(0);
            inputRef.current?.focus();
          }}
          className="rounded-full p-1 text-muted hover:bg-canvas hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute top-full right-0 z-30 mt-3 max-h-80 w-[320px] overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-xl sm:left-0"
        >
          {flat.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No city matches &ldquo;{query}&rdquo;
            </p>
          ) : (
            groups.map(([region, opts]) => (
              <div key={region} role="group" aria-label={region}>
                <p className="sticky top-0 z-10 bg-white px-3 pt-3 pb-1.5 text-[11px] font-medium tracking-wide text-muted uppercase">
                  {region}
                </p>
                {opts.map((o) => {
                  index += 1;
                  const i = index;
                  const isSelected = selected?.value === o.value;
                  return (
                    <div
                      key={o.value}
                      id={`${listId}-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                      onClick={() => pick(o)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                        i === active ? "bg-brand-soft" : ""
                      }`}
                    >
                      <span>
                        <Highlight text={o.city} query={filtering ? query.trim() : ""} />
                        {filtering && <span className="ml-1.5 text-xs text-muted">{o.region}</span>}
                      </span>
                      {isSelected && <Check className="h-4 w-4 shrink-0 text-brand" />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <span className="text-ink">{text}</span>;
  const start = fold(text).indexOf(fold(query));
  if (start < 0) return <span className="text-ink">{text}</span>;
  return (
    <span className="text-ink">
      {text.slice(0, start)}
      <mark className="rounded-sm bg-transparent font-semibold text-brand">{text.slice(start, start + query.length)}</mark>
      {text.slice(start + query.length)}
    </span>
  );
}
