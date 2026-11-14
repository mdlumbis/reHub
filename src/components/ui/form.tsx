"use client";

import { ChevronDown, Info } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";

export const inputClass =
  "h-12 w-full rounded-lg border border-line bg-white px-3.5 text-ink outline-none placeholder:text-muted/80 focus:border-brand focus:ring-2 focus:ring-brand/15 aria-[invalid=true]:border-red-400";

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm text-ink ${className}`}>
      <span className="block truncate">
        {label}
        {hint && <span className="ml-1 text-muted">{hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </label>
  );
}

export function TextInput({ invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input aria-invalid={invalid || undefined} className={inputClass} {...props} />;
}

/** Controlled so its value survives React's automatic form reset after a failed submit. */
export function Select({
  options,
  placeholder,
  invalid,
  defaultValue,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "defaultValue"> & {
  options: readonly string[];
  placeholder: string;
  invalid?: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={`${inputClass} appearance-none pr-10 invalid:text-muted/80`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="text-ink">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-brand" />
    </div>
  );
}

/** Dropdown with checkboxes. Submits each checked value under `name`. */
export function MultiSelect({
  name,
  options,
  placeholder,
  defaultValue = [],
  invalid,
}: {
  name: string;
  options: readonly string[];
  placeholder: string;
  defaultValue?: string[];
  invalid?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const toggle = (o: string) =>
    setSelected((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));

  return (
    <details className="group relative">
      <summary
        aria-invalid={invalid || undefined}
        className={`${inputClass} flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden`}
      >
        <span className={`truncate ${selected.length ? "text-ink" : "text-muted/80"}`}>
          {selected.length ? selected.join(", ") : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-brand transition group-open:rotate-180" />
      </summary>
      <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-white p-1.5 shadow-lg">
        {options.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-brand-soft">
            <input
              type="checkbox"
              name={name}
              value={o}
              checked={selected.includes(o)}
              onChange={() => toggle(o)}
              className="h-4 w-4 accent-brand"
            />
            {o}
          </label>
        ))}
      </div>
    </details>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg bg-brand-soft px-3.5 py-3 text-sm leading-relaxed text-ink">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
      <p>{children}</p>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  );
}
