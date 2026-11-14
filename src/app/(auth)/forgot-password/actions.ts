"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOrigin } from "@/lib/site-url";
import { ROLE_HOME, isRole } from "@/lib/types";

export type PasswordState = { error?: string; sent?: boolean; email?: string } | undefined;

export async function requestReset(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid e-mail.", email };
  if (!isSupabaseConfigured) return { error: "Supabase isn't set up yet.", email };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  if (error && error.status === 429) return { error: "Too many requests. Wait a minute and try again.", email };

  // Always report success so the form doesn't reveal which e-mails have accounts.
  return { sent: true, email };
}

export async function updatePassword(_prev: PasswordState, fd: FormData): Promise<PasswordState> {
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm_password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password different from your old one." };
    return { error: "Your reset link has expired. Request a new one." };
  }

  const role = data.user?.user_metadata?.role;
  redirect(ROLE_HOME[isRole(role) ? role : "patient"]);
}
