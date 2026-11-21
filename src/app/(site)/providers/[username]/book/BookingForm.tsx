"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, Clock, MapPin } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { Field, FormError, Notice, TextInput, inputClass } from "@/components/ui/form";
import type { CoverageOption, Service } from "@/lib/directory";
import { formatPeso } from "@/lib/format";
import { bookAppointment, type BookingState } from "./actions";

export function BookingForm({
  slotId,
  services,
  coverage,
  summary,
  defaults,
  backHref,
}: {
  slotId: string;
  services: Service[];
  coverage: CoverageOption[];
  summary: { title: string; badge: string; address: string; date: string; time: string; mode: string };
  defaults: { fullName: string; mobile: string };
  backHref: string;
}) {
  const [state, action, pending] = useActionState<BookingState, FormData>(bookAppointment, undefined);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const service = services.find((s) => s.id === serviceId);
  const err = state?.fieldErrors ?? {};

  const label = (c: CoverageOption) =>
    c.kind === "hmo" ? `HMO · ${c.name}` : c.slug === "guarantee-letter" ? "Guarantee letter" : c.name;

  return (
    <form
      // onSubmit + startTransition keeps typed values if validation fails (see CLAUDE.md).
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 grid gap-6 lg:grid-cols-[1fr_412px]"
      noValidate
    >
      <input type="hidden" name="slot_id" value={slotId} />

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">How you&apos;ll pay</h2>
          <p className="mt-1 text-sm text-muted">Only coverage accepted by this provider is shown below.</p>
          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Radio value="self" label="Self-pay" defaultChecked />
            {coverage.map((c) => (
              <Radio key={c.id} value={String(c.id)} label={label(c)} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">Your details</h2>
          <p className="mt-1 text-sm text-muted">The clinic will use these details to confirm your visit.</p>

          <div className="mt-5 flex flex-col gap-5">
            <Field label="Service" error={err.service_id}>
              <select
                name="service_id"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.duration_min} min · from {formatPeso(s.starting_fee)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={err.full_name}>
                <TextInput name="full_name" defaultValue={defaults.fullName} autoComplete="name" invalid={!!err.full_name} />
              </Field>
              <Field label="Mobile number" error={err.mobile}>
                <TextInput
                  name="mobile"
                  type="tel"
                  defaultValue={defaults.mobile}
                  placeholder="+63 9XX XXX XXXX"
                  autoComplete="tel"
                  invalid={!!err.mobile}
                />
              </Field>
            </div>
            <Field label="Reason for visit" hint="(optional)" error={err.reason}>
              <textarea
                name="reason"
                rows={3}
                placeholder="e.g. Initial assessment for low back pain."
                className={`${inputClass} h-auto py-3`}
              />
            </Field>
          </div>
        </section>

        {service && (
          <Notice>
            {formatPeso(service.starting_fee)} is a starting fee, not the final bill. The amount you pay is set on the
            day of treatment and depends on the management given.
          </Notice>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-line bg-white p-6 lg:sticky lg:top-6">
        <span className="inline-block rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand uppercase">
          {summary.badge}
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{summary.title}</h2>
        <p className="mt-2 text-sm text-muted">{summary.address}</p>

        <dl className="mt-6 flex flex-col gap-4">
          <Row icon={<CalendarDays className="h-5 w-5" />} label="Date" value={summary.date} />
          <Row icon={<Clock className="h-5 w-5" />} label="Time" value={summary.time} />
          <Row icon={<MapPin className="h-5 w-5" />} label="Mode" value={summary.mode} />
          <Row
            icon={<ClipboardList className="h-5 w-5" />}
            label="Service"
            value={service ? `${service.name} · ${service.duration_min} min` : "Choose a service"}
          />
        </dl>

        <div className="mt-6 border-t border-line pt-6">
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Starting fee</p>
          <p className="mt-2 text-4xl font-medium text-ink">
            {service ? formatPeso(service.starting_fee) : "—"}
            <span className="ml-2 text-sm text-muted">onwards</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Final amount is set on the day of treatment and depends on the management given.
          </p>
        </div>

        <div className="mt-6">
          <FormError message={state?.error} />
        </div>

        <button
          disabled={pending || !service}
          className="mt-4 h-12 w-full rounded-lg bg-brand font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {pending ? "Booking…" : "Confirm booking"}
        </button>
        <Link
          href={backHref}
          className="mt-3 flex h-12 items-center justify-center rounded-lg border border-line font-semibold text-ink hover:border-brand"
        >
          Back
        </Link>
        <p className="mt-4 text-xs text-muted">Your appointment details will be shared securely with the provider.</p>
      </aside>
    </form>
  );
}

function Radio({ value, label, defaultChecked }: { value: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
      <input type="radio" name="payment" value={value} defaultChecked={defaultChecked} className="h-4 w-4 accent-brand" />
      {label}
    </label>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
      </div>
    </div>
  );
}
