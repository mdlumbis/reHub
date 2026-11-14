"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
import { Logo } from "./Logo";

const SECTIONS: { title?: string; links: { href: string; label: string; badge?: "inbox" }[] }[] = [
  {
    links: [
      { href: "/provider", label: "Dashboard" },
      { href: "/provider/schedule", label: "Schedule" },
      { href: "/provider/patients", label: "Patients" },
    ],
  },
  {
    title: "Referrals",
    links: [
      { href: "/provider/referrals/new", label: "Send a referral" },
      { href: "/provider/referrals", label: "Inbox", badge: "inbox" },
    ],
  },
  {
    title: "Practice",
    links: [
      { href: "/provider/profile", label: "My profile" },
      { href: "/provider/fees-coverage", label: "Fees & coverage" },
    ],
  },
];

export function ProviderSidebar({
  displayName,
  initials,
  profession,
  inboxCount,
}: {
  displayName: string;
  initials: string;
  profession: string;
  inboxCount: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/provider" || href === "/provider/referrals" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-white px-6 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-[236px] lg:border-r lg:border-b-0">
      <Logo />

      <div className="mt-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
          {initials}
        </span>
        <p className="mt-3 font-semibold text-ink">{displayName}</p>
        <p className="text-sm text-muted">{profession}</p>
      </div>

      <nav className="mt-8 flex flex-col gap-6">
        {SECTIONS.map((s, i) => (
          <div key={i}>
            {s.title && <p className="mb-2 text-[11px] font-medium tracking-wide text-muted uppercase">{s.title}</p>}
            <ul className="flex flex-col gap-1">
              {s.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                      isActive(l.href) ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"
                    }`}
                  >
                    {l.label}
                    {l.badge && inboxCount > 0 && <span className="text-xs text-brand">{inboxCount}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-2 text-xs text-muted lg:mt-auto">
        <span>Provider workspace</span>
        <Link href="/help" className="flex items-center gap-1 hover:text-ink">
          Help &amp; support <ArrowUpRight className="h-3 w-3" />
        </Link>
        <form action="/auth/signout" method="post">
          <button className="mt-2 flex items-center gap-1.5 hover:text-ink">
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
