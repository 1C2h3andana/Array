# BizPilot AI

A responsive SaaS web app for small businesses, built with React, TypeScript, Vite and Tailwind CSS, backed by Supabase for authentication and data storage.

## Features

- Landing page and email/password authentication: signup, login, logout and password recovery
- Dashboard with sidebar navigation: Overview, Customers, Quotations, Invoices, Follow-ups, AI Assistant, Settings
- Each user gets their own business workspace, provisioned by a database trigger on signup
- Data stored in Supabase Postgres; every table is protected by Row Level Security so a user only accesses their own workspace
- Mobile-friendly layout with a hamburger navigation drawer, loading skeletons and empty states
- In-app assistant that answers questions computed locally from the workspace data (no live AI service)
- Settings persisted to the `businesses` table in the workspace

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL migrations from `supabase/migrations/` in order (SQL Editor → paste and run, or `supabase db push` with the CLI):
   - `20261017000000_init.sql` — tables, constraints, triggers (auto-provisions a profile + business workspace for every new auth user)
   - `20261017000100_rls.sql` — enables Row Level Security and creates the workspace-scoped policies
3. In Project Settings → API, copy the **Project URL** and the **anon public** key.
4. Create `.env.local` in the repo root:

   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   Only the anon key may be used in the browser — it is scoped by RLS. **Never** put the service-role key in a `VITE_` variable; it bypasses Row Level Security entirely.
5. If email confirmation is enabled (Supabase default), new signups will be asked to confirm their email before logging in. Password recovery emails redirect to `/reset-password` in this app.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint     # run oxlint
```

Without Supabase credentials the app renders a setup screen explaining the configuration above.

## Notes on honesty

- Payments are not processed anywhere in the app.
- The "AI assistant" is a rules-based answer engine computed in the browser from your workspace data — it is not a live AI integration, and the UI says so.
- Follow-up completion and settings changes are written to Supabase and scoped to your workspace by RLS.
