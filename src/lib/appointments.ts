/** Shared appointment rules and labels. Keep in sync with supabase/migrations/0005_cancellation.sql. */

/** Patients can cancel online until this many hours before the start. */
export const PATIENT_CANCEL_CUTOFF_HOURS = 2;

export const CANCEL_REASONS = [
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "feeling_better", label: "I'm feeling better" },
  { value: "found_another_provider", label: "Found another provider" },
  { value: "cost_or_coverage", label: "Cost or coverage issue" },
  { value: "booked_by_mistake", label: "Booked by mistake" },
  { value: "other", label: "Other" },
] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number]["value"] | "provider_unavailable";

export const CANCEL_REASON_LABEL: Record<string, string> = {
  ...Object.fromEntries(CANCEL_REASONS.map((r) => [r.value, r.label])),
  feeling_better: "Feeling better",
  provider_unavailable: "Provider unavailable",
};

export function isCancelReason(v: unknown): v is CancelReason {
  return typeof v === "string" && v in CANCEL_REASON_LABEL;
}

/** Can a patient still cancel this online? */
export function patientCanCancelOnline(startsAt: string, status: string) {
  const msLeft = Date.parse(startsAt) - Date.now();
  return ["booked", "checked_in"].includes(status) && msLeft > PATIENT_CANCEL_CUTOFF_HOURS * 3_600_000;
}
