# reHUB

Find your rehabilitation team. Built with Next.js, Supabase and Tailwind.

## First-time setup (once, by one person)

1. **GitHub:** create a private repo `rehub`, then from this folder:
   ```bash
   git add -A && git commit -m "Initial setup: structure, homepage, login"
   git branch -M main
   git remote add origin https://github.com/<you>/rehub.git
   git push -u origin main
   ```
   Repo Settings > Collaborators > invite your teammate.
2. **Supabase:** create a project at supabase.com. In SQL Editor, run every file in `supabase/migrations/` in order, then (optional) `supabase/seed/demo_data.sql` for demo providers.
   - Authentication > URL Configuration: set **Site URL** to the Vercel URL and add `http://localhost:3000/**` and `https://*-re-hub.vercel.app/**` to **Redirect URLs** (needed for confirmation and reset e-mails).
   - For easier testing: Authentication > Sign In / Providers > Email > turn off "Confirm email".
3. **Vercel:** import the GitHub repo, add the two env vars below, deploy.

## Each developer

```bash
git clone https://github.com/<you>/rehub.git
cd rehub
npm install
cp .env.example .env.local   # paste the Supabase URL and anon key
npm run dev                   # http://localhost:3000
```

The UI runs without Supabase keys; login just shows a "not set up" message.

## Auth flows

| Flow | Route |
|---|---|
| Choose role | `/get-started` |
| Sign up (patient / provider tabs) | `/register?role=patient\|provider` |
| Confirmation e-mail sent | `/register/check-email` |
| E-mail link lands here | `/auth/confirm` |
| Log in | `/login?role=patient\|provider` |
| Forgot / reset password | `/forgot-password` → e-mail → `/reset-password` |

After login: patients → `/`, providers → `/provider` (dashboard).

To mark a provider as verified (until there's an admin screen):

```sql
update public.provider_details set verification_status = 'verified'
where profile_id = (select id from public.profiles where username = 'their.user.id');
```

## Routes

| Route | Status |
|---|---|
| `/` | Homepage (done) |
| `/get-started`, `/login`, `/register`, password reset | Done |
| `/provider` | Provider dashboard (done, queue/referrals empty until those tables exist) |
| `/provider/*` other pages | Placeholder |
| `/search`, `/coverage`, `/patient` | Placeholder |

See `CLAUDE.md` for conventions and who owns what.
