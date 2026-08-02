-- Community posts (foro general + preguntas de lección)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- foro general: category set, lesson_id null
  -- pregunta de lección: lesson_id set, category null
  category text CHECK (category IN ('general','branding','ia','trabajos','dudas')),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published','pending','hidden')),
  is_pinned boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT false,
  solution_reply_id uuid,
  reply_count integer NOT NULL DEFAULT 0,
  reaction_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT category_or_lesson CHECK (
    (category IS NOT NULL AND lesson_id IS NULL) OR
    (category IS NULL AND lesson_id IS NOT NULL)
  )
);

-- Replies
CREATE TABLE IF NOT EXISTS public.community_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  is_bot boolean NOT NULL DEFAULT false,
  reaction_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FK solution reply (after replies table exists)
ALTER TABLE public.community_posts
  ADD CONSTRAINT fk_solution_reply
  FOREIGN KEY (solution_reply_id) REFERENCES public.community_replies(id) ON DELETE SET NULL;

-- Reactions (like on post OR reply, not both)
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT one_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Moderation log
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES public.community_replies(id) ON DELETE CASCADE,
  reason text,
  action text NOT NULL CHECK (action IN ('flagged','hidden','approved','welcomed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_lesson ON public.community_posts(lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_replies_post ON public.community_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reactions_post ON public.community_reactions(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_community_reactions_reply ON public.community_reactions(reply_id) WHERE reply_id IS NOT NULL;

-- Counters via triggers
CREATE OR REPLACE FUNCTION public.community_reply_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_reply_count ON public.community_replies;
CREATE TRIGGER trg_reply_count
  AFTER INSERT OR DELETE ON public.community_replies
  FOR EACH ROW EXECUTE FUNCTION public.community_reply_count();

CREATE OR REPLACE FUNCTION public.community_reaction_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE public.community_posts SET reaction_count = reaction_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.community_replies SET reaction_count = reaction_count + 1 WHERE id = NEW.reply_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE public.community_posts SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.post_id;
    ELSE
      UPDATE public.community_replies SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.reply_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;
DROP TRIGGER IF EXISTS trg_reaction_count ON public.community_reactions;
CREATE TRIGGER trg_reaction_count
  AFTER INSERT OR DELETE ON public.community_reactions
  FOR EACH ROW EXECUTE FUNCTION public.community_reaction_count();

-- RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Posts: published visible to all authenticated; own hidden/pending visible to owner; admin sees all
CREATE POLICY "Community posts readable" ON public.community_posts
  FOR SELECT USING (
    status = 'published' OR user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Community posts insert" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Community posts update own" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Replies: visible if parent post is visible
CREATE POLICY "Community replies readable" ON public.community_replies
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Community replies insert" ON public.community_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_bot = true);
CREATE POLICY "Community replies update own" ON public.community_replies
  FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Reactions
CREATE POLICY "Community reactions readable" ON public.community_reactions
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Community reactions insert" ON public.community_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Community reactions delete own" ON public.community_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Moderation logs: admin only
CREATE POLICY "Moderation logs admin" ON public.moderation_logs
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- New badges for community
INSERT INTO public.badges (slug, name, emoji, description, condition_type, condition_value, is_active)
VALUES
  ('primer_aporte', 'Primer Aporte', '🌱', 'Publicaste tu primera pregunta o hilo en la comunidad', 'community_first_post', 1, true),
  ('guia_comunidad', 'Guía de la Comunidad', '⭐', 'Tu respuesta fue marcada como solución', 'community_solution', 1, true),
  ('colaborador', 'Colaborador', '🤝', 'Respondiste 10 preguntas en la comunidad', 'community_replies', 10, true)
ON CONFLICT (slug) DO NOTHING;
