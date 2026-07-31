-- Add pdf_url to lessons (video_url already exists from initial schema)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Storage bucket for course PDFs
-- Run this in Supabase Dashboard > Storage > New bucket:
-- Name: course-pdfs, Public: true
-- OR via SQL (requires pg_storage extension):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('course-pdfs', 'course-pdfs', true) ON CONFLICT DO NOTHING;

-- RLS for storage: only admins can upload, anyone can read
DROP POLICY IF EXISTS "Admin can upload PDFs" ON storage.objects;
CREATE POLICY "Admin can upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'course-pdfs'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Public can read PDFs" ON storage.objects;
CREATE POLICY "Public can read PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-pdfs');
