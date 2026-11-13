@AGENTS.md

# reHUB

Master's school project built by 2 people. A web app that connects rehabilitation patients in the Philippines with providers (physiatrists, PTs, OTs, SLPs, rehab clinics), including HMO / PhilHealth coverage matching.

## Stack
- Next.js 16 (App Router, `src/` dir, TypeScript). `cacheComponents` is OFF in next.config.ts on purpose; do not add `"use cache"`. Read `node_modules/next/dist/docs/` before using unfamiliar APIs: this version differs from older Next.js (e.g. `middleware.ts` is now `src/proxy.ts`, `params`/`searchParams` are Promises).
- Tailwind CSS v4. Design tokens live in `src/app/globals.css` under `@theme`.
- Supabase (Postgres + Auth) via `@supabase/ssr`.
- Icons: `lucide-react`. Font: Inter (`@fontsource-variable/inter`).
- Deployed on Vercel.

## Ownership (avoid editing the other person's area without asking)
- **Person A, patient side:** `src/app/(site)/search`, `coverage`, `patient/**`, `(auth)/register` (patient form), clinic profile, appointment booking.
- **Person B, provider side:** `src/app/(site)/provider/**`, `(auth)/register` (provider form), referrals, fees & coverage.
- **Shared (change only after agreeing):** `src/components/layout/*`, `src/app/globals.css`, `src/lib/supabase/*`, `src/proxy.ts`, `supabase/migrations/*`, this file.

## Structure
```
src/
  app/
    (site)/        pages with full nav + footer (home, search, patient, provider...)
    (auth)/        pages with minimal header (get-started, login, register)
    auth/signout/  POST route to log out
  components/
    layout/        Logo, MainNav, AuthHeader, Footer
    ui/            reusable UI pieces
  lib/
    supabase/      client.ts (browser), server.ts (server), proxy.ts (session + route guard)
    constants.ts   static homepage content
    types.ts       shared types (Role, Profile)
  proxy.ts         runs on every request: refreshes session, protects /patient and /provider
supabase/migrations/  SQL files, numbered. Never edit an old one; add a new file.
```

## Conventions
- Server Components by default. Add `"use client"` only for state, effects, or event handlers.
- Forms: Server Actions + `useActionState` (see `src/app/(auth)/login`).
- Supabase in server code: `await createClient()` from `@/lib/supabase/server`. In client code: `createClient()` from `@/lib/supabase/client`.
- Use theme colors only: `brand`, `brand-hover`, `brand-soft`, `brand-mist`, `ink`, `body`, `muted`, `line`, `canvas`. No raw hex in components.
- Visual style: white cards, `rounded-2xl border border-line`, primary buttons `h-12 rounded-lg bg-brand text-white font-semibold`. Match the Figma mockups.
- Components: PascalCase files. Routes: kebab-case folders.
- Placeholder screens use `<ComingSoon />`. Replace it when building the real page.
- Every new table gets RLS enabled with explicit policies.
- Never commit `.env.local`.

## Roles & auth
- `profiles.role` is `patient` or `provider`, set at sign-up via `options.data.role`; a DB trigger creates the profile.
- `/patient/**` requires a patient, `/provider/**` requires a provider (enforced in `src/lib/supabase/proxy.ts`).
- After login: patients go to `/patient`, providers to `/provider`.

## Git workflow
- Never push to `main`. Branch per task: `feat/<screen>`, `fix/<thing>`.
- Pull `main` before starting. Small commits. Open a PR, the other person reviews, then merge.
- Run `npm run build` before opening a PR.
