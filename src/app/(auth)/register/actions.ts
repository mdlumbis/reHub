"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOrigin } from "@/lib/site-url";
import { LOCATIONS, PROFESSIONS, SPECIALIZATIONS, VALID_ID_TYPES } from "@/lib/options";
import { ROLE_HOME, isRole, type Role } from "@/lib/types";

export type RegisterState =
  | {
      error?: string;
      fieldErrors?: Record<string, string>;
      values?: Record<string, string | string[]>;
    }
  | undefined;

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function register(_prev: RegisterState, fd: FormData): Promise<RegisterState> {
  const role: Role = isRole(fd.get("role")) ? (fd.get("role") as Role) : "patient";

  const v = {
    role,
    username: text(fd, "username").toLowerCase(),
    first_name: text(fd, "first_name"),
    middle_name: text(fd, "middle_name"),
    last_name: text(fd, "last_name"),
    email: text(fd, "email").toLowerCase(),
    contact_number: text(fd, "contact_number").replace(/\s+/g, ""),
    location: text(fd, "location"),
    valid_id_type: text(fd, "valid_id_type"),
    valid_id_number: text(fd, "valid_id_number"),
    profession: text(fd, "profession"),
    specializations: fd.getAll("specializations").map(String),
    fee_min: text(fd, "fee_min"),
    fee_max: text(fd, "fee_max"),
  };
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm_password") ?? "");

  // ---- Validation -----------------------------------------------------------
  const e: Record<string, string> = {};
  if (!/^[a-z0-9._]{3,30}$/.test(v.username))
    e.username = "3–30 characters: lowercase letters, numbers, dots or underscores.";
  if (!v.first_name) e.first_name = "Required.";
  if (!v.last_name) e.last_name = "Required.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter a valid e-mail.";
  if (password.length < 8) e.password = "At least 8 characters.";
  else if (password !== confirm) e.confirm_password = "Passwords don't match.";

  if (role === "patient") {
    if (!/^9\d{9}$/.test(v.contact_number)) e.contact_number = "Enter 10 digits starting with 9, e.g. 917 123 4567.";
    if (!LOCATIONS.includes(v.location)) e.location = "Select your location.";
    if (!VALID_ID_TYPES.includes(v.valid_id_type)) e.valid_id_type = "Select an ID type.";
    if (v.valid_id_number.length < 4) e.valid_id_number = "Enter your ID number.";
  } else {
    if (!PROFESSIONS.includes(v.profession)) e.profession = "Select your profession.";
    if (!v.specializations.length || v.specializations.some((s) => !SPECIALIZATIONS.includes(s)))
      e.specializations = "Select at least one.";
    const min = Number(v.fee_min);
    const max = Number(v.fee_max);
    if (v.fee_min && (isNaN(min) || min < 0)) e.fee_min = "Enter a valid amount.";
    if (v.fee_max && (isNaN(max) || max < 0)) e.fee_max = "Enter a valid amount.";
    if (v.fee_min && v.fee_max && min > max) e.fee_max = "Must be at least the minimum.";
  }

  if (Object.keys(e).length) return { fieldErrors: e, values: v };

  if (!isSupabaseConfigured) {
    return { error: "Supabase isn't set up yet. Add your keys to .env.local (see README).", values: v };
  }

  // ---- Sign up --------------------------------------------------------------
  const supabase = await createClient();

  const { data: available } = await supabase.rpc("is_username_available", { p_username: v.username });
  if (available === false) {
    return { fieldErrors: { username: "That user ID is taken. Try another." }, values: v };
  }

  const full_name = [v.first_name, v.middle_name, v.last_name].filter(Boolean).join(" ");
  const metadata =
    role === "patient"
      ? {
          role,
          full_name,
          username: v.username,
          first_name: v.first_name,
          middle_name: v.middle_name,
          last_name: v.last_name,
          contact_number: `+63${v.contact_number}`,
          location: v.location,
          valid_id_type: v.valid_id_type,
          valid_id_number: v.valid_id_number,
        }
      : {
          role,
          full_name,
          username: v.username,
          first_name: v.first_name,
          middle_name: v.middle_name,
          last_name: v.last_name,
          profession: v.profession,
          specializations: v.specializations,
          fee_min: v.fee_min,
          fee_max: v.fee_max,
        };

  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${origin}/auth/confirm?next=${ROLE_HOME[role]}`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { fieldErrors: { email: "An account with this e-mail already exists. Log in instead." }, values: v };
    }
    if (error.code === "weak_password") return { fieldErrors: { password: error.message }, values: v };
    console.error("signUp failed", error);
    return { error: "We couldn't create your account. Please try again.", values: v };
  }

  // Supabase returns a fake user with no identities when the e-mail is already taken (confirmations on).
  if (data.user && data.user.identities?.length === 0) {
    return { fieldErrors: { email: "An account with this e-mail already exists. Log in instead." }, values: v };
  }

  // E-mail confirmation off: user is logged in right away.
  if (data.session) redirect(ROLE_HOME[role]);

  redirect(`/register/check-email?email=${encodeURIComponent(v.email)}`);
}
