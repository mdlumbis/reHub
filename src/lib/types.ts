export type Role = "patient" | "provider";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  email: string | null;
};

export function isRole(value: unknown): value is Role {
  return value === "patient" || value === "provider";
}
