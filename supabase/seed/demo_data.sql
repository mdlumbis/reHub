-- reHUB demo data: verified providers, clinics, services, coverage and open slots.
-- Optional. Run AFTER all migrations. Safe to re-run: it skips providers that exist
-- and tops up open slots for the next 14 days.
-- Demo accounts can't log in (no password); they only fill search and profiles.

do $demo$
declare
  d record;
  v_id uuid;
  v_clinic uuid;
  v_day date;
  v_hour int;
begin
  for d in
    select * from (values
      -- email, first, last, profession, credentials, headline, years, modes, clinic, street, city, lat, lng, coverage slugs, services (name|min|fee;...)
      ('sofia.reyes@demo.rehub.test', 'Sofia', 'Reyes', 'Physiatrist', 'MD, FPARM', 'Musculoskeletal rehabilitation', 12,
       '{in_person,home}'::visit_mode[], 'Reyes Rehab Clinic', 'Paseo de Roxas', 'Makati City, Metro Manila', 14.5560, 121.0230,
       '{philhealth-cwd-mobility,maxicare,guarantee-letter}'::text[],
       'Initial physiatric consultation|45|1200;Follow-up consultation|20|900;Disability / PWD assessment|40|1500'),
      ('ramon.villaflor@demo.rehub.test', 'Ramon', 'Villaflor', 'Physiatrist', 'MD, FPARM', 'Rehabilitation Medicine, adult neurorehabilitation', 18,
       '{in_person,online}'::visit_mode[], 'Metro Rehab & Therapy Center', 'Chino Roces Ave.', 'Makati City, Metro Manila', 14.5490, 121.0170,
       '{philhealth-cwd-developmental,philhealth-cwd-mobility,philhealth-adult-z-morph,guarantee-letter,dswd,maxicare,intellicare,philcare}'::text[],
       'Initial physiatric consultation|45|1200;Follow-up consultation|20|900;Electrodiagnostic study (EMG-NCV)|60|4500;Botulinum toxin injection|30|3000'),
      ('elena.cruz@demo.rehub.test', 'Elena', 'Cruz', 'Physiatrist', 'MD, FPARM', 'Paediatric rehabilitation, cerebral palsy, prosthetics', 22,
       '{in_person,online}'::visit_mode[], 'QC Children''s Rehab Center', 'Timog Ave.', 'Quezon City, Metro Manila', 14.6350, 121.0340,
       '{philhealth-adult-z-morph,philhealth-cwd-developmental,guarantee-letter,maxicare}'::text[],
       'Paediatric rehab consultation|45|1300;Prosthetics and orthotics assessment|60|1800'),
      ('miguel.santos@demo.rehub.test', 'Miguel', 'Santos', 'Physical therapist', 'PTRP', 'Sports and post-operative physical therapy', 8,
       '{in_person,home}'::visit_mode[], 'Metro Rehab & Therapy Center', 'Chino Roces Ave.', 'Makati City, Metro Manila', 14.5490, 121.0170,
       '{philhealth-cwd-mobility,maxicare,intellicare,guarantee-letter}'::text[],
       'Physical therapy session|60|900;Home physical therapy session|60|1500'),
      ('andrea.lim@demo.rehub.test', 'Andrea', 'Lim', 'Physical therapist', 'PTRP', 'Stroke and neurologic physical therapy', 10,
       '{in_person}'::visit_mode[], 'Pasig Neuro PT Studio', 'Ortigas Ave.', 'Pasig City, Metro Manila', 14.5860, 121.0610,
       '{guarantee-letter,dswd,medicard}'::text[],
       'Physical therapy session|60|850;Gait training session|45|800'),
      ('carla.mendoza@demo.rehub.test', 'Carla', 'Mendoza', 'Occupational therapist', 'OTRP', 'Paediatric OT, sensory integration', 7,
       '{in_person,online}'::visit_mode[], 'Little Steps Therapy Center', 'Katipunan Ave.', 'Quezon City, Metro Manila', 14.6400, 121.0750,
       '{philhealth-cwd-developmental,guarantee-letter,maxicare}'::text[],
       'Occupational therapy session|60|950;Developmental assessment|90|2000'),
      ('paolo.garcia@demo.rehub.test', 'Paolo', 'Garcia', 'Speech-language pathologist', 'SLP', 'Speech, language and swallowing disorders', 9,
       '{in_person,online}'::visit_mode[], 'Little Steps Therapy Center', 'Katipunan Ave.', 'Quezon City, Metro Manila', 14.6400, 121.0750,
       '{philhealth-cwd-developmental,guarantee-letter,intellicare}'::text[],
       'Speech-language therapy session|45|1000;Swallowing evaluation|60|1500'),
      ('jose.navarro@demo.rehub.test', 'Jose', 'Navarro', 'Physical therapist', 'PTRP', 'Geriatric and cardiopulmonary rehabilitation', 15,
       '{in_person,home}'::visit_mode[], 'Manila Bay Rehab', 'Roxas Blvd.', 'Manila City, Metro Manila', 14.5730, 120.9820,
       '{philhealth-cwd-mobility,dswd,guarantee-letter,philcare}'::text[],
       'Physical therapy session|60|800;Cardiopulmonary rehab session|60|1100')
    ) as t(email, first_name, last_name, profession, credentials, headline, years, modes, clinic, street, city, lat, lng, coverage, services)
  loop
    select id into v_id from auth.users where email = d.email;

    if v_id is null then
      insert into auth.users (id, instance_id, email, aud, role, raw_user_meta_data, created_at, updated_at,
                              confirmation_token, recovery_token, email_change_token_new, email_change)
      values (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', d.email, 'authenticated', 'authenticated',
              jsonb_build_object('role', 'provider', 'first_name', d.first_name, 'last_name', d.last_name,
                                 'full_name', d.first_name || ' ' || d.last_name, 'profession', d.profession),
              now(), now(), '', '', '', '')
      returning id into v_id;   -- handle_new_user() creates profiles + provider_details

      update provider_details set
        credentials = d.credentials, headline = d.headline, years_experience = d.years, visit_modes = d.modes,
        about = 'Demo profile. ' || d.first_name || ' focuses on ' || lower(d.headline) || '.',
        prc_license_number = lpad((floor(random() * 9000000) + 1000000)::text, 7, '0'),
        prc_registered_name = d.first_name || ' ' || d.last_name,
        prc_expiry = current_date + 700,
        prc_status = 'verified',
        parm_status = case when d.profession = 'Physiatrist' then 'verified'::verification_status end,
        philhealth_status = 'verified',
        verification_status = 'verified'
      where profile_id = v_id;

      -- Clinic (shared if another demo provider already created it)
      select id into v_clinic from clinics where name = d.clinic;
      if v_clinic is null then
        insert into clinics (name, street_address, location, lat, lng, phone, established_year, clinician_count, address_verified, created_by)
        values (d.clinic, d.street, d.city, d.lat, d.lng, '+63 2 8' || lpad((floor(random() * 9999999))::text, 7, '0'),
                2005 + floor(random() * 15)::int, 5 + floor(random() * 20)::int, true, v_id)
        returning id into v_clinic;
      end if;
      insert into provider_clinics (provider_id, clinic_id, schedule_text, visit_modes, is_primary)
      values (v_id, v_clinic, 'Mon–Fri · 9 AM–5 PM', d.modes, true);

      insert into provider_coverage (provider_id, coverage_id)
      select v_id, id from coverage_options where slug = any (d.coverage);

      insert into services (provider_id, name, duration_min, starting_fee, sort_order)
      select v_id, split_part(s, '|', 1), split_part(s, '|', 2)::smallint, split_part(s, '|', 3)::numeric, ord
      from unnest(string_to_array(d.services, ';')) with ordinality as x(s, ord);

      update provider_details set
        fee_min = (select min(starting_fee) from services where provider_id = v_id),
        fee_max = (select max(starting_fee) from services where provider_id = v_id)
      where profile_id = v_id;
    else
      select clinic_id into v_clinic from provider_clinics where provider_id = v_id and is_primary;
    end if;

    -- Open slots: weekdays, 9 AM / 1 PM / 4 PM Manila time, next 14 days (skips existing).
    for v_day in select generate_series(current_date, current_date + 13, interval '1 day')::date loop
      continue when extract(isodow from v_day) > 5;
      foreach v_hour in array array[9, 13, 16] loop
        continue when random() < 0.25;   -- leave some gaps so the calendar looks real
        insert into availability_slots (provider_id, clinic_id, starts_at, duration_min, mode)
        values (v_id, v_clinic, (v_day + make_time(v_hour, 0, 0)) at time zone 'Asia/Manila', 60, 'in_person')
        on conflict (provider_id, starts_at) do nothing;
      end loop;
    end loop;
  end loop;
end
$demo$;
