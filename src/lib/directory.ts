import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LOCATIONS, PROFESSIONS } from "@/lib/options";

/** Public provider directory: search, profiles, slots. Reads only public data (see CLAUDE.md > Database). */

export type CoverageKind = "philhealth_package" | "assistance" | "hmo";

export type CoverageOption = {
  id: number;
  slug: string;
  name: string;
  short_name: string;
  kind: CoverageKind;
  sort_order: number;
};

export type SearchResult = {
  provider_id: string;
  username: string;
  first_name: string;
  last_name: string;
  profession: string;
  credentials: string | null;
  headline: string | null;
  specializations: string[];
  years_experience: number | null;
  visit_modes: string[];
  clinic_id: string | null;
  clinic_name: string | null;
  clinic_location: string | null;
  distance_km: number | null;
  earliest_available: string | null;
  min_fee: number | null;
  coverage: string[];
  /** Not returned by search_providers(); added from public_providers in searchProviders(). */
  photo_url?: string | null;
};

export type PublicProvider = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profession: string;
  specializations: string[];
  credentials: string | null;
  headline: string | null;
  about: string | null;
  years_experience: number | null;
  visit_modes: string[];
  photo_url: string | null;
  prc_status: string;
  parm_status: string | null;
  philhealth_status: string | null;
};

export type Clinic = {
  id: string;
  name: string;
  street_address: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  established_year: number | null;
  clinician_count: number | null;
  address_verified: boolean;
};

export type Service = { id: string; name: string; duration_min: number; starting_fee: number };

export type Slot = { id: string; starts_at: string; duration_min: number; mode: string; clinic_id: string | null };

/** Homepage specialty slugs -> profession values. */
export const SPECIALTY_TO_PROFESSION: Record<string, string> = {
  physiatrist: "Physiatrist",
  "physical-therapist": "Physical therapist",
  "occupational-therapist": "Occupational therapist",
  "speech-language-pathologist": "Speech-language pathologist",
};

/** Match free text like "makati" to a LOCATIONS value. */
export function resolveLocation(input: string | undefined | null): string | null {
  const q = input?.trim().toLowerCase();
  if (!q) return null;
  return (
    LOCATIONS.find((l) => l.toLowerCase() === q) ??
    LOCATIONS.find((l) => l.toLowerCase().startsWith(q)) ??
    LOCATIONS.find((l) => l.toLowerCase().includes(q)) ??
    null
  );
}

export async function getCoverageOptions(): Promise<CoverageOption[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("coverage_options").select("*").order("sort_order");
  return data ?? [];
}

export async function searchProviders(params: {
  query?: string | null;
  location?: string | null;
  professions?: string[];
  coverage?: string[];
  maxKm?: number | null;
}): Promise<SearchResult[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_providers", {
    p_query: params.query || null,
    p_location: params.location || null,
    p_professions: params.professions?.filter((p) => PROFESSIONS.includes(p)).length ? params.professions : null,
    p_coverage: params.coverage?.length ? params.coverage : null,
    p_max_km: params.maxKm ?? null,
  });
  if (error) console.error("search_providers failed", error);
  const rows: SearchResult[] = data ?? [];
  if (!rows.length) return rows;

  // Attach profile photos.
  const { data: photos } = await supabase
    .from("public_providers")
    .select("id, photo_url")
    .in("id", rows.map((r) => r.provider_id));
  const byId = new Map((photos ?? []).map((p: { id: string; photo_url: string | null }) => [p.id, p.photo_url]));
  return rows.map((r) => ({ ...r, photo_url: byId.get(r.provider_id) ?? null }));
}

export type ProviderProfile = {
  provider: PublicProvider;
  clinics: (Clinic & { schedule_text: string | null; visit_modes: string[]; is_primary: boolean })[];
  services: Service[];
  coverage: CoverageOption[]; // accepted
  allCoverage: CoverageOption[];
};

export async function getProviderProfile(username: string): Promise<ProviderProfile | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();

  const { data: provider } = await supabase
    .from("public_providers")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!provider) return null;

  const [clinicsRes, servicesRes, coverageRes, allCoverage] = await Promise.all([
    supabase
      .from("provider_clinics")
      .select("schedule_text, visit_modes, is_primary, clinics(*)")
      .eq("provider_id", provider.id)
      .order("is_primary", { ascending: false }),
    supabase
      .from("services")
      .select("id, name, duration_min, starting_fee")
      .eq("provider_id", provider.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase.from("provider_coverage").select("coverage_id").eq("provider_id", provider.id),
    getCoverageOptions(),
  ]);

  const acceptedIds = new Set((coverageRes.data ?? []).map((c: { coverage_id: number }) => c.coverage_id));

  type ClinicLink = { schedule_text: string | null; visit_modes: string[]; is_primary: boolean; clinics: Clinic };
  return {
    provider,
    clinics: ((clinicsRes.data ?? []) as unknown as ClinicLink[])
      .filter((c) => c.clinics)
      .map((c) => ({ ...c.clinics, schedule_text: c.schedule_text, visit_modes: c.visit_modes, is_primary: c.is_primary })),
    services: (servicesRes.data ?? []).map((s: Service) => ({ ...s, starting_fee: Number(s.starting_fee) })),
    coverage: allCoverage.filter((c) => acceptedIds.has(c.id)),
    allCoverage,
  };
}

/** Open, future slots for a provider between two dates. */
export async function getOpenSlots(providerId: string, from: Date, to: Date): Promise<Slot[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("availability_slots")
    .select("id, starts_at, duration_min, mode, clinic_id")
    .eq("provider_id", providerId)
    .eq("is_booked", false)
    .gt("starts_at", (from > new Date() ? from : new Date()).toISOString())
    .lt("starts_at", to.toISOString())
    .order("starts_at");
  return data ?? [];
}

export async function getLocationCoords(location: string | null) {
  if (!location || !isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("locations").select("lat, lng").eq("name", location).maybeSingle();
  return data as { lat: number; lng: number } | null;
}
