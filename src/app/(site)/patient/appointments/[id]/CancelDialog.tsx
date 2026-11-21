"use client";

import { AlertTriangle, XCircle } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { FormError, inputClass } from "@/components/ui/form";
import { CANCEL_REASONS, PATIENT_CANCEL_CUTOFF_HOURS } from "@/lib/appointments";
import { cancelAppointment, type CancelState } from "./actions";

/** "Cancel appointment" button → confirmation dialog with reason, optional note, and policy. */
export function CancelDialog({
  appointmentId,
  summary,
}: {
  appointmentId: string;
  summary: { provider: string; when: string; service: string };
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<string>("");
  const [state, action, pending] = useActionState<CancelState, FormData>(cancelAppointment, undefined);

  const close = () => {
    dialogRef.current?.close();
    setReason("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        <XCircle className="h-4 w-4" /> Cancel appointment
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="cancel-title"
        // Click on the dimmed backdrop closes it.
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[min(520px,calc(100vw-2rem))] rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-ink/40"
      >
        <form action={action} className="p-6 sm:p-7">
          <input type="hidden" name="id" value={appointmentId} />

          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 id="cancel-title" className="text-xl font-semibold text-ink">
                Cancel this appointment?
              </h2>
              <p className="mt-1 text-sm text-muted">
                {summary.provider} · {summary.when}
                <br />
                {summary.service}
              </p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-ink">Why are you cancelling?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {CANCEL_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition ${
                    reason === r.value ? "border-brand bg-brand-soft text-ink" : "border-line text-body hover:border-brand/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="h-4 w-4 accent-brand"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-5 block text-sm text-ink">
            {reason === "other" ? "Tell us more" : "Anything the clinic should know?"}
            <span className="ml-1 text-muted">{reason === "other" ? "(required)" : "(optional)"}</span>
            <textarea
              name="note"
              rows={3}
              maxLength={500}
              placeholder={reason === "other" ? "Your reason" : "e.g. I'll rebook next week"}
              className={`${inputClass} mt-2 h-auto py-3`}
            />
          </label>

          <ul className="mt-5 space-y-1.5 rounded-lg bg-canvas px-4 py-3 text-xs leading-relaxed text-body">
            <li>• Your time slot will be released so another patient can book it.</li>
            <li>• Online cancellation closes {PATIENT_CANCEL_CUTOFF_HOURS} hours before the appointment.</li>
            <li>• This can&apos;t be undone. You can book a new time anytime.</li>
          </ul>

          <div className="mt-4">
            <FormError message={state?.error} />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              className="h-12 rounded-lg border border-line px-5 font-semibold text-ink hover:border-brand"
            >
              Keep appointment
            </button>
            <button
              disabled={!reason || pending}
              className="h-12 rounded-lg bg-red-700 px-5 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Cancelling…" : "Yes, cancel appointment"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
