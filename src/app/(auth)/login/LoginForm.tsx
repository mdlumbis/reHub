"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Role } from "@/lib/types";
import { login } from "./actions";

const inputClass =
  "mt-2 h-12 w-full rounded-lg border border-line bg-white px-3.5 text-ink outline-none placeholder:text-muted/80 focus:border-brand focus:ring-2 focus:ring-brand/15";

export function LoginForm({ initialRole, next }: { initialRole: Role; next?: string }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="role" value={role} />
      {next && <input type="hidden" name="next" value={next} />}

      <p className="text-sm font-semibold text-ink">I am logging in as a</p>
      <div role="tablist" className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-[#eef1ef] p-1">
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

      <label className="mt-8 block text-sm text-ink">
        E-mail address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="mt-6 block text-sm text-ink">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          className={inputClass}
        />
      </label>

      <div className="mt-6 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2.5 text-ink">
          <input type="checkbox" name="remember" className="h-4 w-4 accent-brand" defaultChecked />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-brand hover:underline">
          Forgot password?
        </Link>
      </div>

      {state?.error && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="mt-6 h-12 w-full rounded-lg bg-brand font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="mt-10 text-sm text-muted">No account yet? Your next step starts here.</p>
      <Link
        href={`/register?role=${role}`}
        className="mt-6 flex h-12 items-center justify-center rounded-lg border border-line bg-white font-semibold text-ink hover:border-brand hover:text-brand"
      >
        Register as new user
      </Link>
    </form>
  );
}
