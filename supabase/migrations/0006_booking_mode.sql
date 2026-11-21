-- reHUB: let the patient choose the visit mode when booking.
-- The mode must be one the provider offers (provider_details.visit_modes).
-- Existing callers that don't pass p_mode keep working (defaults to the slot's mode).
-- Run AFTER 0005.

drop function if exists public.book_appointment(uuid, uuid, smallint, text, text, text);

create or replace function public.book_appointment(
  p_slot_id      uuid,
  p_service_id   uuid,
  p_coverage_id  smallint,      -- null = self-pay
  p_full_name    text,
  p_mobile       text,
  p_reason       text default null,
  p_mode         public.visit_mode default null   -- null = the slot's mode
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_slot     availability_slots;
  v_service  services;
  v_mode     visit_mode;
  v_id       uuid;
begin
  if auth.uid() is null then
    raise exception 'You need to be logged in to book.' using errcode = '28000';
  end if;
  if not exists (select 1 from profiles where id = auth.uid() and role = 'patient') then
    raise exception 'Only patient accounts can book appointments.' using errcode = '42501';
  end if;

  -- Lock the slot so two people can't book it at once.
  select * into v_slot from availability_slots where id = p_slot_id for update;
  if not found or v_slot.is_booked or v_slot.starts_at <= now() then
    raise exception 'That time is no longer available.' using errcode = 'P0001';
  end if;

  select * into v_service from services
  where id = p_service_id and provider_id = v_slot.provider_id and is_active;
  if not found then
    raise exception 'That service is not offered by this provider.' using errcode = 'P0001';
  end if;

  v_mode := coalesce(p_mode, v_slot.mode);
  if v_mode <> v_slot.mode and not exists (
    select 1 from provider_details where profile_id = v_slot.provider_id and v_mode = any (visit_modes)
  ) then
    raise exception 'This provider does not offer that type of visit.' using errcode = 'P0001';
  end if;

  if p_coverage_id is not null and not exists (
    select 1 from provider_coverage where provider_id = v_slot.provider_id and coverage_id = p_coverage_id
  ) then
    raise exception 'This provider does not accept that coverage.' using errcode = 'P0001';
  end if;

  update availability_slots set is_booked = true where id = v_slot.id;

  insert into appointments (
    patient_id, provider_id, clinic_id, service_id, slot_id, starts_at, duration_min, mode,
    coverage_id, quoted_fee, patient_full_name, patient_mobile, reason
  ) values (
    auth.uid(), v_slot.provider_id, v_slot.clinic_id, v_service.id, v_slot.id, v_slot.starts_at,
    v_service.duration_min, v_mode, p_coverage_id, v_service.starting_fee,
    p_full_name, p_mobile, nullif(p_reason, '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.book_appointment(uuid, uuid, smallint, text, text, text, public.visit_mode) to authenticated;
