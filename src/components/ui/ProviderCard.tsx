import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { SearchResult } from "@/lib/directory";
import { formatKm, formatPeso, formatSlotLabel, formatVisitModes, initials, providerName, shortCity } from "@/lib/format";

export function ProviderCard({ p, locationParam }: { p: SearchResult; locationParam?: string }) {
  const profileHref = `/providers/${p.username}${locationParam ? `?location=${encodeURIComponent(locationParam)}` : ""}`;
  const earliest = formatSlotLabel(p.earliest_available);
  const meta = [
    formatKm(p.distance_km) && `${formatKm(p.distance_km)} away`,
    p.clinic_name ?? shortCity(p.clinic_location),
    formatVisitModes(p.visit_modes),
    p.years_experience ? `${p.years_experience} yrs` : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-line bg-white p-6 sm:flex-row">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xl text-brand">
        {initials(p.first_name, p.last_name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-ink">
            <Link href={profileHref} className="hover:text-brand">
              {providerName(p)}
            </Link>
          </h3>
          <BadgeCheck className="h-5 w-5 shrink-0 text-brand" aria-label="Verified on reHUB" />
        </div>
        <span className="mt-2 inline-block rounded-md bg-brand-soft px-2.5 py-1 text-xs text-brand uppercase">
          {p.profession}
        </span>
        <p className="mt-3 text-sm text-body">
          {[p.credentials, p.headline].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-2 text-xs text-muted">{meta.join(" · ")}</p>
        {p.coverage.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.coverage.map((c) => (
              <span key={c} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col justify-between gap-4 sm:w-52">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Earliest available</p>
          <p className="mt-1 font-semibold text-brand">{earliest ?? "No open slots"}</p>
          {p.min_fee !== null && (
            <p className="mt-1 text-xs text-muted">From {formatPeso(p.min_fee)} starting fee</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`${profileHref}#availability`}
            className="flex h-11 flex-1 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Book
          </Link>
          <Link
            href={profileHref}
            className="flex h-11 flex-1 items-center justify-center rounded-lg border border-line text-sm font-semibold text-ink hover:border-brand"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}
