"use client";

import { useActionState } from "react";
import { Field, FormError, TextInput } from "@/components/ui/form";
import { updatePassword, type PasswordState } from "../forgot-password/actions";

export function ResetForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(updatePassword, undefined);

  return (
    <form action={action} className="mt-8 space-y-6">
      <Field label="New password">
        <TextInput name="password" type="password" required autoComplete="new-password" placeholder="At least 8 characters" />
      </Field>
      <Field label="Confirm new password">
        <TextInput name="confirm_password" type="password" required autoComplete="new-password" placeholder="Re-enter password" />
      </Field>
      <FormError message={state?.error} />
      <button
        disabled={pending}
        className="h-12 w-full rounded-lg bg-brand font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
