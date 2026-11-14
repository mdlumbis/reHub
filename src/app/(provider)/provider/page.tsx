import Link from "next/link";
import { CalendarClock, FileInput, Plus, ShieldAlert, Users } from "lucide-react";
import { Notice } from "@/components/ui/form";
import { getProviderContext, getReferralInbox, getTodaysQueue, type QueueItem } from "@/lib/provider";

const STATUS: Record<QueueItem["status"], { label: string; className: string }> = {
  in_room: { label: "In room", className: "bg-brand-soft text-brand" },
  next: { label: "Next", className: "bg-brand-soft text-brand" },
  waiting: { label: "Waiting", className: "bg-canvas text-muted" },
  done: { label: "Done", className: "bg-canvas text-muted" },
};

export default async function ProviderDashboardPage() {
  const { profile, details } = await getProviderContext();
  const [queue, referrals] = await Promise.all([getTodaysQueue(profile.id), getReferralInbox(profile.id)]);

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Manila",
  }).format(new Date());

  const seen = queue.filter((q) => q.status === "done").length;
  const inRoom = queue.filter((q) => q.status === "in_room").length;
  const waiting = queue.filter((q) => q.status === "waiting" || q.status === "next").length;

  return (
    <main className="w-full max-w-[1200px] px-6 py-10 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Your practice, at a glance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{today}</h1>
          <p className="mt-2 text-muted">
            {details?.profession ?? "Provider"} ·{" "}
            <Link href="/provider/profile" className="text-brand hover:underline">
              Add your clinic and hours
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/provider/referrals"
            className="flex h-12 items-center rounded-lg border border-line bg-white px-5 font-semibold text-ink hover:border-brand"
          >
            Referral inbox
          </Link>
          <Link
            href="/provider/referrals/new"
            className="flex h-12 items-center gap-2 rounded-lg bg-brand px-5 font-semibold text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" /> Send a referral
          </Link>
        </div>
      </div>

      {/* Verification banner */}
      {details?.verification_status !== "verified" && (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold text-ink">Your profile is not public yet</p>
              <p className="mt-1 text-sm text-body">
                Patients can find you once your PRC licence and clinic address are verified.
              </p>
            </div>
          </div>
          <Link
            href="/provider/profile"
            className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-amber-200 hover:ring-amber-300"
          >
            Complete verification
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <StatCard
          label="In clinic today"
          value={queue.length}
          detail={`${seen} seen · ${inRoom} in room · ${waiting} waiting`}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="New referrals in"
          value={referrals.length}
          detail={referrals.length ? "Review them in your inbox" : "No new referrals"}
          icon={<FileInput className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_304px]">
        {/* Queue */}
        <section className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Today&apos;s queue</h2>
              <p className="mt-1 text-sm text-muted">Live from the clinic front desk.</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Live
            </span>
          </div>

          {queue.length ? (
            <ul className="mt-4 divide-y divide-line">
              {queue.map((q) => (
                <li key={q.id} className="flex items-center gap-6 py-5">
                  <span className="w-20 shrink-0 text-sm text-body">{q.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{q.patientName}</p>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {q.reason} · {q.coverage}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs uppercase ${STATUS[q.status].className}`}>
                    {STATUS[q.status].label}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<CalendarClock className="h-6 w-6" />}
              title="No appointments today"
              body="Booked appointments will appear here as patients schedule with you."
            />
          )}
        </section>

        {/* Referral inbox + note */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h2 className="text-xl font-semibold text-ink">Referral inbox</h2>
            <p className="mt-1 text-sm text-muted">
              {referrals.length ? `${referrals.length} referrals need your review` : "You're all caught up"}
            </p>
            {referrals.length > 0 && (
              <ul className="mt-4 divide-y divide-line">
                {referrals.slice(0, 3).map((r) => (
                  <li key={r.id} className="py-4">
                    <p className="font-semibold text-ink">{r.service}</p>
                    <p className="mt-1 text-sm text-muted">{r.reason}</p>
                    <p className="mt-2 text-xs text-brand">{r.receivedLabel}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/provider/referrals"
              className="mt-5 flex h-12 items-center justify-center rounded-lg border border-line font-semibold text-ink hover:border-brand"
            >
              Open inbox
            </Link>
          </section>
          <Notice>
            A complete referral keeps the next provider informed. All seven clinical fields travel with your patient.
          </Notice>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="flex items-start justify-between">
        <p className="text-xs tracking-wide text-ink uppercase">{label}</p>
        <span className="text-brand">{icon}</span>
      </div>
      <p className="mt-4 text-4xl font-medium text-brand">{value}</p>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </div>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">{icon}</span>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
    </div>
  );
}
