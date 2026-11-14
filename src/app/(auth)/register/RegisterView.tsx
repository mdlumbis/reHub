"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { Field, FormError, MultiSelect, Notice, Select, TextInput, inputClass } from "@/components/ui/form";
import { LOCATIONS, PROFESSIONS, SPECIALIZATIONS, VALID_ID_TYPES } from "@/lib/options";
import type { Role } from "@/lib/types";
import { register, type RegisterState } from "./actions";

const COPY = {
  patient: {
    tag: "Your recovery, connected",
    headline: ["The right care.", "A step closer."],
    body: "Find a rehabilitation team that understands your needs, close to home and within your coverage.",
    steps: ["Tell us a little about yourself", "Find verified care near you", "Book with confidence"],
    eyebrow: "Patient registration",
    title: "Let's get to know you",
    subtitle: "Create your account to find care that fits your needs.",
    footer: "Already have an account? Log in to reHUB.",
  },
  provider: {
    tag: "For care providers",
    headline: ["More connected care.", "A stronger practice."],
    body: "Connect with patients and rehabilitation teams. Manage your practice, referrals and coverage in one trusted place.",
    steps: ["Create your professional account", "Verify your PRC licence and clinic address", "Welcome patients to your practice"],
    eyebrow: "Provider registration",
    title: "Join the care network",
    subtitle: "Start with your professional details. Verification comes next.",
    footer: "Already registered? Log in to your provider workspace.",
  },
};

export function RegisterView({ initialRole }: { initialRole: Role }) {
  const [role, setRole] = useState<Role>(initialRole);
  const c = COPY[role];

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-12 px-6 py-14 lg:grid-cols-2 lg:px-14">
      <section className="hidden lg:block">
        <span className="inline-block rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand uppercase">{c.tag}</span>
        <h1 className="mt-7 text-5xl leading-[1.1] font-medium tracking-tight text-ink">
          {c.headline[0]}
          <br />
          {c.headline[1]}
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">{c.body}</p>
        <ol className="mt-8 max-w-[480px] space-y-6 rounded-2xl bg-brand-soft p-6">
          {c.steps.map((s, i) => (
            <li key={s} className="flex items-center gap-4 text-ink">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  i === 0 ? "bg-brand text-white" : "bg-white text-muted"
                }`}
              >
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-8 flex items-center gap-2 text-sm text-muted">
          <ShieldCheck className="h-5 w-5 text-brand" /> Private by design. Built around your care.
        </p>
      </section>

      <section className="rounded-3xl border border-line bg-white p-8 sm:p-9">
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-[#eef1ef] p-1">
          {(["patient", "provider"] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              onClick={() => setRole(r)}
              className={`h-10 rounded-lg capitalize transition ${
                role === r ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs font-semibold tracking-[0.15em] text-brand uppercase">{c.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{c.title}</h2>
        <p className="mt-3 text-muted">{c.subtitle}</p>

        {/* key resets the form state when switching roles */}
        <RegisterForm key={role} role={role} />

        <p className="mt-8 text-sm text-muted">
          {c.footer.split(/(Log in[^.]*)/)[0]}
          <Link href={`/login?role=${role}`} className="font-medium text-brand hover:underline">
            {c.footer.match(/Log in[^.]*/)?.[0]}
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

function RegisterForm({ role }: { role: Role }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(register, undefined);
  const err = state?.fieldErrors ?? {};
  const val = (k: string) => {
    const x = state?.values?.[k];
    return typeof x === "string" ? x : undefined;
  };

  return (
    <form
      // Submit via onSubmit (not the action prop) so React doesn't clear the form when validation fails.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="mt-8 space-y-6"
      noValidate
    >
      <input type="hidden" name="role" value={role} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="First name" error={err.first_name}>
          <TextInput name="first_name" placeholder="First name" autoComplete="given-name" defaultValue={val("first_name")} invalid={!!err.first_name} />
        </Field>
        <Field label="Middle name">
          <TextInput name="middle_name" placeholder="Optional" autoComplete="additional-name" defaultValue={val("middle_name")} />
        </Field>
        <Field label="Last name" error={err.last_name}>
          <TextInput name="last_name" placeholder="Last name" autoComplete="family-name" defaultValue={val("last_name")} invalid={!!err.last_name} />
        </Field>
      </div>

      {role === "patient" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={err.email}>
              <TextInput name="email" type="email" placeholder="you@example.com" autoComplete="email" defaultValue={val("email")} invalid={!!err.email} />
            </Field>
            <Field label="Contact number" error={err.contact_number}>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">+63 ·</span>
                <input
                  name="contact_number"
                  type="tel"
                  inputMode="numeric"
                  placeholder="9XX XXX XXXX"
                  autoComplete="tel-national"
                  defaultValue={val("contact_number")}
                  aria-invalid={!!err.contact_number || undefined}
                  className={`${inputClass} pl-14`}
                />
              </div>
            </Field>
          </div>

          <Field label="State / Province, City / Municipality" error={err.location}>
            <Select name="location" options={LOCATIONS} placeholder="Select your location" defaultValue={val("location") ?? ""} required invalid={!!err.location} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valid ID type" error={err.valid_id_type}>
              <Select name="valid_id_type" options={VALID_ID_TYPES} placeholder="Select ID type" defaultValue={val("valid_id_type") ?? ""} required invalid={!!err.valid_id_type} />
            </Field>
            <Field label="Valid ID number" error={err.valid_id_number}>
              <TextInput name="valid_id_number" placeholder="Enter ID number" defaultValue={val("valid_id_number")} invalid={!!err.valid_id_number} />
            </Field>
          </div>
        </>
      ) : (
        <>
          <Field label="Email" error={err.email}>
            <TextInput name="email" type="email" placeholder="you@clinic.com" autoComplete="email" defaultValue={val("email")} invalid={!!err.email} />
          </Field>

          <Field label="Profession" error={err.profession}>
            <Select name="profession" options={PROFESSIONS} placeholder="Select your profession" defaultValue={val("profession") ?? ""} required invalid={!!err.profession} />
          </Field>

          <div className="text-sm text-ink">
            <span>Specializations</span>
            <div className="mt-2">
              <MultiSelect
                name="specializations"
                options={SPECIALIZATIONS}
                placeholder="Add your areas of specialization"
                defaultValue={(state?.values?.specializations as string[]) ?? []}
                invalid={!!err.specializations}
              />
            </div>
            {err.specializations && <p className="mt-1.5 text-xs text-red-600">{err.specializations}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fee range · minimum" error={err.fee_min}>
              <PesoInput name="fee_min" defaultValue={val("fee_min")} invalid={!!err.fee_min} />
            </Field>
            <Field label="Fee range · maximum" error={err.fee_max}>
              <PesoInput name="fee_max" defaultValue={val("fee_max")} invalid={!!err.fee_max} />
            </Field>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" error={err.password}>
          <TextInput name="password" type="password" placeholder="At least 8 characters" autoComplete="new-password" invalid={!!err.password} />
        </Field>
        <Field label="Confirm password" error={err.confirm_password}>
          <TextInput name="confirm_password" type="password" placeholder="Re-enter password" autoComplete="new-password" invalid={!!err.confirm_password} />
        </Field>
      </div>

      <Notice>
        {role === "patient"
          ? "Your details help us keep your account secure. Your ID information is never shown on a public profile."
          : "Set individual starting fees per service in your profile. Your profile stays private until your PRC licence and clinic address are verified."}
      </Notice>

      <FormError message={state?.error} />

      <button
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Creating your account…" : (
          <>
            <ArrowRight className="h-5 w-5" /> Continue
          </>
        )}
      </button>
    </form>
  );
}

function PesoInput({ name, defaultValue, invalid }: { name: string; defaultValue?: string; invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">₱</span>
      <input
        name={name}
        type="number"
        min={0}
        step="0.01"
        placeholder="0.00"
        defaultValue={defaultValue}
        aria-invalid={invalid || undefined}
        className={`${inputClass} pl-8`}
      />
    </div>
  );
}
