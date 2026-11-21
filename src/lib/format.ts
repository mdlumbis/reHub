/** Display helpers. All times are shown in Philippine time. */

export const TZ = "Asia/Manila";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

export function formatPeso(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined || amount === "") return "";
  return peso.format(Number(amount));
}

export function initials(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

/** "Dr. Sofia Reyes" for physiatrists, "Miguel Santos" otherwise. */
export function providerName(p: { first_name: string | null; last_name: string | null; profession?: string | null }) {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ");
  return p.profession === "Physiatrist" ? `Dr. ${name}` : name;
}

/** YYYY-MM-DD of a date in Manila time. */
export function manilaDateKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

export function formatTime(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date(d));
}

/** "Today, 2:30 PM" / "Tomorrow, 9:00 AM" / "Tue, 8:00 AM" / "Mon 1 Dec, 9:00 AM" */
export function formatSlotLabel(iso: string | null | undefined, now = new Date()) {
  if (!iso) return null;
  const d = new Date(iso);
  const dayDiff = Math.round(
    (Date.parse(manilaDateKey(d)) - Date.parse(manilaDateKey(now))) / 86_400_000,
  );
  const time = formatTime(d);
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Tomorrow, ${time}`;
  const opts: Intl.DateTimeFormatOptions =
    dayDiff < 7 ? { weekday: "short" } : { weekday: "short", day: "numeric", month: "short" };
  return `${new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(d)}, ${time}`;
}

/** "Thursday, 11 September" */
export function formatLongDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(
    new Date(d),
  );
}

export const VISIT_MODE_LABEL: Record<string, string> = {
  in_person: "In-person",
  home: "Home visits",
  online: "Online",
};

export function formatVisitModes(modes: string[] | null | undefined) {
  return (modes ?? []).map((m) => VISIT_MODE_LABEL[m] ?? m).join(", ");
}

export function formatKm(km: number | null | undefined) {
  if (km === null || km === undefined) return null;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/** "Makati City, Metro Manila" -> "Makati City" */
export function shortCity(location: string | null | undefined) {
  return location?.split(",")[0] ?? "";
}

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = (x: number) => (x * Math.PI) / 180;
  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/** Current time for server components (kept out of render bodies for React's purity lint). */
export function now() {
  return new Date();
}

export function isPast(iso: string) {
  return Date.parse(iso) <= Date.now();
}

export function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000);
}
