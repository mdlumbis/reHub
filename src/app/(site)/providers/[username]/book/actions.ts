"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BookingState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

export async function bookAppointment(_prev: BookingState, fd: FormData): Promise<BookingState> {
  const slotId = String(fd.get("slot_id") ?? "");
  const serviceId = String(fd.get("service_id") ?? "");
  const payment = String(fd.get("payment") ?? "self");
  const fullName = String(fd.get("full_name") ?? "").trim();
  const mobile = String(fd.get("mobile") ?? "").replace(/[^\d+]/g, "");
  const reason = String(fd.get("reason") ?? "").trim();
  const mode = String(fd.get("mode") ?? "");

  const e: Record<string, string> = {};
  if (!serviceId) e.service_id = "Choose a service.";
  if (fullName.length < 2) e.full_name = "Enter the patient's full name.";
  if (!/^(\+?63|0)?9\d{9}$/.test(mobile)) e.mobile = "Enter a PH mobile number, e.g. +63 917 123 4567.";
  if (reason.length > 500) e.reason = "Keep it under 500 characters.";
  if (!["in_person", "home", "online"].includes(mode)) e.mode = "Choose how you'd like to be seen.";
  if (!slotId) e.slot_id = "Choose a date and time.";
  if (Object.keys(e).length) return { fieldErrors: e };

  const normalizedMobile = `+63${mobile.slice(-10)}`;
  const coverageId = payment === "self" ? null : Number(payment);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_appointment", {
    p_slot_id: slotId,
    p_service_id: serviceId,
    p_coverage_id: coverageId,
    p_full_name: fullName,
    p_mobile: normalizedMobile,
    p_reason: reason || null,
    p_mode: mode,
  });

  if (error || !data) {
    // Messages raised by book_appointment() are written for patients; show them as-is.
    const known = error?.message && /available|logged in|patient accounts|not offered|offer that|accept/.test(error.message);
    if (!known) console.error("book_appointment failed", error);
    return { error: known ? error!.message : "We couldn't book this time. Please try again." };
  }

  redirect(`/patient/appointments/${data}?new=1`);
}
