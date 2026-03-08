
-- Create mentorship forums table
CREATE TABLE public.mentorship_forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumni_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create forum members table
CREATE TABLE public.forum_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL REFERENCES public.mentorship_forums(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(forum_id, user_id)
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL REFERENCES public.mentorship_forums(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  post_type text NOT NULL DEFAULT 'discussion',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mentorship_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is a forum member
CREATE OR REPLACE FUNCTION public.is_forum_member(_user_id uuid, _forum_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.forum_members
    WHERE user_id = _user_id AND forum_id = _forum_id
  )
$$;

-- Helper function: check if user is forum owner
CREATE OR REPLACE FUNCTION public.is_forum_owner(_user_id uuid, _forum_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.mentorship_forums
    WHERE alumni_id = _user_id AND id = _forum_id
  )
$$;

-- RLS: mentorship_forums
CREATE POLICY "Forum members can view forums" ON public.mentorship_forums
  FOR SELECT USING (public.is_forum_member(auth.uid(), id) OR alumni_id = auth.uid());

CREATE POLICY "Alumni can create forums" ON public.mentorship_forums
  FOR INSERT WITH CHECK (auth.uid() = alumni_id AND (has_role(auth.uid(), 'alumni') OR has_role(auth.uid(), 'admin')));

CREATE POLICY "Forum owner can update" ON public.mentorship_forums
  FOR UPDATE USING (auth.uid() = alumni_id);

CREATE POLICY "Forum owner can delete" ON public.mentorship_forums
  FOR DELETE USING (auth.uid() = alumni_id);

-- RLS: forum_members
CREATE POLICY "Members can view forum members" ON public.forum_members
  FOR SELECT USING (public.is_forum_member(auth.uid(), forum_id) OR public.is_forum_owner(auth.uid(), forum_id));

CREATE POLICY "Forum owner can add members" ON public.forum_members
  FOR INSERT WITH CHECK (public.is_forum_owner(auth.uid(), forum_id));

CREATE POLICY "Forum owner can remove members" ON public.forum_members
  FOR DELETE USING (public.is_forum_owner(auth.uid(), forum_id));

-- RLS: forum_posts
CREATE POLICY "Members can view posts" ON public.forum_posts
  FOR SELECT USING (public.is_forum_member(auth.uid(), forum_id));

CREATE POLICY "Members can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id AND public.is_forum_member(auth.uid(), forum_id));

CREATE POLICY "Authors can update posts" ON public.forum_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete posts" ON public.forum_posts
  FOR DELETE USING (auth.uid() = author_id);

-- RLS: forum_comments
CREATE POLICY "Members can view comments" ON public.forum_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.forum_posts fp
      WHERE fp.id = post_id AND public.is_forum_member(auth.uid(), fp.forum_id)
    )
  );

CREATE POLICY "Members can create comments" ON public.forum_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.forum_posts fp
      WHERE fp.id = post_id AND public.is_forum_member(auth.uid(), fp.forum_id)
    )
  );

CREATE POLICY "Authors can delete comments" ON public.forum_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Updated_at triggers
CREATE TRIGGER update_mentorship_forums_updated_at
  BEFORE UPDATE ON public.mentorship_forums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
