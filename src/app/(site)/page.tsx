import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Hand,
  MapPin,
  MessagesSquare,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { COVERAGE_OPTIONS, HERO_STATS, PHILHEALTH_PACKAGES, SPECIALTIES } from "@/lib/constants";

const ICONS = {
  stethoscope: Stethoscope,
  activity: Activity,
  hand: Hand,
  messages: MessagesSquare,
};

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 lg:px-14">
      {/* Hero */}
      <section className="rounded-3xl bg-brand-soft p-8 lg:p-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs tracking-wide text-brand uppercase">Care that meets you where you are</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink lg:text-[42px]">
              Find your rehabilitation team
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Clinics, physiatrists, physical and occupational therapists, and speech-language
              pathologists. The right support for your next step.
            </p>
          </div>
          {/* Replace with hero image: put the file in /public and use next/image */}
          <div className="hidden h-[216px] w-[326px] shrink-0 rounded-2xl bg-brand lg:block" aria-hidden />
        </div>

        <form
          action="/search"
          className="mt-7 flex flex-col gap-2 rounded-xl border border-line bg-white p-2 sm:flex-row sm:items-center"
        >
          <label className="flex flex-1 items-center gap-3 px-3">
            <Search className="h-5 w-5 text-brand" />
            <input
              name="q"
              placeholder="Search a name, specialization or service"
              className="h-11 w-full bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>
          <label className="flex items-center gap-3 px-3 sm:w-56 sm:border-l sm:border-line">
            <MapPin className="h-5 w-5 text-brand" />
            <input
              name="location"
              placeholder="Location"
              className="h-11 w-full bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>
          <button className="h-12 rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-hover">
            Search
          </button>
        </form>

        <dl className="mt-7 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-3">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-2xl font-semibold text-brand">{s.value}</dd>
              <span className="text-sm text-muted">{s.label}</span>
            </div>
          ))}
        </dl>
      </section>

      {/* Specialties */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Who do you need?</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPECIALTIES.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <Link
                key={s.slug}
                href={`/search?specialty=${s.slug}`}
                className="flex min-h-44 flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-brand"
              >
                <Icon className="h-7 w-7 text-brand" strokeWidth={1.5} />
                <span className="mt-5 font-semibold text-ink">{s.name}</span>
                <span className="mt-1 text-sm text-muted">{s.blurb}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PhilHealth packages */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">PhilHealth accredited packages</h2>
          <Link href="/coverage" className="flex items-center gap-1 text-sm text-brand hover:underline">
            Explore coverage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {PHILHEALTH_PACKAGES.map((p) => (
            <div key={p.name} className="flex gap-4 rounded-2xl border border-line bg-white p-6">
              <ShieldCheck className="h-6 w-6 shrink-0 text-brand" strokeWidth={1.5} />
              <div>
                <p className="font-semibold text-ink">{p.name}</p>
                <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage chips */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Find care with your coverage</h2>
        <p className="mt-4 text-sm text-muted">
          Search for providers who accept your HMO, guarantee letter or assistance program.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {COVERAGE_OPTIONS.map((c) => (
            <Link
              key={c}
              href={`/search?coverage=${encodeURIComponent(c)}`}
              className="rounded-full bg-brand-soft px-3 py-1.5 text-xs text-brand hover:bg-brand-mist"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
