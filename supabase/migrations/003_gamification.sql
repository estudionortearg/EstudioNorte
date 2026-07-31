-- supabase/migrations/003_gamification.sql

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS xp_value INTEGER NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS user_xp (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_course_xp (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  freeze_used_date DATE
);

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge global: solo 1 vez por usuario (course_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_global_unique
  ON user_badges (user_id, badge_id)
  WHERE course_id IS NULL;

-- Badge de curso: 1 vez por usuario por curso
CREATE UNIQUE INDEX IF NOT EXISTS user_badges_course_unique
  ON user_badges (user_id, badge_id, course_id)
  WHERE course_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course', 'discount', 'mentoria')),
  xp_cost INTEGER NOT NULL,
  stock INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_xp_own" ON user_xp FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_course_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_course_xp_own" ON user_course_xp FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_streaks_own" ON user_streaks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_read_all" ON badges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "badges_admin_write" ON badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_badges_own" ON user_badges FOR SELECT USING (auth.uid() = user_id);
-- NOTA: user_badges inserts son exclusivos del server client (bypasea RLS).
-- No se permite INSERT desde el cliente browser.

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rewards_read_active" ON rewards FOR SELECT USING (is_active = TRUE AND auth.role() = 'authenticated');
CREATE POLICY "rewards_admin_all" ON rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

ALTER TABLE reward_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reward_requests_own" ON reward_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reward_requests_insert" ON reward_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reward_requests_admin_update" ON reward_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
