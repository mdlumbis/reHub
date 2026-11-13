import Link from "next/link";

/** Placeholder for screens not built yet. Replace the page that uses it. */
export function ComingSoon({ title, owner }: { title: string; owner?: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Coming soon</p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-muted">
        This screen hasn&apos;t been built yet.{owner ? ` Owner: ${owner}.` : ""}
      </p>
      <Link href="/" className="mt-8 text-sm font-medium text-brand hover:underline">
        Back to home
      </Link>
    </main>
  );
}
