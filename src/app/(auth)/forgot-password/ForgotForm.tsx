"use client";

import { useActionState } from "react";
import { Field, FormError, Notice, TextInput } from "@/components/ui/form";
import { requestReset, type PasswordState } from "./actions";

export function ForgotForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(requestReset, undefined);

  if (state?.sent) {
    return (
      <div className="mt-8">
        <Notice>
          If an account exists for <strong>{state.email}</strong>, a reset link is on its way. Open it in this browser.
        </Notice>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-6">
      <Field label="E-mail address">
        <TextInput name="email" type="email" required autoComplete="email" placeholder="you@example.com" defaultValue={state?.email} />
      </Field>
      <FormError message={state?.error} />
      <button
        disabled={pending}
        className="h-12 w-full rounded-lg bg-brand font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
