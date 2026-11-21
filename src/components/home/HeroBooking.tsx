import Image from "next/image";
import { CalendarCheck2, Check, MapPin, ShieldCheck } from "lucide-react";

/** Hero option C: a booking-confirmed card showing coverage and the starting fee. */
export function HeroBooking() {
  return (
    <div className="relative h-[216px] w-[326px] overflow-hidden rounded-2xl bg-brand" aria-hidden>
      {/* soft shapes */}
      <svg viewBox="0 0 326 216" className="absolute inset-0 h-full w-full">
        <circle cx="290" cy="20" r="70" fill="white" fillOpacity="0.06" />
        <circle cx="20" cy="210" r="60" fill="white" fillOpacity="0.05" />
      </svg>

      {/* back card (stack effect) */}
      <div className="absolute top-[24px] left-[46px] h-[176px] w-[234px] rotate-[-6deg] rounded-2xl bg-white/25" />

      {/* main card */}
      <div className="absolute top-[16px] left-[46px] w-[234px] rounded-2xl bg-white p-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CalendarCheck2 className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] font-semibold tracking-wide text-brand uppercase">Booking confirmed</p>
        </div>

        <div className="mt-2.5 flex items-center gap-2.5">
          <Image src="/avatars/ramon.villaflor.svg" alt="" width={34} height={34} unoptimized className="rounded-full" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink">Dr. Ramon Villaflor</p>
            <p className="flex items-center gap-1 text-[10px] text-muted">
              <MapPin className="h-3 w-3 shrink-0" /> Makati City · 1.0 km
            </p>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-lg bg-canvas p-2 text-[10px] whitespace-nowrap">
          <div>
            <p className="text-muted">When</p>
            <p className="font-semibold text-ink">Thu, 10:30 AM</p>
          </div>
          <div>
            <p className="text-muted">Starting fee</p>
            <p className="font-semibold text-ink">₱1,200 onwards</p>
          </div>
        </div>

        <p className="mt-2.5 flex items-center gap-1.5 text-[10px] whitespace-nowrap text-ink">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand" /> Covered by
          <span className="rounded-full bg-brand-soft px-1.5 py-0.5 font-medium text-brand">PhilHealth CWD</span>
        </p>
      </div>

      {/* check bubble */}
      <span className="absolute top-[6px] left-[268px] flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand shadow-md">
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    </div>
  );
}
