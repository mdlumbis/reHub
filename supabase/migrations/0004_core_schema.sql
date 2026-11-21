-- reHUB: core data model.
-- Lookups (coverage, locations), provider public profile + verification, clinics,
-- services and starting fees, accepted coverage, availability, appointments,
-- provider patient records, and referrals. Run AFTER 0003_auto_username.sql.
--
-- Who can see what (RLS):
--   * Anyone (even logged out): lookups, clinics, services, coverage, open slots,
--     and verified providers through the `public_providers` view.
--   * Patients: their own appointments.
--   * Providers: their own clinics/services/coverage/slots, appointments with them,
--     their own patient records, referrals they sent or received.

-- ===========================================================================
-- Enums
-- ===========================================================================
create type public.coverage_kind      as enum ('philhealth_package', 'assistance', 'hmo');
create type public.visit_mode         as enum ('in_person', 'home', 'online');
create type public.appointment_status as enum ('booked', 'checked_in', 'in_room', 'completed', 'cancelled', 'no_show');
create type public.referral_status    as enum ('draft', 'sent', 'accepted', 'declined', 'completed');

-- ===========================================================================
-- Lookup tables (read-only for users; edit with SQL)
-- ===========================================================================
create table public.coverage_options (
  id          smallserial primary key,
  slug        text not null unique,
  name        text not null,          -- e.g. 'CWD Mobility package', 'Maxicare'
  short_name  text not null,          -- chip label, e.g. 'CWD Mobility'
  kind        public.coverage_kind not null,
  sort_order  smallint not null default 0
);

insert into public.coverage_options (slug, name, short_name, kind, sort_order) values
  ('philhealth-cwd-developmental', 'PhilHealth CWD Developmental package', 'CWD Developmental', 'philhealth_package', 1),
  ('philhealth-cwd-mobility',      'PhilHealth CWD Mobility package',      'CWD Mobility',      'philhealth_package', 2),
  ('philhealth-adult-z-morph',     'PhilHealth Adult Z Morph package',     'PhilHealth Z Morph','philhealth_package', 3),
  ('guarantee-letter',             'Guarantee letters',                    'Guarantee letters', 'assistance', 10),
  ('dswd',                         'DSWD assistance',                      'DSWD',              'assistance', 11),
  ('maxicare',                     'Maxicare',                             'Maxicare',          'hmo', 20),
  ('intellicare',                  'Intellicare',                          'Intellicare',       'hmo', 21),
  ('medicard',                     'MediCard',                             'MediCard',          'hmo', 22),
  ('philcare',                     'PhilCare',                             'PhilCare',          'hmo', 23),
  ('valucare',                     'ValuCare',                             'ValuCare',          'hmo', 24),
  ('kaiser',                       'Kaiser International',                 'Kaiser',            'hmo', 25),
  ('cocolife',                     'Cocolife',                             'Cocolife',          'hmo', 26),
  ('etiqa',                        'Etiqa',                                'Etiqa',             'hmo', 27),
  ('pacific-cross',                'Pacific Cross',                        'Pacific Cross',     'hmo', 28);

-- City centres, used for "distance from your location" when a patient picks a city.
-- `name` matches LOCATIONS in src/lib/options.ts exactly.
create table public.locations (
  name  text primary key,
  lat   double precision not null,
  lng   double precision not null
);

insert into public.locations (name, lat, lng) values
  ('Caloocan City, Metro Manila', 14.6507, 120.9667),
  ('Las Piñas City, Metro Manila', 14.4445, 120.9939),
  ('Makati City, Metro Manila', 14.5547, 121.0244),
  ('Malabon City, Metro Manila', 14.6681, 120.9658),
  ('Mandaluyong City, Metro Manila', 14.5794, 121.0359),
  ('Manila City, Metro Manila', 14.5995, 120.9842),
  ('Marikina City, Metro Manila', 14.6507, 121.1029),
  ('Muntinlupa City, Metro Manila', 14.4081, 121.0415),
  ('Navotas City, Metro Manila', 14.6667, 120.9417),
  ('Parañaque City, Metro Manila', 14.4793, 121.0198),
  ('Pasay City, Metro Manila', 14.5378, 121.0014),
  ('Pasig City, Metro Manila', 14.5764, 121.0851),
  ('Pateros, Metro Manila', 14.5454, 121.0687),
  ('Quezon City, Metro Manila', 14.676, 121.0437),
  ('San Juan City, Metro Manila', 14.6019, 121.0355),
  ('Taguig City, Metro Manila', 14.5176, 121.0509),
  ('Valenzuela City, Metro Manila', 14.7011, 120.983),
  ('Antipolo City, Rizal', 14.5862, 121.1761),
  ('Cainta, Rizal', 14.5786, 121.1222),
  ('Taytay, Rizal', 14.5574, 121.1324),
  ('Bacoor City, Cavite', 14.459, 120.929),
  ('Dasmariñas City, Cavite', 14.3294, 120.9367),
  ('Imus City, Cavite', 14.4297, 120.9367),
  ('Biñan City, Laguna', 14.3428, 121.0806),
  ('Calamba City, Laguna', 14.2117, 121.1653),
  ('Santa Rosa City, Laguna', 14.3122, 121.1114),
  ('Batangas City, Batangas', 13.7565, 121.0583),
  ('Lipa City, Batangas', 13.9411, 121.163),
  ('Malolos City, Bulacan', 14.8527, 120.816),
  ('Meycauayan City, Bulacan', 14.7344, 120.9572),
  ('San Jose del Monte City, Bulacan', 14.8139, 121.0453),
  ('Angeles City, Pampanga', 15.145, 120.5887),
  ('San Fernando City, Pampanga', 15.0286, 120.6898),
  ('Baguio City, Benguet', 16.4023, 120.596),
  ('Iloilo City, Iloilo', 10.7202, 122.5621),
  ('Bacolod City, Negros Occidental', 10.6765, 122.9509),
  ('Cebu City, Cebu', 10.3157, 123.8854),
  ('Mandaue City, Cebu', 10.3236, 123.9223),
  ('Lapu-Lapu City, Cebu', 10.3103, 123.9494),
  ('Tacloban City, Leyte', 11.2444, 125.0039),
  ('Cagayan de Oro City, Misamis Oriental', 8.4542, 124.6319),
  ('Davao City, Davao del Sur', 7.1907, 125.4553),
  ('General Santos City, South Cotabato', 6.1164, 125.1716),
  ('Zamboanga City, Zamboanga del Sur', 6.9214, 122.079);

-- ===========================================================================
-- Provider public profile + verification (extends provider_details from 0002)
-- ===========================================================================
alter table public.provider_details
  add column credentials          text,            -- e.g. 'MD, FPARM'
  add column headline             text,            -- e.g. 'Rehabilitation Medicine, adult neurorehabilitation'
  add column about                text,
  add column years_experience     smallint check (years_experience between 0 and 70),
  add column visit_modes          public.visit_mode[] not null default '{in_person}',
  add column photo_url            text,
  add column prc_license_number   text,
  add column prc_registered_name  text,            -- filled by the verifier
  add column prc_expiry           date,
  add column prc_status           public.verification_status not null default 'pending',
  add column parm_status          public.verification_status,          -- PARM fellowship (physiatrists only)
  add column philhealth_status    public.verification_status,          -- PhilHealth accreditation, optional
  add column updated_at           timestamptz not null default now();

-- Providers may edit their own profile fields but never any *_status column.
-- (RLS can't restrict columns, so use column privileges.)
revoke update on public.provider_details from authenticated, anon;
grant update (
  profession, specializations, fee_min, fee_max, credentials, headline, about,
  years_experience, visit_modes, photo_url, prc_license_number, prc_expiry, updated_at
) on public.provider_details to authenticated;

-- ===========================================================================
-- Clinics and where each provider practises
-- ===========================================================================
create table public.clinics (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  street_address    text,                          -- e.g. 'Chino Roces Ave.'
  location          text references public.locations (name),  -- city, from LOCATIONS
  lat               double precision,
  lng               double precision,
  phone             text,
  established_year  smallint,
  clinician_count   smallint,
  address_verified  boolean not null default false,   -- "Address geocoded"
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);

alter table public.clinics enable row level security;
create policy "Anyone can read clinics"        on public.clinics for select using (true);
create policy "Providers add clinics"          on public.clinics for insert to authenticated
  with check (created_by = auth.uid() and exists (select 1 from public.provider_details where profile_id = auth.uid()));
create policy "Creators update their clinics"  on public.clinics for update using (created_by = auth.uid());
create policy "Creators delete their clinics"  on public.clinics for delete using (created_by = auth.uid());

-- address_verified is set by an admin, never by the provider.
revoke insert, update on public.clinics from authenticated, anon;
grant insert (name, street_address, location, lat, lng, phone, established_year, clinician_count, created_by)
  on public.clinics to authenticated;
grant update (name, street_address, location, lat, lng, phone, established_year, clinician_count)
  on public.clinics to authenticated;

create table public.provider_clinics (
  provider_id    uuid not null references public.provider_details (profile_id) on delete cascade,
  clinic_id      uuid not null references public.clinics (id) on delete cascade,
  schedule_text  text,                                   -- e.g. 'Mon–Fri · 8 AM–5 PM'
  visit_modes    public.visit_mode[] not null default '{in_person}',
  is_primary     boolean not null default false,
  primary key (provider_id, clinic_id)
);

alter table public.provider_clinics enable row level security;
create policy "Anyone can read provider clinics" on public.provider_clinics for select using (true);
create policy "Providers manage own clinic links" on public.provider_clinics for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

-- ===========================================================================
-- Services and starting fees, accepted coverage
-- ===========================================================================
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.provider_details (profile_id) on delete cascade,
  name          text not null,                 -- e.g. 'Initial physiatric consultation'
  duration_min  smallint not null check (duration_min between 5 and 480),
  starting_fee  numeric(10, 2) not null check (starting_fee >= 0),
  is_active     boolean not null default true,
  sort_order    smallint not null default 0,
  created_at    timestamptz not null default now()
);

create index services_provider_idx on public.services (provider_id);
alter table public.services enable row level security;
create policy "Anyone can read services"    on public.services for select using (true);
create policy "Providers manage own services" on public.services for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

create table public.provider_coverage (
  provider_id  uuid not null references public.provider_details (profile_id) on delete cascade,
  coverage_id  smallint not null references public.coverage_options (id) on delete cascade,
  primary key (provider_id, coverage_id)
);

alter table public.provider_coverage enable row level security;
create policy "Anyone can read provider coverage" on public.provider_coverage for select using (true);
create policy "Providers manage own coverage" on public.provider_coverage for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

-- ===========================================================================
-- Availability (bookable time slots)
-- ===========================================================================
create table public.availability_slots (
  id            uuid primary key default gen_random_uuid(),
  provider_id   uuid not null references public.provider_details (profile_id) on delete cascade,
  clinic_id     uuid references public.clinics (id) on delete set null,   -- null for online/home
  starts_at     timestamptz not null,
  duration_min  smallint not null default 60,
  mode          public.visit_mode not null default 'in_person',
  is_booked     boolean not null default false,
  unique (provider_id, starts_at)
);

create index availability_open_idx on public.availability_slots (provider_id, starts_at) where not is_booked;
alter table public.availability_slots enable row level security;
create policy "Anyone can read slots" on public.availability_slots for select using (true);
create policy "Providers manage own slots" on public.availability_slots for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

-- ===========================================================================
-- Appointments
-- ===========================================================================
create table public.appointments (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.profiles (id) on delete cascade,
  provider_id        uuid not null references public.provider_details (profile_id) on delete cascade,
  clinic_id          uuid references public.clinics (id) on delete set null,
  service_id         uuid references public.services (id) on delete set null,
  slot_id            uuid unique references public.availability_slots (id) on delete set null,
  starts_at          timestamptz not null,
  duration_min       smallint not null,
  mode               public.visit_mode not null,
  coverage_id        smallint references public.coverage_options (id),   -- null = self-pay
  quoted_fee         numeric(10, 2),            -- starting fee shown at booking time
  patient_full_name  text not null,
  patient_mobile     text not null,
  reason             text,
  status             public.appointment_status not null default 'booked',
  created_at         timestamptz not null default now()
);

create index appointments_provider_day_idx on public.appointments (provider_id, starts_at);
create index appointments_patient_idx      on public.appointments (patient_id, starts_at);
alter table public.appointments enable row level security;
create policy "Patients read own appointments"  on public.appointments for select using (patient_id = auth.uid());
create policy "Providers read their appointments" on public.appointments for select using (provider_id = auth.uid());
-- Providers move appointments through the day (checked_in → in_room → completed).
create policy "Providers update their appointments" on public.appointments for update
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());
revoke update on public.appointments from authenticated, anon;
grant update (status) on public.appointments to authenticated;
-- Inserts and cancellations go through book_appointment() / cancel_appointment() below.

-- ===========================================================================
-- Provider-held patient records (the "Patients" page; used in referrals)
-- ===========================================================================
create sequence public.patient_mrn_seq start 42000;

create table public.patient_records (
  id                  uuid primary key default gen_random_uuid(),
  provider_id         uuid not null references public.provider_details (profile_id) on delete cascade,
  patient_profile_id  uuid references public.profiles (id) on delete set null,   -- if they have a reHUB account
  mrn                 text not null default lpad(nextval('public.patient_mrn_seq')::text, 7, '0'),
  full_name           text not null,
  birth_date          date,
  sex                 text check (sex in ('M', 'F')),
  contact_number      text,
  notes               text,
  created_at          timestamptz not null default now(),
  unique (provider_id, mrn)
);

create index patient_records_provider_idx on public.patient_records (provider_id);
alter table public.patient_records enable row level security;
create policy "Providers manage own patient records" on public.patient_records for all
  using (provider_id = auth.uid()) with check (provider_id = auth.uid());

-- ===========================================================================
-- Referrals (the 7-field reHUB referral format)
-- ===========================================================================
create table public.referrals (
  id                   uuid primary key default gen_random_uuid(),
  from_provider_id     uuid not null references public.provider_details (profile_id) on delete cascade,
  patient_record_id    uuid not null references public.patient_records (id) on delete cascade,
  to_profession        text not null,                -- 'Physical therapist', ... (PROFESSIONS)
  to_provider_id       uuid references public.provider_details (profile_id) on delete set null,  -- optional
  diagnosis            text not null,                -- 1
  problem_list         text,                         -- 2
  goals                text,                         -- 3
  precautions          text,                         -- 4
  recommended_program  text,                         -- 5
  validity             text not null,                -- 6
  follow_up            text,                         -- 7
  status               public.referral_status not null default 'draft',
  sent_at              timestamptz,
  responded_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index referrals_from_idx on public.referrals (from_provider_id, created_at desc);
create index referrals_to_idx   on public.referrals (to_provider_id, status);
alter table public.referrals enable row level security;

create policy "Senders manage own referrals" on public.referrals for all
  using (from_provider_id = auth.uid()) with check (from_provider_id = auth.uid());

-- Recipients: addressed to them, or sent to their profession with no specific provider.
create policy "Recipients read referrals" on public.referrals for select using (
  status <> 'draft' and (
    to_provider_id = auth.uid()
    or (to_provider_id is null and to_profession = (select profession from public.provider_details where profile_id = auth.uid()))
  )
);

-- Recipients also need to see the referred patient's record.
create policy "Recipients read referred patient records" on public.patient_records for select using (
  exists (
    select 1 from public.referrals r
    where r.patient_record_id = patient_records.id
      and r.status <> 'draft'
      and (r.to_provider_id = auth.uid()
           or (r.to_provider_id is null and r.to_profession = (select profession from public.provider_details where profile_id = auth.uid())))
  )
);

-- ===========================================================================
-- Public read access to lookups
-- ===========================================================================
alter table public.coverage_options enable row level security;
alter table public.locations        enable row level security;
create policy "Anyone can read coverage options" on public.coverage_options for select using (true);
create policy "Anyone can read locations"        on public.locations        for select using (true);

-- ===========================================================================
-- Public provider directory (only verified providers, only safe columns)
-- ===========================================================================
create view public.public_providers as
select
  p.id,
  p.username,
  p.first_name,
  p.last_name,
  pd.profession,
  pd.specializations,
  pd.credentials,
  pd.headline,
  pd.about,
  pd.years_experience,
  pd.visit_modes,
  pd.photo_url,
  pd.prc_status,
  pd.parm_status,
  pd.philhealth_status
from public.profiles p
join public.provider_details pd on pd.profile_id = p.id
where pd.verification_status = 'verified';

grant select on public.public_providers to anon, authenticated;

-- ===========================================================================
-- Helper: great-circle distance in km (no PostGIS needed)
-- ===========================================================================
create or replace function public.distance_km(lat1 double precision, lng1 double precision,
                                              lat2 double precision, lng2 double precision)
returns double precision
language sql immutable
as $$
  select 6371 * 2 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

-- ===========================================================================
-- Search: verified providers, filtered and ranked by distance from a city
--   select * from search_providers(p_location => 'Makati City, Metro Manila');
-- ===========================================================================
create or replace function public.search_providers(
  p_query        text     default null,   -- name, specialization or service
  p_location     text     default null,   -- a LOCATIONS value; used for distance
  p_professions  text[]   default null,
  p_coverage     text[]   default null,   -- coverage_options.slug, provider must accept ALL
  p_max_km       double precision default null
)
returns table (
  provider_id          uuid,
  username             text,
  first_name           text,
  last_name            text,
  profession           text,
  credentials          text,
  headline             text,
  specializations      text[],
  years_experience     smallint,
  visit_modes          public.visit_mode[],
  clinic_id            uuid,
  clinic_name          text,
  clinic_location      text,
  distance_km          double precision,
  earliest_available   timestamptz,
  min_fee              numeric,
  coverage             text[]
)
language sql stable
security definer set search_path = public
as $$
  with origin as (
    select lat, lng from locations where name = p_location
  ),
  base as (
    select
      pp.id as provider_id, pp.username, pp.first_name, pp.last_name, pp.profession,
      pp.credentials, pp.headline, pp.specializations, pp.years_experience, pp.visit_modes,
      c.id as clinic_id, c.name as clinic_name, c.location as clinic_location,
      case when o.lat is not null and c.lat is not null
           then distance_km(o.lat, o.lng, c.lat, c.lng) end as distance_km
    from public_providers pp
    left join lateral (
      select c.* from provider_clinics pc join clinics c on c.id = pc.clinic_id
      where pc.provider_id = pp.id
      order by pc.is_primary desc
      limit 1
    ) c on true
    left join origin o on true
    where (p_professions is null or pp.profession = any (p_professions))
      and (p_query is null or p_query = ''
           or (pp.first_name || ' ' || pp.last_name) ilike '%' || p_query || '%'
           or pp.headline ilike '%' || p_query || '%'
           or exists (select 1 from unnest(pp.specializations) s where s ilike '%' || p_query || '%')
           or exists (select 1 from services sv where sv.provider_id = pp.id and sv.is_active and sv.name ilike '%' || p_query || '%'))
      and (p_coverage is null or not exists (
            select 1 from coverage_options co
            where co.slug = any (p_coverage)
              and not exists (select 1 from provider_coverage pc where pc.provider_id = pp.id and pc.coverage_id = co.id)))
  )
  select
    b.*,
    (select min(s.starts_at) from availability_slots s
      where s.provider_id = b.provider_id and not s.is_booked and s.starts_at > now()) as earliest_available,
    (select min(sv.starting_fee) from services sv where sv.provider_id = b.provider_id and sv.is_active) as min_fee,
    array(select co.short_name from provider_coverage pc join coverage_options co on co.id = pc.coverage_id
          where pc.provider_id = b.provider_id order by co.sort_order) as coverage
  from base b
  where p_max_km is null or b.distance_km <= p_max_km
  order by b.distance_km nulls last, b.last_name;
$$;

grant execute on function public.search_providers(text, text, text[], text[], double precision) to anon, authenticated;

-- ===========================================================================
-- Booking: claims the slot and creates the appointment in one step
-- ===========================================================================
create or replace function public.book_appointment(
  p_slot_id      uuid,
  p_service_id   uuid,
  p_coverage_id  smallint,      -- null = self-pay
  p_full_name    text,
  p_mobile       text,
  p_reason       text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_slot     availability_slots;
  v_service  services;
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
    v_service.duration_min, v_slot.mode, p_coverage_id, v_service.starting_fee,
    p_full_name, p_mobile, nullif(p_reason, '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.book_appointment(uuid, uuid, smallint, text, text, text) to authenticated;

-- Patient or provider cancels; the slot opens up again.
create or replace function public.cancel_appointment(p_appointment_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_appt appointments;
begin
  select * into v_appt from appointments where id = p_appointment_id for update;
  if not found or auth.uid() not in (v_appt.patient_id, v_appt.provider_id) then
    raise exception 'Appointment not found.' using errcode = 'P0002';
  end if;
  if v_appt.status not in ('booked', 'checked_in') then
    raise exception 'This appointment can no longer be cancelled.' using errcode = 'P0001';
  end if;

  update appointments set status = 'cancelled', slot_id = null where id = v_appt.id;
  update availability_slots set is_booked = false where id = v_appt.slot_id;
end;
$$;

grant execute on function public.cancel_appointment(uuid) to authenticated;

-- ===========================================================================
-- Referrals: send a draft, recipient accepts / declines
-- ===========================================================================
create or replace function public.respond_to_referral(p_referral_id uuid, p_accept boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_ref referrals;
  v_profession text;
begin
  select profession into v_profession from provider_details where profile_id = auth.uid();
  select * into v_ref from referrals where id = p_referral_id for update;

  if not found or v_ref.status <> 'sent' or not (
       v_ref.to_provider_id = auth.uid()
       or (v_ref.to_provider_id is null and v_ref.to_profession = v_profession)) then
    raise exception 'Referral not found or already handled.' using errcode = 'P0002';
  end if;

  update referrals
  set status = case when p_accept then 'accepted'::referral_status else 'declined'::referral_status end,
      to_provider_id = coalesce(to_provider_id, auth.uid()),
      responded_at = now(),
      updated_at = now()
  where id = v_ref.id;
end;
$$;

grant execute on function public.respond_to_referral(uuid, boolean) to authenticated;

-- Senders can only edit drafts and move them to 'sent'. Accept/decline goes through
-- respond_to_referral() (runs as the table owner, so these checks don't apply to it).
create or replace function public.referrals_before_update()
returns trigger
language plpgsql
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    if old.status <> 'draft' then
      raise exception 'A sent referral can''t be edited.' using errcode = 'P0001';
    end if;
    if new.status not in ('draft', 'sent') then
      raise exception 'Referrals can only be saved as a draft or sent.' using errcode = 'P0001';
    end if;
  end if;

  if old.status = 'draft' and new.status = 'sent' then
    new.sent_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- New referrals can start as 'draft' or 'sent', nothing else.
create or replace function public.referrals_before_insert()
returns trigger
language plpgsql
as $$
begin
  if new.status not in ('draft', 'sent') then
    raise exception 'Referrals can only be saved as a draft or sent.' using errcode = 'P0001';
  end if;
  if new.status = 'sent' then
    new.sent_at := now();
  end if;
  return new;
end;
$$;

create trigger referrals_before_insert
  before insert on public.referrals
  for each row execute function public.referrals_before_insert();

create trigger referrals_before_update
  before update on public.referrals
  for each row execute function public.referrals_before_update();
