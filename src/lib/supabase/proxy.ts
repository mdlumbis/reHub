import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/** Route prefixes that require login, and the role allowed in each. */
const PROTECTED: { prefix: string; role: "patient" | "provider" }[] = [
  { prefix: "/patient", role: "patient" },
  { prefix: "/provider", role: "provider" },
];

/** Refreshes the Supabase session cookie and guards protected routes. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not put code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const guard = PROTECTED.find((p) => path === p.prefix || path.startsWith(`${p.prefix}/`));

  if (guard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?role=${guard.role}&next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }

  if (guard && user) {
    const role = user.user_metadata?.role;
    if (role && role !== guard.role) {
      const url = request.nextUrl.clone();
      url.pathname = role === "provider" ? "/provider" : "/patient";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
