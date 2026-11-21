import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck2, CalendarDays, CalendarX2, ClipboardList, Clock, CreditCard, MapPin, Phone } from "lucide-react";
import { Notice } from "@/components/ui/form";
import { CANCEL_REASON_LABEL, PATIENT_CANCEL_CUTOFF_HOURS, patientCanCancelOnline } from "@/lib/appointments";
import { formatLongDate, formatPeso, formatSlotLabel, formatTime, isPast, VISIT_MODE_LABEL, providerName } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { CancelDialog } from "./CancelDialog";

export const metadata = { title: "Your appointment · reHUB" };

type Appointment = {
  id: string;
  provider_id: string;
  starts_at: string;
  duration_min: number;
  mode: string;
  status: string;
  quoted_fee: number | null;
  patient_full_name: string;
  patient_mobile: string;
  reason: string | null;
  cancelled_at: string | null;
  cancelled_by: "patient" | "provider" | null;
  cancel_reason: string | null;
  cancel_note: string | null;
  services: { name: string } | null;
  clinics: { name: string; street_address: string | null; location: string | null; phone: string | null } | null;
  coverage_options: { name: string } | null;
};

/** Booking confirmation and appointment details. Only the patient who booked can see it (RLS). */
export default async function AppointmentPage({ params, searchParams }: PageProps<"/patient/appointments/[id]">) {
  const { id } = await params;
  const { new: isNew, cancelled: justCancelled } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("appointments")
    .select(
      "id, provider_id, starts_at, duration_min, mode, status, quoted_fee, patient_full_name, patient_mobile, reason, cancelled_at, cancelled_by, cancel_reason, cancel_note, services(name), clinics(name, street_address, location, phone), coverage_options(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const a = data as unknown as Appointment;

  const { data: provider } = await supabase
    .from("public_providers")
    .select("username, first_name, last_name, profession")
    .eq("id", a.provider_id)
    .maybeSingle();

  const cancelled = a.status === "cancelled";
  const upcoming = ["booked", "checked_in"].includes(a.status) && !isPast(a.starts_at);
  const canCancelOnline = upcoming && patientCanCancelOnline(a.starts_at, a.status);
  const providerLabel = provider ? providerName(provider) : "Your provider";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {isNew && !cancelled && !justCancelled ? (
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CalendarCheck2 className="h-7 w-7" />
          </span>
          <p className="mt-5 text-xs font-semibold tracking-[0.15em] text-brand uppercase">Booking confirmed</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">You&apos;re booked in</h1>
          <p className="mt-2 text-muted">The clinic will contact you at {a.patient_mobile} if anything changes.</p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Appointment</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {cancelled ? "This appointment was cancelled" : "Your appointment"}
          </h1>
        </>
      )}

      {cancelled && (
        <section className="mt-6 flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <CalendarX2 className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div className="text-sm">
            <p className="font-semibold text-ink">
              {justCancelled ? "Your appointment has been cancelled" : "Cancelled"}
              {a.cancelled_by === "provider" ? " by the provider" : ""}
            </p>
            <p className="mt-1 text-body">
              {a.cancel_reason && <>Reason: {CANCEL_REASON_LABEL[a.cancel_reason] ?? a.cancel_reason}. </>}
              {a.cancel_note && <>&ldquo;{a.cancel_note}&rdquo; </>}
            </p>
            {a.cancelled_at && <p className="mt-1 text-xs text-muted">Cancelled {formatSlotLabel(a.cancelled_at)}</p>}
            <p className="mt-2 text-body">The time slot has been released. You can book a new time whenever you&apos;re ready.</p>
          </div>
        </section>
      )}

      <section className={`mt-8 rounded-2xl border border-line bg-white p-6 ${cancelled ? "opacity-70" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              {providerLabel}
            </h2>
            {provider && <p className="text-sm text-muted">{provider.profession}</p>}
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs uppercase ${cancelled ? "bg-red-50 text-red-700" : "bg-brand-soft text-brand"}`}
          >
            {a.status.replace("_", " ")}
          </span>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <Row icon={<CalendarDays className="h-5 w-5" />} label="Date" value={formatLongDate(a.starts_at)} />
          <Row icon={<Clock className="h-5 w-5" />} label="Time" value={formatTime(a.starts_at)} />
          <Row
            icon={<MapPin className="h-5 w-5" />}
            label={VISIT_MODE_LABEL[a.mode] ?? a.mode}
            value={a.clinics ? `${a.clinics.name}, ${[a.clinics.street_address, a.clinics.location].filter(Boolean).join(", ")}` : "—"}
          />
          <Row
            icon={<ClipboardList className="h-5 w-5" />}
            label="Service"
            value={`${a.services?.name ?? "—"} · ${a.duration_min} min`}
          />
          <Row
            icon={<CreditCard className="h-5 w-5" />}
            label="Payment"
            value={`${a.coverage_options?.name ?? "Self-pay"}${a.quoted_fee !== null ? ` · from ${formatPeso(a.quoted_fee)}` : ""}`}
          />
        </dl>
        {a.reason && (
          <p className="mt-5 rounded-lg bg-canvas px-4 py-3 text-sm text-body">
            <span className="font-medium text-ink">Reason: </span>
            {a.reason}
          </p>
        )}
      </section>

      {upcoming && !canCancelOnline && (
        <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-ink">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            Online cancellation closes {PATIENT_CANCEL_CUTOFF_HOURS} hours before your appointment. To cancel or
            reschedule now, please call {a.clinics?.name ?? "the clinic"}
            {a.clinics?.phone ? (
              <>
                {" "}at{" "}
                <a href={`tel:${a.clinics.phone.replace(/\s/g, "")}`} className="font-semibold text-brand hover:underline">
                  {a.clinics.phone}
                </a>
              </>
            ) : null}
            .
          </p>
        </div>
      )}

      {!cancelled && (
        <div className="mt-6">
          <Notice>
            {a.quoted_fee !== null ? `${formatPeso(a.quoted_fee)} is a starting fee. ` : ""}The final amount is set on the
            day of treatment and depends on the management given.
          </Notice>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {provider && cancelled && (
          <Link
            href={`/providers/${provider.username}#availability`}
            className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Book another time
          </Link>
        )}
        {provider && !cancelled && (
          <Link
            href={`/providers/${provider.username}`}
            className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-brand"
          >
            View provider
          </Link>
        )}
        <Link href="/search" className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-semibold text-ink hover:border-brand">
          Find more care
        </Link>
        {canCancelOnline && (
          <div className="ml-auto">
            <CancelDialog
              appointmentId={a.id}
              summary={{
                provider: providerLabel,
                when: `${formatLongDate(a.starts_at)}, ${formatTime(a.starts_at)}`,
                service: `${a.services?.name ?? "Appointment"} · ${a.duration_min} min`,
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 font-medium text-ink">{value}</dd>
      </div>
    </div>
  );
}
