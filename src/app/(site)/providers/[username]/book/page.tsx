import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarX, UserRound } from "lucide-react";
import { MessageCard } from "@/components/ui/MessageCard";
import { getProviderProfile, type Slot } from "@/lib/directory";
import { formatLongDate, formatTime, isPast, VISIT_MODE_LABEL, providerName, shortCity } from "@/lib/format";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { BookingForm } from "./BookingForm";

export const metadata = { title: "Confirm your appointment · reHUB" };

export default async function BookPage({ params, searchParams }: PageProps<"/providers/[username]/book">) {
  const { username } = await params;
  const { slot: slotParam } = await searchParams;
  const slotId = typeof slotParam === "string" ? slotParam : "";
  const profileHref = `/providers/${username}#availability`;

  // Must be a logged-in patient. Come back here after logging in.
  const me = await getCurrentProfile();
  if (!me) redirect(`/login?role=patient&next=${encodeURIComponent(`/providers/${username}/book?slot=${slotId}`)}`);
  if (me.role !== "patient") {
    return (
      <MessageCard icon={<UserRound className="h-6 w-6" />} eyebrow="Patients only" title="Log in as a patient to book">
        <p>You&apos;re logged in with a provider account. Booking is for patient accounts.</p>
        <Link href={profileHref} className="mt-6 inline-block font-medium text-brand hover:underline">
          Back to profile
        </Link>
      </MessageCard>
    );
  }

  const profile = await getProviderProfile(username);
  if (!profile) notFound();

  const supabase = await createClient();
  const [{ data: slot }, { data: mine }] = await Promise.all([
    supabase
      .from("availability_slots")
      .select("id, starts_at, duration_min, mode, clinic_id, provider_id, is_booked")
      .eq("id", slotId)
      .maybeSingle(),
    supabase.from("profiles").select("full_name, contact_number").eq("id", me.id).single(),
  ]);

  const unavailable =
    !slot || slot.provider_id !== profile.provider.id || slot.is_booked || isPast(slot.starts_at);

  if (unavailable) {
    return (
      <MessageCard icon={<CalendarX className="h-6 w-6" />} eyebrow="Time not available" title="That time was just taken">
        <p>Please pick another time from the provider&apos;s calendar.</p>
        <Link
          href={profileHref}
          className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Choose another time
        </Link>
      </MessageCard>
    );
  }

  const s = slot as Slot;
  const clinic = profile.clinics.find((c) => c.id === s.clinic_id) ?? profile.clinics[0];
  const name = providerName(profile.provider);
  const mobile = mine?.contact_number?.replace(/^\+63(\d{3})(\d{3})(\d{4})$/, "+63 $1 $2 $3") ?? "";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 lg:px-14">
      <nav className="text-sm text-muted">
        <Link href="/search" className="hover:text-ink">Find care</Link> /{" "}
        <Link href={`/providers/${username}`} className="hover:text-ink">{name}</Link> / <span className="text-ink">Book</span>
      </nav>
      <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-brand uppercase">Your next step</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">Confirm your appointment</h1>
      <p className="mt-3 text-muted">Review your visit and choose how you&apos;ll pay.</p>

      <BookingForm
        slotId={s.id}
        services={profile.services}
        coverage={profile.coverage}
        backHref={profileHref}
        defaults={{ fullName: mine?.full_name ?? me.full_name ?? "", mobile }}
        summary={{
          badge: `${profile.provider.profession} · Verified`,
          title: name,
          address: clinic
            ? `${clinic.name} · ${[clinic.street_address, shortCity(clinic.location)].filter(Boolean).join(", ")}`
            : "",
          date: formatLongDate(s.starts_at),
          time: formatTime(s.starts_at),
          mode: VISIT_MODE_LABEL[s.mode] ?? s.mode,
        }}
      />
    </main>
  );
}
