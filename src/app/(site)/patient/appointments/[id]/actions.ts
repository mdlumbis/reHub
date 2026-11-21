"use server";

import { redirect } from "next/navigation";
import { isCancelReason } from "@/lib/appointments";
import { createClient } from "@/lib/supabase/server";

export type CancelState = { error?: string } | undefined;

export async function cancelAppointment(_prev: CancelState, formData: FormData): Promise<CancelState> {
  const id = String(formData.get("id") ?? "");
  const reason = formData.get("reason");
  const note = String(formData.get("note") ?? "").trim();

  if (!isCancelReason(reason)) return { error: "Please choose a reason." };
  if (reason === "other" && !note) return { error: "Please tell us the reason." };
  if (note.length > 500) return { error: "Keep the note under 500 characters." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_appointment", {
    p_appointment_id: id,
    p_reason: reason,
    p_note: note || null,
  });

  if (error) {
    // Messages raised by cancel_appointment() are written for patients.
    const known = /cancel|started|reason|not found/i.test(error.message);
    if (!known) console.error("cancel_appointment failed", error);
    return { error: known ? error.message : "We couldn't cancel this appointment. Please try again." };
  }

  redirect(`/patient/appointments/${id}?cancelled=1`);
}
