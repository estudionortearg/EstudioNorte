-- supabase/migrations/004_certificates.sql

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verification_code TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  UNIQUE(user_id, course_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Cualquier persona puede leer un certificado por su código (ruta pública /verificar/[code])
CREATE POLICY "certificates_public_read"
  ON certificates FOR SELECT
  USING (true);

-- No INSERT policy para usuarios autenticados:
-- la emisión ocurre server-side vía admin client (service role bypasea RLS)
