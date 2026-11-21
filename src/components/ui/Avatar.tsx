import Image from "next/image";
import { initials } from "@/lib/format";

/** Profile photo if there is one, otherwise initials. `shape` matches the mockups: round in lists, square on profiles. */
export function Avatar({
  photoUrl,
  firstName,
  lastName,
  size,
  shape = "circle",
  className = "",
}: {
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size: number;
  shape?: "circle" | "square";
  className?: string;
}) {
  const radius = shape === "circle" ? "rounded-full" : "rounded-2xl";
  const alt = [firstName, lastName].filter(Boolean).join(" ");

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={alt}
        width={size}
        height={size}
        unoptimized={photoUrl.endsWith(".svg")}
        className={`${radius} shrink-0 object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-brand-soft font-medium text-brand ${radius} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      aria-label={alt}
    >
      {initials(firstName, lastName)}
    </span>
  );
}
