import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";

/** Minimal header used on role selection, login and registration. */
export function AuthHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-[88px] max-w-7xl items-center justify-between px-6 lg:px-14">
        <Logo />
        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="hidden sm:inline">Here to help at every step.</span>
          <Link href="/help" className="flex items-center gap-1 hover:text-ink">
            Help centre <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
