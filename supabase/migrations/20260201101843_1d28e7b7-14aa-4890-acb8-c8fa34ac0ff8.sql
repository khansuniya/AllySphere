-- Add date_of_birth column to profiles table
ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;

-- Update the profiles_public view to include date_of_birth
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  bio,
  department,
  graduation_year,
  linkedin_url,
  created_at,
  updated_at,
  date_of_birth
FROM public.profiles;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;