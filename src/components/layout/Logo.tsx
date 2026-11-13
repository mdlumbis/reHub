import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="reHUB home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold tracking-tight text-white">
        rH
      </span>
      <span className="text-2xl tracking-tight text-ink">reHUB</span>
    </Link>
  );
}
