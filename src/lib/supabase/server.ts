import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Profile } from "@/lib/types";

/** Supabase client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: safe to ignore, proxy.ts refreshes the session.
        }
      },
    },
  });
}

/** Returns the signed-in user's profile, or null. */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, username, first_name, last_name")
    .eq("id", user.id)
    .single();

  return (
    data ?? {
      id: user.id,
      role: (user.user_metadata?.role as Profile["role"]) ?? "patient",
      full_name: (user.user_metadata?.full_name as string) ?? null,
      email: user.email ?? null,
    }
  );
}
