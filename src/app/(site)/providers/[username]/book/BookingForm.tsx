"use client";

import Link from "next/link";
import { CalendarDays, ClipboardList, Clock, MapPin, Video, House } from "lucide-react";
import { startTransition, useActionState, useEffect, useMemo, useState, type ReactNode } from "react";
import { Field, FormError, Notice, TextInput, inputClass } from "@/components/ui/form";
import type { CoverageOption, Service, Slot } from "@/lib/directory";
import { TZ, VISIT_MODE_LABEL, formatLongDate, formatPeso, formatTime, manilaDateKey } from "@/lib/format";
import { bookAppointment, type BookingState } from "./actions";

type Editing = "date" | "time" | "mode" | "service" | null;

const MODE_NOTE: Record<string, string> = {
  home: "The provider will call to confirm your home address.",
  online: "You'll get a video call link before your appointment.",
};

/**
 * Booking form. The summary card is editable, but every option comes from THIS provider only:
 * their open slots, the visit modes they offer, and their services. The database re-checks all three.
 */
export function BookingForm({
  initialSlotId,
  slots,
  modes,
  services,
  coverage,
  summary,
  defaults,
  backHref,
}: {
  initialSlotId: string;
  slots: Slot[];
  modes: string[];
  services: Service[];
  coverage: CoverageOption[];
  summary: { title: string; badge: string; address: string };
  defaults: { fullName: string; mobile: string };
  backHref: string;
}) {
  const [state, action, pending] = useActionState<BookingState, FormData>(bookAppointment, undefined);
  const [slotId, setSlotId] = useState(initialSlotId);
  const slot = slots.find((s) => s.id === slotId) ?? slots[0];
  const [mode, setMode] = useState(modes.includes(slot?.mode) ? slot.mode : modes[0]);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [editing, setEditing] = useState<Editing>(null);
  const service = services.find((s) => s.id === serviceId);
  const err = state?.fieldErrors ?? {};

  // Slots grouped by Manila date: { "2026-11-24": [slot, ...] }
  const byDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) {
      const k = manilaDateKey(new Date(s.starts_at));
      m.set(k, [...(m.get(k) ?? []), s]);
    }
    return m;
  }, [slots]);
  const dayKey = slot ? manilaDateKey(new Date(slot.starts_at)) : "";

  // Keep the URL in sync so a refresh keeps the chosen time.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("slot") !== slotId) {
      url.searchParams.set("slot", slotId);
      window.history.replaceState(null, "", url);
    }
  }, [slotId]);

  function pickDay(key: string) {
    const daySlots = byDay.get(key) ?? [];
    // Keep the same time of day if it's open that day, otherwise the earliest.
    const sameTime = daySlots.find((s) => formatTime(s.starts_at) === formatTime(slot.starts_at));
    setSlotId((sameTime ?? daySlots[0]).id);
    setEditing("time");
  }

  const toggle = (e: Editing) => setEditing((cur) => (cur === e ? null : e));
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
      <input type="hidden" name="slot_id" value={slot?.id ?? ""} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="service_id" value={serviceId} />

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">How you&apos;ll pay</h2>
          <p className="mt-1 text-sm text-muted">Only coverage accepted by this provider is shown below.</p>
          <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Radio name="payment" value="self" label="Self-pay" defaultChecked />
            {coverage.map((c) => (
              <Radio key={c.id} name="payment" value={String(c.id)} label={label(c)} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-xl font-semibold text-ink">Your details</h2>
          <p className="mt-1 text-sm text-muted">The clinic will use these details to confirm your visit.</p>
          <div className="mt-5 flex flex-col gap-5">
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
        <p className="mt-2 text-sm text-muted">
          {mode === "in_person" ? summary.address : mode === "online" ? "Video consultation" : "Home visit"}
        </p>

        <dl className="mt-6 flex flex-col gap-4">
          {/* Date */}
          <Row
            icon={<CalendarDays className="h-5 w-5" />}
            label="Date"
            value={slot ? formatLongDate(slot.starts_at) : "Choose a date"}
            open={editing === "date"}
            onToggle={() => toggle("date")}
          >
            <div className="grid grid-cols-4 gap-1.5">
              {[...byDay.keys()].map((k) => {
                const d = new Date(byDay.get(k)![0].starts_at);
                return (
                  <Chip key={k} selected={k === dayKey} onClick={() => pickDay(k)}>
                    <span className="block text-[10px] text-muted uppercase">
                      {new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" }).format(d)}
                    </span>
                    {new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short" }).format(d)}
                  </Chip>
                );
              })}
            </div>
          </Row>

          {/* Time */}
          <Row
            icon={<Clock className="h-5 w-5" />}
            label="Time"
            value={slot ? formatTime(slot.starts_at) : "Choose a time"}
            open={editing === "time"}
            onToggle={() => toggle("time")}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {(byDay.get(dayKey) ?? []).map((s) => (
                <Chip
                  key={s.id}
                  selected={s.id === slotId}
                  onClick={() => {
                    setSlotId(s.id);
                    setEditing(null);
                  }}
                >
                  {formatTime(s.starts_at)}
                </Chip>
              ))}
            </div>
          </Row>

          {/* Mode */}
          <Row
            icon={mode === "online" ? <Video className="h-5 w-5" /> : mode === "home" ? <House className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
            label="Mode"
            value={VISIT_MODE_LABEL[mode] === "Home visits" ? "Home visit" : VISIT_MODE_LABEL[mode]}
            note={MODE_NOTE[mode]}
            open={editing === "mode"}
            onToggle={modes.length > 1 ? () => toggle("mode") : undefined}
          >
            <div className="flex flex-col gap-1.5">
              {modes.map((m) => (
                <Chip
                  key={m}
                  selected={m === mode}
                  onClick={() => {
                    setMode(m);
                    setEditing(null);
                  }}
                  align="left"
                >
                  {m === "home" ? "Home visit" : VISIT_MODE_LABEL[m]}
                </Chip>
              ))}
            </div>
          </Row>

          {/* Service */}
          <Row
            icon={<ClipboardList className="h-5 w-5" />}
            label="Service"
            value={service ? `${service.name} · ${service.duration_min} min` : "Choose a service"}
            open={editing === "service"}
            onToggle={services.length > 1 ? () => toggle("service") : undefined}
          >
            <div className="flex flex-col gap-1.5">
              {services.map((s) => (
                <Chip
                  key={s.id}
                  selected={s.id === serviceId}
                  onClick={() => {
                    setServiceId(s.id);
                    setEditing(null);
                  }}
                  align="left"
                >
                  <span className="flex w-full items-center justify-between gap-3">
                    <span>
                      {s.name}
                      <span className="ml-1 text-xs text-muted">· {s.duration_min} min</span>
                    </span>
                    <span className="text-xs font-semibold">{formatPeso(s.starting_fee)}</span>
                  </span>
                </Chip>
              ))}
            </div>
          </Row>
        </dl>
        {(err.slot_id || err.mode || err.service_id) && (
          <p className="mt-3 text-xs text-red-600">{err.slot_id ?? err.mode ?? err.service_id}</p>
        )}

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
          disabled={pending || !service || !slot}
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

function Row({
  icon,
  label,
  value,
  note,
  open,
  onToggle,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  note?: string;
  open: boolean;
  /** Omit when there's only one option (nothing to change). */
  onToggle?: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex gap-3">
        <span className="mt-0.5 text-brand">{icon}</span>
        <div className="min-w-0 flex-1">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
          {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="h-fit shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-soft"
          >
            {open ? "Done" : "Change"}
          </button>
        )}
      </div>
      {open && <div className="mt-3 ml-8 rounded-lg bg-canvas p-2">{children}</div>}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  align = "center",
  children,
}: {
  selected: boolean;
  onClick: () => void;
  align?: "center" | "left";
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-md border px-2 py-2 text-sm transition ${align === "left" ? "text-left" : "text-center"} ${
        selected ? "border-brand bg-brand text-white [&_span]:text-white/80" : "border-line bg-white text-ink hover:border-brand"
      }`}
    >
      {children}
    </button>
  );
}

function Radio({ name, value, label, defaultChecked }: { name: string; value: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ink">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="h-4 w-4 accent-brand" />
      {label}
    </label>
  );
}
