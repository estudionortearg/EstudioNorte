-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses: published courses are public
CREATE POLICY "Published courses are public"
  ON courses FOR SELECT USING (is_published = true);

-- Modules: public if course is published
CREATE POLICY "Modules of published courses are public"
  ON modules FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.is_published = true
    )
  );

-- Lessons: public if free_preview, else requires enrollment
CREATE POLICY "Free preview lessons are public"
  ON lessons FOR SELECT USING (is_free_preview = true);

CREATE POLICY "Enrolled users can view lessons"
  ON lessons FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN modules m ON m.id = lessons.module_id
      WHERE e.course_id = m.course_id
      AND e.user_id = auth.uid()
      AND (e.expires_at IS NULL OR e.expires_at > NOW())
    )
  );

-- Enrollments: users see their own
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT USING (auth.uid() = user_id);

-- Progress: users see and write their own
CREATE POLICY "Users can view own progress"
  ON progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: users see their own
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT USING (auth.uid() = user_id);
