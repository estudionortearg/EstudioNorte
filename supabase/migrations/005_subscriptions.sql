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
DROP POLICY IF EXISTS "subscriptions_owner_read" ON subscriptions;
CREATE POLICY "subscriptions_owner_read"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Solo service role escribe (admin client bypasea RLS)
-- No INSERT/UPDATE policy para authenticated users

-- C1: Bloquear UPDATE de plan e is_admin por usuarios normales.
-- La política original (002_rls_policies.sql) no tenía WITH CHECK ni restricción de columna,
-- permitiendo a cualquier usuario autenticado auto-asignarse plan o is_admin.
-- REVOKE a nivel de columna es la protección más fuerte (no depende de RLS).
REVOKE UPDATE (plan, is_admin) ON profiles FROM authenticated, anon;

-- Reemplazar política de UPDATE de profiles para que no permita cambiar plan ni is_admin
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND plan     = (SELECT p.plan     FROM profiles p WHERE p.id = auth.uid())
    AND is_admin = (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid())
  );
