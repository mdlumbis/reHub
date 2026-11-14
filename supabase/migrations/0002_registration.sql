-- reHUB: registration fields for patients and providers.
-- Run AFTER 0001_profiles.sql. Dashboard > SQL Editor > paste > Run.

-- Shared profile fields ------------------------------------------------------
alter table public.profiles
  add column username        text unique,
  add column first_name      text,
  add column middle_name     text,
  add column last_name       text,
  add column contact_number  text,
  add column location        text;

alter table public.profiles
  add constraint username_format check (username ~ '^[a-z0-9._]{3,30}$');

-- Patient-only private details (never shown publicly) ------------------------
create table public.patient_details (
  profile_id       uuid primary key references public.profiles (id) on delete cascade,
  valid_id_type    text,
  valid_id_number  text,
  created_at       timestamptz not null default now()
);

alter table public.patient_details enable row level security;

create policy "Patients read own details"
  on public.patient_details for select using (auth.uid() = profile_id);
create policy "Patients update own details"
  on public.patient_details for update using (auth.uid() = profile_id);

-- Provider professional details ---------------------------------------------
create type public.verification_status as enum ('pending', 'verified', 'rejected');

create table public.provider_details (
  profile_id           uuid primary key references public.profiles (id) on delete cascade,
  profession           text not null,
  specializations      text[] not null default '{}',
  fee_min              numeric(10, 2),
  fee_max              numeric(10, 2),
  verification_status  public.verification_status not null default 'pending',
  created_at           timestamptz not null default now(),
  constraint fee_range check (fee_min is null or fee_max is null or fee_min <= fee_max)
);

alter table public.provider_details enable row level security;

create policy "Providers read own details"
  on public.provider_details for select using (auth.uid() = profile_id);
-- Providers may edit their details but not their own verification status.
create policy "Providers update own details"
  on public.provider_details for update
  using (auth.uid() = profile_id)
  with check (
    auth.uid() = profile_id
    and verification_status = (select verification_status from public.provider_details where profile_id = auth.uid())
  );

-- Username availability check, callable before sign-up -----------------------
create or replace function public.is_username_available(p_username text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select not exists (select 1 from public.profiles where username = lower(p_username));
$$;

grant execute on function public.is_username_available(text) to anon, authenticated;

-- Sign-up trigger: create profile + role details from sign-up metadata --------
-- The app passes these keys in supabase.auth.signUp({ options: { data } }).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta jsonb := new.raw_user_meta_data;
  v_role public.user_role := coalesce((meta ->> 'role')::public.user_role, 'patient');
begin
  insert into public.profiles (
    id, role, email, full_name, username, first_name, middle_name, last_name, contact_number, location
  )
  values (
    new.id,
    v_role,
    new.email,
    meta ->> 'full_name',
    lower(nullif(meta ->> 'username', '')),
    meta ->> 'first_name',
    nullif(meta ->> 'middle_name', ''),
    meta ->> 'last_name',
    nullif(meta ->> 'contact_number', ''),
    nullif(meta ->> 'location', '')
  );

  if v_role = 'patient' then
    insert into public.patient_details (profile_id, valid_id_type, valid_id_number)
    values (new.id, nullif(meta ->> 'valid_id_type', ''), nullif(meta ->> 'valid_id_number', ''));
  else
    insert into public.provider_details (profile_id, profession, specializations, fee_min, fee_max)
    values (
      new.id,
      coalesce(meta ->> 'profession', 'Unspecified'),
      coalesce(array(select jsonb_array_elements_text(meta -> 'specializations')), '{}'),
      nullif(meta ->> 'fee_min', '')::numeric,
      nullif(meta ->> 'fee_max', '')::numeric
    );
  end if;

  return new;
end;
$$;
