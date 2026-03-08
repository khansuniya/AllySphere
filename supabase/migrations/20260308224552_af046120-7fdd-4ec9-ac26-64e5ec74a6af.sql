-- Remove the overly permissive anon policy on profiles (exposes PII)
DROP POLICY IF EXISTS "Profiles publicly readable via view" ON public.profiles;

-- Recreate the view WITHOUT security_invoker so it runs as the owner and can access profiles
-- This way anon users can read the view (which excludes email/phone) without direct profiles access
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
  SELECT id, user_id, full_name, avatar_url, bio, graduation_year, department, linkedin_url, date_of_birth, created_at, updated_at
  FROM public.profiles;
