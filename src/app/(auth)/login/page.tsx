import { ShieldCheck } from "lucide-react";
import { isRole } from "@/lib/types";
import { LoginForm } from "./LoginForm";

const COPY = {
  patient: {
    headline: "Recovery starts with the right team",
    body: "Find a rehabilitation team that understands your needs, closer to home, and within your coverage.",
  },
  provider: {
    headline: "Your practice, connected",
    body: "Manage referrals, appointments and patient coordination in one place.",
  },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const role = isRole(params.role) ? params.role : "patient";
  const next = typeof params.next === "string" ? params.next : undefined;
  const copy = COPY[role];

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-12 px-6 py-14 lg:grid-cols-2 lg:px-28">
      <section className="hidden lg:block">
        <span className="inline-block rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand uppercase">
          Care that meets you where you are
        </span>
        <h1 className="mt-7 max-w-md text-5xl leading-[1.1] font-medium tracking-tight text-ink">
          {copy.headline}
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">{copy.body}</p>
        {/* Replace with an illustration or photo */}
        <div className="mt-8 h-[346px] w-full max-w-[480px] rounded-3xl bg-brand-mist" aria-hidden />
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <ShieldCheck className="h-5 w-5 text-brand" /> Private by design. Built around your care.
        </p>
      </section>

      <section className="rounded-3xl border border-line bg-white p-8 sm:p-9">
        <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Welcome to reHUB</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Welcome back</h2>
        <p className="mt-3 text-muted">Log in or register to continue your care journey.</p>
        <LoginForm key={role} initialRole={role} next={next} />
      </section>
    </main>
  );
}
