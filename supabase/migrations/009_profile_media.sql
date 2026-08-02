-- Add banner_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url text;

-- Storage buckets (run manually if buckets don't exist yet)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('profile-banners', 'profile-banners', true) ON CONFLICT DO NOTHING;

-- RLS for avatars bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Avatars upload by owner'
  ) THEN
    CREATE POLICY "Avatars upload by owner" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Avatars update by owner" ON storage.objects
      FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Avatars public read" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- RLS for profile-banners bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Banners upload by owner'
  ) THEN
    CREATE POLICY "Banners upload by owner" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Banners update by owner" ON storage.objects
      FOR UPDATE USING (bucket_id = 'profile-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Banners public read" ON storage.objects
      FOR SELECT USING (bucket_id = 'profile-banners');
  END IF;
END $$;
