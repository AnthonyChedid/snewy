# Snewy — Lebanon Ski Rental Aggregator (Web MVP)

Web-first MVP for ski rental request aggregation in Lebanon (Mzaar/Faraya/Laklouk).

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Router
- Supabase (Postgres/Auth/RLS)
- Playwright (later stories)

## Local dev

```bash
npm install
npm run dev
```

## Environment

Create `.env` from `.env.example`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Supabase CLI workflow

Supabase CLI version used during setup:

```bash
supabase --version
```

### Initialize (already done in this repo)

```bash
supabase init
```

### Link your hosted project

```bash
supabase link --project-ref <your_project_ref>
```

### Push migrations

```bash
supabase db push
```

### (Optional) Seed data

For seed SQL files (added in later stories), run in Supabase SQL Editor or via `supabase db reset` in local workflows.

## Story progress

- [x] Story 01 — bootstrap routes + Tailwind shell
- [x] Story 02 — Supabase client + env wiring
- [x] Story 03 — Supabase CLI init + migration baseline
