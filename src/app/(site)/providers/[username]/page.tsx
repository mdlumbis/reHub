import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import {
  getLocationCoords,
  getOpenSlots,
  getProviderProfile,
  resolveLocation,
  type Slot,
} from "@/lib/directory";
import {
  TZ,
  distanceKm,
  formatKm,
  formatPeso,
  formatSlotLabel,
  formatTime,
  daysFromNow,
  formatVisitModes,
  initials,
  now,
  manilaDateKey,
  providerName,
  shortCity,
} from "@/lib/format";

const DAY_MS = 86_400_000;

export async function generateMetadata({ params }: PageProps<"/providers/[username]">) {
  const { username } = await params;
  const profile = await getProviderProfile(username);
  return { title: profile ? `${providerName(profile.provider)} · reHUB` : "Provider · reHUB" };
}

export default async function ProviderProfilePage({ params, searchParams }: PageProps<"/providers/[username]">) {
  const { username } = await params;
  const sp = await searchParams;
  const profile = await getProviderProfile(username);
  if (!profile) notFound();

  const { provider: p, clinics, services, coverage, allCoverage } = profile;
  const clinic = clinics[0];
  const week = Math.max(0, Math.min(3, Number(sp.week) || 0));
  const location = resolveLocation(typeof sp.location === "string" ? sp.location : null);

  // Five weekdays starting today (+ week offset), and the open slots in them.
  const days = weekdays(daysFromNow(week * 7), 5);
  const [slots, nextSlots, origin] = await Promise.all([
    getOpenSlots(p.id, new Date(Date.parse(days[0].key + "T00:00:00+08:00")), new Date(Date.parse(days[4].key + "T23:59:59+08:00"))),
    getOpenSlots(p.id, now(), daysFromNow(60)),
    getLocationCoords(location),
  ]);
  const earliest = nextSlots[0];
  const distance =
    origin && clinic?.lat != null && clinic?.lng != null ? distanceKm(origin.lat, origin.lng, clinic.lat, clinic.lng) : null;

  const name = providerName(p);
  const bookHref = (slot: Slot) => `/providers/${p.username}/book?slot=${slot.id}`;
  const accepted = new Set(coverage.map((c) => c.id));
  const nonHmo = allCoverage.filter((c) => c.kind !== "hmo");
  const hmos = coverage.filter((c) => c.kind === "hmo");

  const facts = [
    distance !== null && `${formatKm(distance)} from you`,
    clinic && [clinic.street_address, shortCity(clinic.location)].filter(Boolean).join(", "),
    clinic?.established_year && `Est. ${clinic.established_year}`,
    clinic?.clinician_count && `${clinic.clinician_count} clinicians`,
    formatVisitModes(p.visit_modes),
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 lg:px-14">
      <nav className="text-sm text-muted">
        <Link href={location ? `/search?location=${encodeURIComponent(location)}` : "/search"} className="hover:text-ink">
          Find care
        </Link>
        {clinic && <> / <span>{clinic.name}</span></>} / <span className="text-ink">{name}</span>
      </nav>

      {/* Header */}
      <section className="mt-6 flex flex-col gap-6 rounded-2xl border border-line bg-white p-6 sm:flex-row">
        <span className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-brand-mist text-4xl font-medium text-brand">
          {initials(p.first_name, p.last_name)}
        </span>
        <div className="min-w-0">
          <span className="inline-block rounded-md bg-brand-soft px-2.5 py-1 text-xs text-brand uppercase">
            {p.profession} · Verified on reHUB
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{name}</h1>
          {(p.credentials || p.headline) && (
            <p className="mt-2 text-body">{[p.credentials, p.headline].filter(Boolean).join(" · ")}</p>
          )}
          <p className="mt-3 text-sm text-muted">{facts.join(" · ")}</p>
          {coverage.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {coverage.map((c) => (
                <span key={c.id} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">
                  {c.kind === "philhealth_package" ? `PhilHealth ${c.short_name}` : c.short_name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_440px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-semibold text-ink">About</h2>
            <p className="mt-3 leading-relaxed text-body">{p.about || "This provider hasn't added an introduction yet."}</p>
            {p.specializations.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.specializations.map((s) => (
                  <span key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-body">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-semibold text-ink">Services and starting fees</h2>
            <p className="mt-1 text-sm text-muted">Every amount below is a starting fee, adjusted on the day of treatment.</p>
            {services.length ? (
              <table className="mt-5 w-full text-left">
                <thead>
                  <tr className="bg-canvas text-[11px] tracking-wide text-muted uppercase">
                    <th className="px-3 py-3 font-medium">Service</th>
                    <th className="px-3 py-3 font-medium">Duration</th>
                    <th className="px-3 py-3 text-right font-medium">Starting fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className="px-3 py-4 text-ink">{s.name}</td>
                      <td className="px-3 py-4 text-sm text-muted">{s.duration_min} min</td>
                      <td className="px-3 py-4 text-right font-semibold text-ink">{formatPeso(s.starting_fee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-4 text-sm text-muted">No services listed yet.</p>
            )}
          </section>

          <section id="availability" className="scroll-mt-6 rounded-2xl border border-line bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  {week === 0 ? "Available this week" : "Available"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Choose a time to begin booking.{clinic ? ` In-person at ${clinic.name}.` : ""}
                </p>
              </div>
              <div className="flex gap-1">
                <WeekLink week={week - 1} disabled={week === 0} label="Earlier" username={p.username} location={location}>
                  <ChevronLeft className="h-4 w-4" />
                </WeekLink>
                <WeekLink week={week + 1} disabled={week >= 3} label="Later" username={p.username} location={location}>
                  <ChevronRight className="h-4 w-4" />
                </WeekLink>
              </div>
            </div>
            <SlotGrid days={days} slots={slots} hrefFor={bookHref} />
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-brand-soft p-6">
            <p className="text-xs font-semibold tracking-wide text-brand uppercase">Fee</p>
            <p className="mt-3 text-sm leading-relaxed text-body">
              {services.length > 0 && (
                <>
                  Starting from <strong className="text-ink">{formatPeso(Math.min(...services.map((s) => s.starting_fee)))}</strong>.{" "}
                </>
              )}
              The final amount is set on the day of treatment and depends on the management given.
            </p>
            {earliest ? (
              <>
                <p className="mt-4 flex items-center gap-2 font-semibold text-ink">
                  <CalendarDays className="h-5 w-5 text-brand" /> {formatSlotLabel(earliest.starts_at)}
                </p>
                <Link
                  href={bookHref(earliest)}
                  className="mt-4 flex h-12 items-center justify-center rounded-lg bg-brand font-semibold text-white hover:bg-brand-hover"
                >
                  Book appointment
                </Link>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">No open times in the next 60 days.</p>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-semibold text-ink">Coverage accepted</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {nonHmo.map((c) =>
                accepted.has(c.id) ? (
                  <li key={c.id} className="flex items-center gap-2.5 text-ink">
                    <Check className="h-4 w-4 text-brand" /> {c.name}
                  </li>
                ) : (
                  <li key={c.id} className="flex items-center gap-2.5 text-muted">
                    <X className="h-4 w-4" /> {c.name} · Not accepted
                  </li>
                ),
              )}
            </ul>
            <p className="mt-5 text-[11px] font-medium tracking-wide text-muted uppercase">HMO accepted</p>
            {hmos.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hmos.map((c) => (
                  <span key={c.id} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">
                    {c.short_name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">None listed</p>
            )}
          </section>

          {clinic && (
            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-xl font-semibold text-ink">Location</h2>
              <div className="mt-4 flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div className="text-sm">
                  <p className="font-medium text-ink">{clinic.name}</p>
                  <p className="mt-0.5 text-body">{[clinic.street_address, clinic.location].filter(Boolean).join(", ")}</p>
                  {clinic.schedule_text && <p className="mt-1 text-muted">{clinic.schedule_text}</p>}
                  {distance !== null && (
                    <p className="mt-2 text-brand">
                      {formatKm(distance)}
                      {distance <= 5 ? " · inside your 5 km radius" : " from you"}
                    </p>
                  )}
                  {clinic.lat != null && clinic.lng != null && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${clinic.lat},${clinic.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-brand hover:underline"
                    >
                      Open directions <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-semibold text-ink">Verified on reHUB</h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.prc_status === "verified" && <VerifiedChip>PRC licence</VerifiedChip>}
              {clinic?.address_verified && <VerifiedChip>Address geocoded</VerifiedChip>}
              {p.parm_status === "verified" && <VerifiedChip>PARM fellowship</VerifiedChip>}
              {p.philhealth_status === "verified" && <VerifiedChip>PhilHealth accredited</VerifiedChip>}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/** Next `n` weekdays (Mon–Fri) in Manila time, starting from `from`. */
function weekdays(from: Date, n: number) {
  const out: { key: string; label: string }[] = [];
  for (let d = new Date(from); out.length < n; d = new Date(d.getTime() + DAY_MS)) {
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(d);
    if (wd === "Sat" || wd === "Sun") continue;
    out.push({
      key: manilaDateKey(d),
      label: new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric" }).format(d).toUpperCase(),
    });
  }
  return out;
}

function SlotGrid({
  days,
  slots,
  hrefFor,
}: {
  days: { key: string; label: string }[];
  slots: Slot[];
  hrefFor: (s: Slot) => string;
}) {
  const byDay = new Map<string, Map<string, Slot>>();
  const times = new Set<string>();
  for (const s of slots) {
    const day = manilaDateKey(new Date(s.starts_at));
    const time = formatTime(s.starts_at);
    times.add(time);
    if (!byDay.has(day)) byDay.set(day, new Map());
    byDay.get(day)!.set(time, s);
  }
  const sortedTimes = [...times].sort(
    (a, b) => Date.parse(`2000-01-01 ${a}`) - Date.parse(`2000-01-01 ${b}`),
  );

  if (!slots.length) {
    return <p className="mt-6 rounded-lg bg-canvas px-4 py-6 text-center text-sm text-muted">No open times in these days.</p>;
  }

  return (
    <div className="mt-5 grid grid-cols-5 gap-2">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted">{d.label}</p>
          {sortedTimes.map((t) => {
            const slot = byDay.get(d.key)?.get(t);
            return slot ? (
              <Link
                key={t}
                href={hrefFor(slot)}
                className="rounded-md bg-brand-soft py-2.5 text-center text-sm text-ink transition hover:bg-brand hover:text-white"
              >
                {t}
              </Link>
            ) : (
              <span key={t} className="rounded-md bg-canvas py-2.5 text-center text-sm text-muted" aria-hidden>
                —
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function WeekLink({
  week,
  disabled,
  label,
  username,
  location,
  children,
}: {
  week: number;
  disabled: boolean;
  label: string;
  username: string;
  location: string | null;
  children: React.ReactNode;
}) {
  const cls = "flex h-9 w-9 items-center justify-center rounded-lg border border-line";
  if (disabled) return <span className={`${cls} text-line`} aria-hidden>{children}</span>;
  const qs = new URLSearchParams({ week: String(week), ...(location ? { location } : {}) });
  return (
    <Link href={`/providers/${username}?${qs}#availability`} aria-label={label} className={`${cls} text-ink hover:border-brand`}>
      {children}
    </Link>
  );
}

function VerifiedChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">
      <Check className="h-3 w-3" /> {children}
    </span>
  );
}
