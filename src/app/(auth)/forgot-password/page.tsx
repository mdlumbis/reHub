import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <section className="w-full max-w-md rounded-3xl border border-line bg-white p-9">
        <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">Account help</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Reset your password</h1>
        <p className="mt-3 text-muted">Enter your e-mail and we&apos;ll send you a link to set a new password.</p>
        <ForgotForm />
        <p className="mt-8 text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
}
