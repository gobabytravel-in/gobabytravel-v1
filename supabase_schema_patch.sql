-- GoBabyTravel — MISSING TABLES PATCH
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- These tables are REQUIRED for Passport screen to work.

-- ── Countries Visited ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.countries_visited (
  id          bigserial PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  country_name text NOT NULL,
  visited_at  timestamptz DEFAULT now()
);
ALTER TABLE public.countries_visited ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users_own_countries" ON public.countries_visited
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Saved Dreams ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_dreams (
  id               bigserial PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id   text NOT NULL,
  destination_name text NOT NULL,
  destination_country text,
  saved_at         timestamptz DEFAULT now()
);
ALTER TABLE public.saved_dreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users_own_dreams" ON public.saved_dreams
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Profiles — ensure all required columns exist ───────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_style text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS passport_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count int DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_interests text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS budget_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

-- ── Ensure profiles table has RLS and auto-create trigger ─────────────────
-- (Skip if already done in initial schema)
-- CREATE POLICY IF NOT EXISTS "users_own_profile" ON public.profiles
--   FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
