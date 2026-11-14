"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ROLE_HOME, isRole, safeNext, type Role } from "@/lib/types";

export type LoginState = { error?: string; email?: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const roleInput = formData.get("role");
  const role: Role = isRole(roleInput) ? roleInput : "patient";

  if (!email || !password) return { error: "Enter your e-mail and password.", email };

  if (!isSupabaseConfigured) {
    return { error: "Supabase isn't set up yet. Add your keys to .env.local (see README).", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return { error: "Please confirm your e-mail first. Check your inbox for the link.", email };
    }
    return { error: "Incorrect e-mail or password.", email };
  }

  // Make sure the account matches the tab the user picked.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();
  const actualRole: Role = isRole(profile?.role)
    ? profile.role
    : isRole(data.user.user_metadata?.role)
      ? data.user.user_metadata.role
      : "patient";

  if (actualRole !== role) {
    await supabase.auth.signOut();
    return {
      error: `This account is registered as a ${actualRole}. Switch to the ${actualRole} tab to log in.`,
      email,
    };
  }

  redirect(safeNext(formData.get("next"), ROLE_HOME[actualRole]));
}
