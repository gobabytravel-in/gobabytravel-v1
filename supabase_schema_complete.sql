-- ============================================================
-- GoBabyTravel — COMPLETE SUPABASE SCHEMA (V1)
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- Fully PostgreSQL / Supabase compatible. Safe to re-run (idempotent).
-- ============================================================

-- ── Profiles (extends Supabase auth.users) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text,
  full_name         text,
  avatar_url        text,
  country           text,
  travel_style      text,
  passport_id       text,
  last_login        timestamptz,
  login_count       int DEFAULT 0,
  languages         text[],
  travel_interests  text[],
  budget_preference text,
  bio               text,
  created_at        timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Each user can only read and write their own profile row.
DROP POLICY IF EXISTS "profiles_owner_all" ON public.profiles;
CREATE POLICY "profiles_owner_all" ON public.profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Countries Visited ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.countries_visited (
  id           bigserial PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  country_name text NOT NULL,
  visited_at   timestamptz DEFAULT now()
);
ALTER TABLE public.countries_visited ENABLE ROW LEVEL SECURITY;
-- Each user can only read and write their own rows.
DROP POLICY IF EXISTS "countries_visited_owner_all" ON public.countries_visited;
CREATE POLICY "countries_visited_owner_all" ON public.countries_visited
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Saved Dreams ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_dreams (
  id                  bigserial PRIMARY KEY,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id      text NOT NULL,
  destination_name    text NOT NULL,
  destination_country text,
  saved_at            timestamptz DEFAULT now()
);
ALTER TABLE public.saved_dreams ENABLE ROW LEVEL SECURITY;
-- Each user can only read and write their own rows.
DROP POLICY IF EXISTS "saved_dreams_owner_all" ON public.saved_dreams;
CREATE POLICY "saved_dreams_owner_all" ON public.saved_dreams
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Conversations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  destination text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
-- Each user can only read and write their own conversations.
DROP POLICY IF EXISTS "conversations_owner_all" ON public.conversations;
CREATE POLICY "conversations_owner_all" ON public.conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Conversation Messages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
-- A user can access messages only in their own conversations.
DROP POLICY IF EXISTS "conversation_messages_owner_all" ON public.conversation_messages;
CREATE POLICY "conversation_messages_owner_all" ON public.conversation_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- Index to speed up message lookups by conversation.
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id
  ON public.conversation_messages (conversation_id);

-- ── Itineraries ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.itineraries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  destination   text NOT NULL,
  duration_days int,
  content       jsonb NOT NULL DEFAULT '[]',
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
-- Each user can only read and write their own itineraries.
DROP POLICY IF EXISTS "itineraries_owner_all" ON public.itineraries;
CREATE POLICY "itineraries_owner_all" ON public.itineraries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Daily Discovery ───────────────────────────────────────────────────────────
-- Public read (any visitor can see today's destination).
-- No public write — only the backend service role can insert/update.
CREATE TABLE IF NOT EXISTS public.daily_discovery (
  id               bigserial PRIMARY KEY,
  date             date UNIQUE NOT NULL,
  destination      text NOT NULL,
  tagline          text,
  cultural_insight text,
  hidden_gem       text,
  travel_fact      text,
  best_for         text[],
  quick_stats      jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);
ALTER TABLE public.daily_discovery ENABLE ROW LEVEL SECURITY;
-- Anyone (including unauthenticated visitors) can read daily discovery rows.
DROP POLICY IF EXISTS "daily_discovery_public_read" ON public.daily_discovery;
CREATE POLICY "daily_discovery_public_read" ON public.daily_discovery
  FOR SELECT
  USING (true);
-- No write policy: the backend service role bypasses RLS, so it can still write.

-- ── App Config ────────────────────────────────────────────────────────────────
-- Public read (app version check on startup).
-- No public write — only the backend service role can update.
CREATE TABLE IF NOT EXISTS public.app_config (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
-- Anyone (including unauthenticated clients) can read app config.
DROP POLICY IF EXISTS "app_config_public_read" ON public.app_config;
CREATE POLICY "app_config_public_read" ON public.app_config
  FOR SELECT
  USING (true);
-- No write policy: the backend service role bypasses RLS, so it can still write.

-- Seed the initial app config row.
INSERT INTO public.app_config (key, value) VALUES (
  'latest',
  '{"latest_version":"2.0.0","min_version":"1.0.0","force_update":false,"update_url":"","message":"You are on the latest version."}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ── Bump login meta helper ────────────────────────────────────────────────────
-- Called by the backend (service role) to update last_login and login_count.
CREATE OR REPLACE FUNCTION public.bump_login_meta(uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET last_login  = now(),
      login_count = COALESCE(login_count, 0) + 1
  WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DONE. All 8 tables have RLS enabled.
-- daily_discovery and app_config: public SELECT, no public writes.
-- profiles, countries_visited, saved_dreams, conversations,
-- conversation_messages, itineraries: owner-only access.
-- Refresh the Supabase dashboard Table Editor to see all tables.
-- ============================================================
