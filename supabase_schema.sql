-- GoBabyTravel Phase 1 — Complete Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run

-- ── Extend profiles table ─────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS travel_interests text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS budget_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

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
CREATE POLICY IF NOT EXISTS "users_own_conversations" ON public.conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Conversation Messages ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user','assistant')),
  content         text NOT NULL,
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users_own_messages" ON public.conversation_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

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
CREATE POLICY IF NOT EXISTS "users_own_itineraries" ON public.itineraries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── App Config ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_config (
  key       text PRIMARY KEY,
  value     jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO public.app_config (key, value) VALUES (
  'latest',
  '{"latest_version":"2.0.0","min_version":"1.0.0","force_update":false,"update_url":"","message":"You are on the latest version."}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ── Daily Discovery ───────────────────────────────────────────────────────────
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

-- ── Admin CRM ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_finance_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          text NOT NULL,
  description   text NOT NULL,
  amount        numeric NOT NULL,
  currency      text DEFAULT 'INR',
  party_name    text NOT NULL,
  due_date      text,
  status        text DEFAULT 'pending',
  reminder_date text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_partners (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  category            text NOT NULL,
  revenue_model       text NOT NULL,
  revenue_share_ratio text,
  contact_number      text,
  email               text,
  notes               text,
  status              text DEFAULT 'active',
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   text NOT NULL,
  customer_phone  text,
  customer_email  text,
  customer_dob    text,
  trip_purpose    text,
  product_service text NOT NULL,
  cost            numeric NOT NULL DEFAULT 0,
  supplier_cost   numeric DEFAULT 0,
  margin          numeric DEFAULT 0,
  source          text DEFAULT '',
  lead_status     text DEFAULT 'lead_received',
  followup_date   text,
  booking_date    text,
  notes           text,
  donation_pct    int DEFAULT 0,
  donation_amount numeric DEFAULT 0,
  donation_status text DEFAULT 'pending',
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  description       text,
  category          text DEFAULT 'general',
  priority          text DEFAULT 'medium',
  status            text DEFAULT 'todo',
  due_date          text,
  notes             text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_goals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  description  text,
  category     text DEFAULT 'growth',
  target_date  text,
  status       text DEFAULT 'active',
  progress     int DEFAULT 0,
  notes        text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_targets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  category      text DEFAULT 'revenue',
  target_value  numeric DEFAULT 0,
  current_value numeric DEFAULT 0,
  unit          text DEFAULT '',
  deadline      text,
  status        text DEFAULT 'active',
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- Done. Refresh your Supabase dashboard to see all tables.
