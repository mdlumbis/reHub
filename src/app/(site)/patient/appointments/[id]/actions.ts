"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelAppointment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_appointment", { p_appointment_id: id });
  if (error) console.error("cancel_appointment failed", error);
  revalidatePath(`/patient/appointments/${id}`);
}
