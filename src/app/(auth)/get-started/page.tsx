import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, Stethoscope } from "lucide-react";

const ROLES = [
  {
    role: "patient",
    title: "I’m a patient",
    body: "Find rehabilitation care, connect with the right team, and take your next step in recovery.",
    cta: "Continue as a patient",
    Icon: HeartHandshake,
  },
  {
    role: "provider",
    title: "I’m a provider",
    body: "Manage your practice, connect with patients, and coordinate rehabilitation care.",
    cta: "Continue as a provider",
    Icon: Stethoscope,
  },
] as const;

export default async function RoleSelectionPage({ searchParams }: PageProps<"/get-started">) {
  const { intent } = await searchParams;
  const base = intent === "register" ? "/register" : "/login";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Welcome to reHUB</p>
      <h1 className="mt-4 text-center text-4xl font-semibold tracking-tight text-ink">
        How can we help you today?
      </h1>
      <p className="mt-4 text-center text-lg text-muted">Choose the path that’s right for you.</p>

      <div className="mt-10 grid w-full max-w-[920px] gap-6 md:grid-cols-2">
        {ROLES.map(({ role, title, body, cta, Icon }) => (
          <div key={role} className="flex flex-col rounded-2xl border border-line bg-white p-8">
            <span className="flex h-13 w-13 items-center justify-center rounded-lg bg-brand-soft">
              <Icon className="h-6 w-6 text-brand" strokeWidth={1.75} />
            </span>
            <h2 className="mt-7 text-[28px] font-semibold tracking-tight text-ink">{title}</h2>
            <p className="mt-4 leading-relaxed text-muted">{body}</p>
            <Link
              href={`${base}?role=${role}`}
              className="mt-7 flex h-12 items-center justify-between rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-hover"
            >
              {cta} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-2 text-sm text-muted">
        <ShieldCheck className="h-5 w-5 text-brand" /> Private by design. Built around your care.
      </p>
    </main>
  );
}
