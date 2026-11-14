import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile, ProviderDetails } from "@/lib/types";

export type ProviderContext = {
  profile: Profile;
  details: ProviderDetails | null;
  displayName: string;
  initials: string;
};

/** Signed-in provider's profile + professional details for the provider workspace. */
export async function getProviderContext(): Promise<ProviderContext> {
  const profile = (await getCurrentProfile()) ?? {
    // Shown only when Supabase isn't configured yet (local UI work).
    id: "demo",
    role: "provider" as const,
    full_name: "Demo Provider",
    email: null,
    first_name: "Demo",
    last_name: "Provider",
  };

  let details: ProviderDetails | null = null;
  if (isSupabaseConfigured && profile.id !== "demo") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("provider_details")
      .select("profession, specializations, fee_min, fee_max, verification_status")
      .eq("profile_id", profile.id)
      .single();
    details = data;
  }

  const first = profile.first_name ?? profile.full_name?.split(" ")[0] ?? "";
  const last = profile.last_name ?? profile.full_name?.split(" ").slice(-1)[0] ?? "";
  const isPhysiatrist = details?.profession === "Physiatrist";
  const displayName = `${isPhysiatrist ? "Dr. " : ""}${first ? `${first[0]}. ` : ""}${last}`.trim() || "Provider";
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "P";

  return { profile, details, displayName, initials };
}

// ---------------------------------------------------------------------------
// Dashboard data. Appointments and referrals tables don't exist yet, so these
// return empty lists. Replace the bodies once those tables are added.
// ---------------------------------------------------------------------------

export type QueueItem = {
  id: string;
  time: string;
  patientName: string;
  reason: string;
  coverage: string;
  status: "in_room" | "next" | "waiting" | "done";
};

export type ReferralItem = {
  id: string;
  service: string;
  reason: string;
  receivedLabel: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getTodaysQueue(providerId: string): Promise<QueueItem[]> {
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getReferralInbox(providerId: string): Promise<ReferralItem[]> {
  return [];
}
