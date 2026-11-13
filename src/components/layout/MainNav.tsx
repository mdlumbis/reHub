import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/server";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Public/patient top navigation. Shows log in / sign up, or the signed-in user. */
export async function MainNav() {
  const profile = await getCurrentProfile();
  const name = profile?.full_name || profile?.email?.split("@")[0] || "";
  const firstName = name.split(/\s+/)[0];
  const home = profile?.role === "provider" ? "/provider" : "/patient";

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between gap-6 px-6 lg:px-14">
        <Logo />
        <NavLinks />
        {profile ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">Hello, {firstName}</span>
            <Link
              href={home}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand"
              aria-label="My account"
            >
              {initials(name) || "U"}
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-muted hover:text-ink">Log out</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium uppercase text-ink hover:text-brand">
              Log in
            </Link>
            <Link
              href="/get-started?intent=register"
              className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold uppercase text-ink hover:border-brand hover:text-brand"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
