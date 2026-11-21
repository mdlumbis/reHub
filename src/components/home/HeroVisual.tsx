import Image from "next/image";
import { BadgeCheck, CalendarDays, MapPin } from "lucide-react";

/**
 * Decorative homepage hero: a map with a route from "you" to a nearby verified provider,
 * plus two floating cards. Pure HTML/SVG in brand colors, no stock photo.
 */
export function HeroVisual() {
  return (
    <div
      className="relative h-[216px] w-[326px] overflow-hidden rounded-2xl bg-brand"
      aria-hidden
    >
      {/* Map: blocks, streets, route */}
      <svg viewBox="0 0 326 216" className="absolute inset-0 h-full w-full">
        <defs>
          <pattern id="hero-grid" width="27" height="27" patternUnits="userSpaceOnUse">
            <path d="M27 0H0V27" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="326" height="216" fill="url(#hero-grid)" />
        {/* city blocks */}
        <g fill="white" fillOpacity="0.06">
          <rect x="18" y="122" width="58" height="40" rx="6" />
          <rect x="96" y="150" width="48" height="50" rx="6" />
          <rect x="232" y="20" width="70" height="36" rx="6" />
          <rect x="250" y="120" width="56" height="44" rx="6" />
          <rect x="160" y="96" width="40" height="34" rx="6" />
        </g>
        {/* main roads */}
        <path d="M0 108 C 90 100, 150 128, 326 88" stroke="white" strokeOpacity="0.14" strokeWidth="10" fill="none" />
        <path d="M212 0 C 200 80, 230 140, 214 216" stroke="white" strokeOpacity="0.12" strokeWidth="8" fill="none" />
        {/* 5 km radius */}
        <circle cx="62" cy="176" r="92" fill="white" fillOpacity="0.04" stroke="white" strokeOpacity="0.18" strokeDasharray="3 5" />
        {/* route from you to the clinic */}
        <path
          d="M62 176 C 110 170, 120 120, 170 112 S 236 92, 262 72"
          stroke="#e6f0ec"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="1 7"
          fill="none"
        />
        {/* you */}
        <circle cx="62" cy="176" r="13" fill="#e6f0ec" fillOpacity="0.25">
          <animate attributeName="r" values="9;15;9" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity" values="0.35;0.1;0.35" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="62" cy="176" r="6" fill="white" stroke="#135a54" strokeWidth="2" />
      </svg>

      {/* Clinic pin */}
      <div className="absolute top-[38px] left-[250px] flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
        <MapPin className="h-4 w-4 text-brand" />
      </div>

      {/* Provider card */}
      <div className="absolute top-4 left-4 flex w-[196px] items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-lg">
        <Image src="/avatars/sofia.reyes.svg" alt="" width={36} height={36} unoptimized className="rounded-full" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
            Dr. Sofia Reyes <BadgeCheck className="h-3.5 w-3.5 text-brand" />
          </p>
          <p className="text-[11px] text-muted">Physiatrist · 0.9 km away</p>
        </div>
      </div>

      {/* Availability card */}
      <div className="absolute right-4 bottom-4 w-[150px] rounded-xl bg-white p-2.5 shadow-lg">
        <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Earliest available</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-brand">
          <CalendarDays className="h-3.5 w-3.5" /> Today, 2:30 PM
        </p>
        <span className="mt-1.5 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-[10px] text-brand">
          Maxicare accepted
        </span>
      </div>
    </div>
  );
}
