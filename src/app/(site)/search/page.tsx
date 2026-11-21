import Link from "next/link";
import { ChevronDown, MapPin, SearchX } from "lucide-react";
import { Notice } from "@/components/ui/form";
import { ProviderCard } from "@/components/ui/ProviderCard";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  SPECIALTY_TO_PROFESSION,
  getCoverageOptions,
  resolveLocation,
  searchProviders,
  type SearchResult,
} from "@/lib/directory";
import { shortCity } from "@/lib/format";
import { PROFESSIONS } from "@/lib/options";
import { SearchFilters, type FilterGroup } from "./SearchFilters";

const PAGE_SIZE = 10;
const NEAR_KM = 5;

const SORTS = {
  nearest: "Nearest first",
  earliest: "Earliest available",
  fee: "Lowest starting fee",
} as const;
type SortKey = keyof typeof SORTS;

const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export const metadata = { title: "Find care · reHUB" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const location = resolveLocation(one(sp.location));
  const types = [
    ...list(sp.type),
    ...list(sp.specialty).map((s) => SPECIALTY_TO_PROFESSION[s]).filter(Boolean),
  ].filter((t) => PROFESSIONS.includes(t));
  const coverage = list(sp.coverage);
  const cities = list(sp.city);
  const dist = one(sp.dist) || "any";
  const sort: SortKey = one(sp.sort) in SORTS ? (one(sp.sort) as SortKey) : location ? "nearest" : "earliest";
  const showAll = one(sp.all) === "1";

  // Base results (text + location only) drive the filter counts; filtered results drive the list.
  const [base, coverageOptions] = await Promise.all([
    searchProviders({ query: q, location }),
    getCoverageOptions(),
  ]);

  let results = await searchProviders({
    query: q,
    location,
    professions: types,
    coverage,
    maxKm: location && dist !== "any" ? Number(dist) : null,
  });
  if (cities.length) results = results.filter((r) => r.clinic_location && cities.includes(r.clinic_location));
  results = sortResults(results, sort);

  const near = location && sort === "nearest" ? results.filter((r) => (r.distance_km ?? Infinity) <= NEAR_KM) : [];
  const nearCount = location ? results.filter((r) => (r.distance_km ?? Infinity) <= NEAR_KM).length : 0;
  const visible = showAll ? results : results.slice(0, PAGE_SIZE);
  const visibleNear = visible.filter((r) => near.includes(r));
  const visibleRest = visible.filter((r) => !near.includes(r));

  // ---- Filter groups ---------------------------------------------------------
  const count = (pred: (r: SearchResult) => boolean) => base.filter(pred).length;
  const coverageGroup = (kind: string, title: string, name = "coverage"): FilterGroup => ({
    title,
    name,
    type: "checkbox",
    limit: kind === "hmo" ? 2 : undefined,
    options: coverageOptions
      .filter((c) => c.kind === kind)
      .map((c) => ({
        value: c.slug,
        label: kind === "assistance" ? `Accepts ${c.slug === "dswd" ? "DSWD assistance" : c.name.toLowerCase()}` : c.short_name,
        count: count((r) => r.coverage.includes(c.short_name)),
      })),
  });

  const cityOptions = [...new Set(base.map((r) => r.clinic_location).filter(Boolean) as string[])]
    .sort()
    .map((c) => ({ value: c, label: shortCity(c), count: count((r) => r.clinic_location === c) }));

  const groups: FilterGroup[] = [
    {
      title: "Provider type",
      name: "type",
      type: "checkbox",
      options: PROFESSIONS.map((p) => ({ value: p, label: p, count: count((r) => r.profession === p) })),
    },
    ...(location
      ? [
          {
            title: "Distance",
            name: "dist",
            type: "radio" as const,
            options: [
              { value: "5", label: "Within 5 km", count: count((r) => (r.distance_km ?? Infinity) <= 5) },
              { value: "10", label: "Within 10 km", count: count((r) => (r.distance_km ?? Infinity) <= 10) },
              { value: "any", label: "Anywhere", count: base.length },
            ],
          },
        ]
      : []),
    { title: "Location", name: "city", type: "checkbox", limit: 2, options: cityOptions },
    coverageGroup("philhealth_package", "PhilHealth package"),
    coverageGroup("assistance", "Other coverage"),
    coverageGroup("hmo", "HMO accepted"),
  ];

  const keep = { q, location: location ?? "", sort: one(sp.sort) };
  const query = (extra: Record<string, string>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) for (const val of list(v)) u.append(k, val);
    for (const [k, v] of Object.entries(extra)) u.set(k, v);
    return `/search?${u.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 lg:px-14">
      <h1 className="text-4xl font-semibold tracking-tight text-ink">Find care near you</h1>
      <p className="mt-3 text-muted">
        Verified rehabilitation providers{location ? ", ranked by distance from your location" : ""}.
      </p>

      <div className="mt-8">
        <SearchBar
          defaultQuery={q}
          defaultLocation={location ?? undefined}
          hidden={{ type: list(sp.type), coverage, city: cities, ...(dist !== "any" ? { dist } : {}) }}
        />
        {one(sp.location) && !location && (
          <p className="mt-2 text-sm text-red-700">
            We couldn&apos;t find &ldquo;{one(sp.location)}&rdquo;. Pick a city from the suggestions.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[264px_1fr]">
        <aside>
          <SearchFilters
            groups={groups}
            selected={{ type: types, coverage, city: cities, dist: [dist] }}
            keep={keep}
          />
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {results.length} provider{results.length === 1 ? "" : "s"}
              {location && ` · ${nearCount} within ${NEAR_KM} km of ${shortCity(location)}`}
            </p>
            <SortMenu current={sort} hrefFor={(s) => query({ sort: s })} />
          </div>

          {results.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-white px-6 py-16 text-center">
              <SearchX className="h-8 w-8 text-brand" />
              <p className="mt-4 font-semibold text-ink">No providers match these filters</p>
              <p className="mt-1 text-sm text-muted">Try removing a filter or searching a wider area.</p>
              <Link href="/search" className="mt-5 text-sm font-medium text-brand hover:underline">
                Clear search
              </Link>
            </div>
          ) : (
            <>
              {visibleNear.length > 0 && (
                <>
                  <p className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-brand uppercase">
                    <MapPin className="h-4 w-4" /> Within {NEAR_KM} km of you, ranked first
                  </p>
                  <div className="mt-3 flex flex-col gap-4">
                    {visibleNear.map((r) => (
                      <ProviderCard key={r.provider_id} p={r} locationParam={location ?? undefined} />
                    ))}
                  </div>
                </>
              )}
              {visibleRest.length > 0 && (
                <>
                  {visibleNear.length > 0 && (
                    <p className="mt-8 text-xs font-semibold tracking-wide text-muted uppercase">Further away</p>
                  )}
                  <div className="mt-3 flex flex-col gap-4">
                    {visibleRest.map((r) => (
                      <ProviderCard key={r.provider_id} p={r} locationParam={location ?? undefined} />
                    ))}
                  </div>
                </>
              )}

              <div className="mt-6">
                <Notice>
                  All fees shown are starting fees, not final billing. The final amount is set on the day of treatment
                  and depends on the management given.
                </Notice>
              </div>

              {!showAll && results.length > PAGE_SIZE && (
                <div className="mt-6 flex justify-center">
                  <Link
                    href={query({ all: "1" })}
                    className="rounded-lg border border-line bg-white px-5 py-3 font-semibold text-ink hover:border-brand"
                  >
                    Show all {results.length} providers
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function sortResults(rows: SearchResult[], sort: SortKey) {
  const t = (r: SearchResult) => (r.earliest_available ? Date.parse(r.earliest_available) : Infinity);
  const copy = [...rows];
  if (sort === "earliest") copy.sort((a, b) => t(a) - t(b));
  if (sort === "fee") copy.sort((a, b) => (a.min_fee ?? Infinity) - (b.min_fee ?? Infinity));
  if (sort === "nearest") copy.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
  return copy;
}

function SortMenu({ current, hrefFor }: { current: SortKey; hrefFor: (s: SortKey) => string }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink [&::-webkit-details-marker]:hidden">
        Sort: {SORTS[current]}
        <ChevronDown className="h-4 w-4 text-brand transition group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-line bg-white p-1 shadow-lg">
        {(Object.keys(SORTS) as SortKey[]).map((s) => (
          <Link
            key={s}
            href={hrefFor(s)}
            className={`block rounded-md px-3 py-2 text-sm hover:bg-brand-soft ${s === current ? "font-semibold text-brand" : "text-ink"}`}
          >
            {SORTS[s]}
          </Link>
        ))}
      </div>
    </details>
  );
}
