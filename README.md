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
2. **Supabase:** create a project at supabase.com. In SQL Editor, run `supabase/migrations/0001_profiles.sql`.
   For easier testing: Authentication > Sign In / Providers > Email > turn off "Confirm email".
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

## Test login

Until registration is built, create users in Supabase: Authentication > Users > Add user, then run:

```sql
update public.profiles set role = 'provider', full_name = 'Juan Reyes' where email = 'provider@test.com';
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"role":"provider"}' where email = 'provider@test.com';
```

(Users default to `patient`.)

## Routes

| Route | Status |
|---|---|
| `/` | Homepage (done) |
| `/get-started` | Role selection (done) |
| `/login?role=patient\|provider` | Login (done) |
| `/register?role=...` | Placeholder |
| `/search`, `/coverage` | Placeholder |
| `/patient` | Placeholder, patients only |
| `/provider` | Placeholder, providers only |

See `CLAUDE.md` for conventions and who owns what.
