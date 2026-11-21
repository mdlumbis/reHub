-- reHUB: cancellation details and policy.
-- Records who cancelled, when, and why. Patients can cancel online until
-- 2 hours before the appointment; after that they must call the clinic.
-- Providers can cancel any time before the appointment. Run AFTER 0004.

create type public.cancel_reason as enum (
  'schedule_conflict', 'feeling_better', 'found_another_provider',
  'cost_or_coverage', 'booked_by_mistake', 'provider_unavailable', 'other'
);

alter table public.appointments
  add column cancelled_at   timestamptz,
  add column cancelled_by   text check (cancelled_by in ('patient', 'provider')),
  add column cancel_reason  public.cancel_reason,
  add column cancel_note    text check (length(cancel_note) <= 500);

-- Patients: how long before the start online cancellation closes.
create or replace function public.patient_cancel_cutoff()
returns interval language sql immutable as $$ select interval '2 hours' $$;

create or replace function public.cancel_appointment(
  p_appointment_id uuid,
  p_reason         public.cancel_reason,
  p_note           text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_appt appointments;
  v_by   text;
begin
  select * into v_appt from appointments where id = p_appointment_id for update;
  if not found or auth.uid() not in (v_appt.patient_id, v_appt.provider_id) then
    raise exception 'Appointment not found.' using errcode = 'P0002';
  end if;
  if v_appt.status not in ('booked', 'checked_in') then
    raise exception 'This appointment can no longer be cancelled.' using errcode = 'P0001';
  end if;
  if v_appt.starts_at <= now() then
    raise exception 'This appointment has already started.' using errcode = 'P0001';
  end if;

  v_by := case when auth.uid() = v_appt.patient_id then 'patient' else 'provider' end;

  if v_by = 'patient' and v_appt.starts_at - now() < patient_cancel_cutoff() then
    raise exception 'Online cancellation closes 2 hours before your appointment. Please call the clinic.'
      using errcode = 'P0001';
  end if;
  if p_reason = 'other' and coalesce(trim(p_note), '') = '' then
    raise exception 'Please tell us the reason.' using errcode = 'P0001';
  end if;

  update appointments
  set status = 'cancelled',
      slot_id = null,
      cancelled_at = now(),
      cancelled_by = v_by,
      cancel_reason = p_reason,
      cancel_note = nullif(trim(p_note), '')
  where id = v_appt.id;

  update availability_slots set is_booked = false where id = v_appt.slot_id;
end;
$$;

grant execute on function public.cancel_appointment(uuid, public.cancel_reason, text) to authenticated;

-- Old one-argument version (used before this migration) now goes through the same rules.
create or replace function public.cancel_appointment(p_appointment_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  select public.cancel_appointment(p_appointment_id, 'other'::public.cancel_reason, 'Cancelled (no reason given)');
$$;
