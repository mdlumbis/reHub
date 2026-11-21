# Wireframe vs Netlify prototype

Comparison of our Figma wireframes against the clickable prototype at https://rehub227.netlify.app/, plus where our real app (`rehub` repo) stands today.

- **Wireframe** = Figma mockups in the claude.ai project (left column)
- **Prototype** = rehub227.netlify.app, static HTML, sample data only (right column)
- **Our app** = the Next.js + Supabase build on Vercel

Captured 21 Nov 2026.

## TL;DR

1. The prototype is **wider** than the wireframe. It adds a role picker with illustrations, Find a colleague, a My referrals page (Received / Sent / Archived), Inbox, a full Schedule grid, a Patients table, a 3-section provider profile (info, PRC licensure, education) and "not yet verified" banners.
2. The wireframe is **deeper** on a few screens: the dashboard queue has live statuses (In room / Next / Waiting), fees & coverage is its own page with a Verification card, and registration has a fee range.
3. Visual language differs: wireframe is **teal on warm grey**; prototype is **blue to green gradient on a dark navy sidebar**. We need to pick one. Our app currently follows the prototype palette.
4. Biggest gaps in our app vs both: **referrals** (send, inbox, accept), **profile and fees editing**, **schedule**, **patients list**.

---

## 1. Role selection / welcome

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype</th></tr><tr>
<td><img src="images/wireframe/role-selection.png" width="100%"></td>
<td><img src="images/prototype/welcome.jpg" width="100%"></td>
</tr></table>

- Prototype adds illustrations per role and a row of profession chips (Rehab clinics, Physiatrists, PTs, OTs, SLPs).
- Same two-choice structure. **Our app:** done (`/get-started`).

## 2. Provider sign-up

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype (step 1, account)</th></tr><tr>
<td><img src="images/wireframe/provider-registration.png" width="100%"></td>
<td><img src="images/prototype/provider-signup-1.jpg" width="100%"></td>
</tr><tr><th>Prototype (step 2, professional details)</th><th>Prototype (done)</th></tr><tr>
<td><img src="images/prototype/provider-signup-2.jpg" width="100%"></td>
<td><img src="images/prototype/provider-signup-done.jpg" width="100%"></td>
</tr></table>

| Item | Wireframe | Prototype | Our app |
|---|---|---|---|
| Steps | 1 page | 2 steps + success screen | 1 page |
| User ID field | Yes (typed) | No | No, auto-generated |
| Profession picker | Dropdown | 4 radio cards | Dropdown |
| Password + confirm | Not shown | Yes, with rules | Yes |
| PRC number + expiry | Next step ("verify") | In step 2 | Yes |
| Specializations | At sign-up | Moved to profile | At sign-up |
| Fee range min/max | Yes | No (fees per service later) | No |
| Birthday, contact (+63) | No | Yes | Contact yes |

**To decide:** keep specializations at sign-up or move to profile like the prototype. Drop the fee range (per-service fees are better).

## 3. Provider dashboard

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype</th></tr><tr>
<td><img src="images/wireframe/provider-dashboard.png" width="100%"></td>
<td><img src="images/prototype/provider-dashboard.jpg" width="100%"></td>
</tr></table>

| Item | Wireframe | Prototype | Our app |
|---|---|---|---|
| "Profile not visible yet" banner | No | Yes, 2-step checklist + CTA | Partial (pending status) |
| Stat cards | 2 (In clinic, New referrals) | 4 (+ Referrals sent, Unread messages) | Placeholder |
| Today's queue | Live statuses: In room, Next, Waiting | List, empty state | Placeholder |
| Referral inbox card | Yes | Replaced by "Referrals you sent" | No |
| Top nav + sidebar | Sidebar only | Both (duplicated) | Sidebar |

**To decide:** keep the wireframe's queue statuses (they are the most useful thing on this page). Prototype duplicates nav in top bar and sidebar; pick one.

## 4. Send a referral

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype (top)</th></tr><tr>
<td><img src="images/wireframe/send-referral.png" width="100%"></td>
<td><img src="images/prototype/send-referral-top.jpg" width="100%"></td>
</tr><tr><th></th><th>Prototype (bottom: coverage to apply)</th></tr><tr>
<td></td>
<td><img src="images/prototype/send-referral-coverage.jpg" width="100%"></td>
</tr></table>

- Same 7 fields and live preview on both. Good alignment.
- Prototype differences: **Refer to** picks a specific person (with distance), not just a profession; Validity and Follow-up are **dropdowns**; adds a **Coverage to apply** section (PhilHealth package, HMO, GL, DSWD).
- **Our app:** DB is ready (`referrals` table, `to_profession` + optional `to_provider_id`), no screen yet.

## 5. Prototype-only provider pages

<table><tr><th width="50%">Find a colleague</th><th width="50%">My referrals</th></tr><tr>
<td><img src="images/prototype/find-colleague.jpg" width="100%"></td>
<td><img src="images/prototype/my-referrals.jpg" width="100%"></td>
</tr><tr><th>Schedule</th><th>Patients</th></tr><tr>
<td><img src="images/prototype/schedule.jpg" width="100%"></td>
<td><img src="images/prototype/patients.jpg" width="100%"></td>
</tr><tr><th>Inbox</th><th></th></tr><tr>
<td><img src="images/prototype/inbox.jpg" width="100%"></td><td></td>
</tr></table>

| Page | What it does | Wireframe? | Our app |
|---|---|---|---|
| Find a colleague | Directory of verified providers, filter chips, "Refer a patient" | No | No (search RPC can power it) |
| My referrals | Tabs: Received / Sent / Archived; accept pulls patient into schedule | Only "Inbox" in sidebar | No (`respond_to_referral` exists) |
| Schedule | Week grid, Mon to Fri, 8 AM to 4 PM | Sidebar link only | No |
| Patients | Table: birthday/age, diagnosis, coverage, last/next visit | Sidebar link only | No (`patient_records` exists) |
| Inbox | Messages with patients and colleagues (empty shell) | No | No, no messaging table |

## 6. Provider profile, fees & coverage

<table><tr><th width="50%">Wireframe (Fees & coverage page)</th><th width="50%">Prototype (My reHUB profile, section 1)</th></tr><tr>
<td><img src="images/wireframe/fees-and-coverage.png" width="100%"></td>
<td><img src="images/prototype/profile-info.jpg" width="100%"></td>
</tr><tr><th>Prototype (section 2, Licensure)</th><th>Prototype (section 3, Education; fees and coverage collapsed)</th></tr><tr>
<td><img src="images/prototype/profile-licensure.jpg" width="100%"></td>
<td><img src="images/prototype/profile-education.jpg" width="100%"></td>
</tr></table>

| Item | Wireframe | Prototype | Our app |
|---|---|---|---|
| Structure | Separate "My profile" and "Fees & coverage" pages | One page, 3 numbered accordions + fees/coverage collapsed below | No editor yet |
| Photo upload (2x2) | No | Yes | Static avatars |
| Short intro (200 chars) + specialty tags | No | Yes, with suggestions | `headline`, `about` columns |
| PRC ID photo upload | No | Yes, "Pending review" | No storage yet |
| Education (college, med school, residency, other) | No | Yes | `credentials` text only |
| Per-service fee table | Yes, editable, "+ Add service" | Collapsed section | `services` table, no editor |
| Coverage checkboxes | Yes, incl. HMO list | Collapsed section | `provider_coverage`, no editor |
| Verification card (PRC, PARM, address, PhilHealth) | Yes | Only PRC status | `*_status` columns |
| Patient preview card / button | Card | "Preview as patient" button | No |

**To decide:** one long page (prototype) vs two pages (wireframe). Education and PRC photo need Supabase Storage.

## 7. Patient landing

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype</th></tr><tr>
<td><img src="images/wireframe/patient-landing.png" width="100%"></td>
<td><img src="images/prototype/patient-landing.jpg" width="100%"></td>
</tr></table>

- Prototype puts **login/sign-up on the landing page** next to search, adds count tiles (clinics, physiatrists, PTs, OTs, SLPs), "Who do you need?" cards and a "PhilHealth accredited packages" section.
- **Our app:** search hero + hero carousel; login is a separate page.

## 8. Search results

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype</th></tr><tr>
<td><img src="images/wireframe/search-results.png" width="100%"></td>
<td><img src="images/prototype/search-results.jpg" width="100%"></td>
</tr></table>

- Close match. Prototype adds "Within 5 km, ranked first" divider, filter counts, earliest-slot box and two CTAs per card.
- **Our app:** done (filters, distance ranking, earliest slot, min fee).

## 9. Clinic / provider public profile

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype</th></tr><tr>
<td><img src="images/wireframe/clinic-profile.png" width="100%"></td>
<td><img src="images/prototype/clinic-profile.jpg" width="100%"></td>
</tr></table>

- Prototype adds **Message clinic**, a location card, and a "Verified on reHUB" card.
- **Our app:** done, minus messaging and map.

## 10. Appointment booking

<table><tr><th width="50%">Wireframe</th><th width="50%">Prototype</th></tr><tr>
<td><img src="images/wireframe/appointment-booking.png" width="100%"></td>
<td><img src="images/prototype/appointment-booking.jpg" width="100%"></td>
</tr></table>

- Prototype summary is read-only; asks for full name, mobile and reason for visit.
- **Our app:** ahead of both. Date, time, mode and service are editable (limited to that provider), payment options come from the provider's coverage, and there is a cancellation flow with reasons and a 2-hour cutoff.

---

## Summary: what to build next

| Priority | Feature | Source | Owner |
|---|---|---|---|
| 1 | Provider profile editor (info, licensure, education) | Prototype | B |
| 1 | Fees & coverage editor | Wireframe | B |
| 2 | Send a referral + My referrals (received/sent, accept/decline) | Both | B |
| 2 | Find a colleague | Prototype | B |
| 3 | Dashboard real data (queue with statuses, stat cards) | Wireframe | B |
| 3 | Schedule week view, Patients table | Prototype | B |
| 4 | "Reason for visit" field on booking | Prototype | A |
| 4 | Landing: count tiles, "Who do you need?", PhilHealth packages | Prototype | A |
| Later | Inbox / messaging, photo uploads (needs Storage) | Prototype | Shared |

## Questions for the team

1. Which visual style wins: wireframe teal or prototype blue/green gradient?
2. Provider profile: one long page or separate Profile and Fees & coverage pages?
3. Specializations: at sign-up or in profile?
4. Is messaging (Inbox, Message clinic) in scope for the class deadline?
5. Do we need education history, or is PRC + specialty enough for verification?
