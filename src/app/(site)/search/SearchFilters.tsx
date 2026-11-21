"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export type FilterGroup = {
  title: string;
  name: string;
  type: "checkbox" | "radio";
  options: { value: string; label: string; count?: number }[];
  /** Show this many, then "+ N more". */
  limit?: number;
};

/** Filter sidebar. A plain GET form that re-submits whenever a box changes. */
export function SearchFilters({
  groups,
  selected,
  keep,
}: {
  groups: FilterGroup[];
  selected: Record<string, string[]>;
  /** Params to keep that aren't filters (q, location, sort). */
  keep: Record<string, string>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const clearHref = `/search?${new URLSearchParams(
    Object.fromEntries(Object.entries(keep).filter(([k, v]) => v && k !== "sort")),
  ).toString()}`;

  return (
    <form
      ref={formRef}
      action="/search"
      onChange={() => formRef.current?.requestSubmit()}
      className="rounded-2xl border border-line bg-white p-6"
    >
      {Object.entries(keep).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Filters</h2>
        <Link href={clearHref} className="text-xs text-brand hover:underline">
          Clear all
        </Link>
      </div>

      {groups.map((g) => (
        <Group key={g.name + g.title} group={g} selected={selected[g.name] ?? []} />
      ))}

      <noscript>
        <button className="mt-6 h-10 w-full rounded-lg bg-brand text-sm font-semibold text-white">Apply filters</button>
      </noscript>
    </form>
  );
}

function Group({ group, selected }: { group: FilterGroup; selected: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const limit = group.limit ?? Infinity;
  // Always show selected options even when collapsed.
  const visible = expanded
    ? group.options
    : group.options.filter((o, i) => i < limit || selected.includes(o.value));
  const hiddenCount = group.options.length - visible.length;

  if (!group.options.length) return null;

  return (
    <fieldset className="mt-6">
      <legend className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">{group.title}</legend>
      <div className="flex flex-col gap-1">
        {visible.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-3 py-1 text-sm text-ink">
            <input
              type={group.type}
              name={group.name}
              value={o.value}
              defaultChecked={selected.includes(o.value)}
              className="h-4 w-4 shrink-0 accent-brand"
            />
            <span className="flex-1">{o.label}</span>
            {o.count !== undefined && <span className="text-xs text-muted">{o.count}</span>}
          </label>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-2 text-xs text-brand hover:underline">
          + {hiddenCount} more
        </button>
      )}
    </fieldset>
  );
}
