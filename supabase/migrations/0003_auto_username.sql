-- reHUB: generate the User ID (profiles.username) automatically at sign-up.
-- Format: firstname.lastname, lowercase, letters/numbers only, e.g. "Juan Dela Cruz" -> juan.delacruz.
-- If taken, a number is appended: juan.delacruz2, juan.delacruz3, ...
-- Run AFTER 0002_registration.sql.

create or replace function public.generate_username(p_first text, p_last text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  base := lower(
    translate(coalesce(p_first, '') || '.' || coalesce(p_last, ''), 'ñÑáéíóúüÁÉÍÓÚÜ', 'nnaeiouuaeiouu')
  );
  base := regexp_replace(base, '[^a-z0-9.]', '', 'g');   -- drop spaces, hyphens, punctuation
  base := regexp_replace(base, '\.{2,}', '.', 'g');      -- collapse repeated dots
  base := trim(both '.' from base);
  base := left(base, 26);                                 -- leave room for a numeric suffix (max 30)
  if length(base) < 3 then
    base := 'user';
  end if;

  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n;
  end loop;

  return candidate;
end;
$$;

-- Same as 0002, but the username is generated instead of taken from the form.
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
    public.generate_username(meta ->> 'first_name', meta ->> 'last_name'),
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

-- No longer needed: users don't pick their own User ID.
drop function if exists public.is_username_available(text);
