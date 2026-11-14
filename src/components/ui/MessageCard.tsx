import type { ReactNode } from "react";

/** Centered card for confirmation / status screens in the auth flow. */
export function MessageCard({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-9 text-center">
        <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-lg bg-brand-soft text-brand">{icon}</span>
        <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-brand uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <div className="mt-3 leading-relaxed text-muted">{children}</div>
      </div>
    </main>
  );
}
