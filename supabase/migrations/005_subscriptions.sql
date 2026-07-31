-- supabase/migrations/005_subscriptions.sql

-- Agregar columna plan a profiles (fuente de verdad para gating)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'norte', 'norte_pro'));

-- Agregar is_admin si no existe (puede haber sido creada manualmente)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Tabla subscriptions: lifecycle de suscripciones MP
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('norte', 'norte_pro')),
  mp_preapproval_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'paused', 'cancelled')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Solo el dueño puede leer su suscripción
CREATE POLICY IF NOT EXISTS "subscriptions_owner_read"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Solo service role escribe (admin client bypasea RLS)
-- No INSERT/UPDATE policy para authenticated users
