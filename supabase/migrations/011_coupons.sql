-- 011_coupons.sql — Sistema de cupones y referidos

-- Tabla principal de cupones
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed_ars', 'fixed_usd')),
  value NUMERIC NOT NULL CHECK (value > 0),
  -- null = aplica a todos los cursos
  course_slugs TEXT[] DEFAULT NULL,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- null = cupón de admin; user_id = cupón de referido
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- recompensa para el referidor cuando alguien usa su código
  referrer_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registro de usos
CREATE TABLE IF NOT EXISTS coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  discount_amount_ars NUMERIC DEFAULT 0,
  discount_amount_usd NUMERIC DEFAULT 0,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id, course_slug)
);

-- Código de referido personal en profiles (generado al registrarse)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_referrer ON coupons(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon ON coupon_uses(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user ON coupon_uses(user_id);

-- RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

-- coupons: solo admins escriben, todos los autenticados pueden leer (para validar)
CREATE POLICY "coupons_read" ON coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL TO service_role USING (true);

-- coupon_uses: usuario ve los suyos; service_role hace todo
CREATE POLICY "coupon_uses_own" ON coupon_uses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "coupon_uses_service" ON coupon_uses FOR ALL TO service_role USING (true);

-- Trigger: generar referral_code único al crear el perfil
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
  attempts INT := 0;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      code := upper(substring(md5(random()::text || NEW.id::text), 1, 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = code);
      attempts := attempts + 1;
      EXIT WHEN attempts > 10;
    END LOOP;
    NEW.referral_code := code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Generar códigos para perfiles existentes que no tengan uno
UPDATE profiles
SET referral_code = upper(substring(md5(random()::text || id::text), 1, 8))
WHERE referral_code IS NULL;
