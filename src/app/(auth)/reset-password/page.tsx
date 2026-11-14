import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ResetForm } from "./ResetForm";

/** Reached from the password-reset e-mail via /auth/confirm, which signs the user in first. */
export default async function ResetPasswordPage() {
  if (isSupabaseConfigured && !(await getCurrentProfile())) redirect("/auth/error");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section className="w-full max-w-md rounded-3xl border border-line bg-white p-9">
        <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Account help</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Set a new password</h1>
        <p className="mt-3 text-muted">Choose a password you haven&apos;t used before.</p>
        <ResetForm />
      </section>
    </main>
  );
}
