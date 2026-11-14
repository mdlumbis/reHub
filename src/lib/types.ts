export type Role = "patient" | "provider";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  email: string | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

export type ProviderDetails = {
  profession: string;
  specializations: string[];
  fee_min: number | null;
  fee_max: number | null;
  verification_status: "pending" | "verified" | "rejected";
};

export function isRole(value: unknown): value is Role {
  return value === "patient" || value === "provider";
}

/** Where each role lands after logging in. */
export const ROLE_HOME: Record<Role, string> = {
  patient: "/",
  provider: "/provider",
};

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback: string): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
