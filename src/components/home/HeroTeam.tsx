import Image from "next/image";
import { Heart } from "lucide-react";

const TEAM = [
  { avatar: "/avatars/ramon.villaflor.svg", role: "Physiatrist", x: 14, y: 16 },
  { avatar: "/avatars/andrea.lim.svg", role: "Physical therapist", x: 202, y: 16 },
  { avatar: "/avatars/carla.mendoza.svg", role: "Occupational therapist", x: 14, y: 138 },
  { avatar: "/avatars/paolo.garcia.svg", role: "Speech therapist", x: 202, y: 138 },
];

/** Hero option B: the four provider types connected around the patient. */
export function HeroTeam() {
  return (
    <div className="relative h-[216px] w-[326px] overflow-hidden rounded-2xl bg-brand" aria-hidden>
      <svg viewBox="0 0 326 216" className="absolute inset-0 h-full w-full">
        <circle cx="163" cy="108" r="78" fill="white" fillOpacity="0.05" />
        <circle cx="163" cy="108" r="50" fill="white" fillOpacity="0.06" />
        {[
          [69, 36],
          [257, 36],
          [69, 158],
          [257, 158],
        ].map(([x, y]) => (
          <line
            key={`${x}-${y}`}
            x1="163"
            y1="108"
            x2={x}
            y2={y}
            stroke="#e6f0ec"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Patient in the middle */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white/20">
          <Image src="/avatars/sofia.reyes.svg" alt="" width={52} height={52} unoptimized className="rounded-full" />
        </div>
        <span className="mt-1.5 flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-brand shadow">
          <Heart className="h-3 w-3 fill-brand" /> You
        </span>
      </div>

      {/* Team */}
      {TEAM.map((m) => (
        <div
          key={m.role}
          className="absolute flex w-[110px] flex-col items-center"
          style={{ left: m.x, top: m.y }}
        >
          <Image src={m.avatar} alt="" width={40} height={40} unoptimized className="rounded-full bg-white shadow-md" />
          <span className="mt-1 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] leading-tight font-medium whitespace-nowrap text-ink shadow">
            {m.role}
          </span>
        </div>
      ))}
    </div>
  );
}
