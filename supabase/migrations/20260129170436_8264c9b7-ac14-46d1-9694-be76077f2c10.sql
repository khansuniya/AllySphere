-- Create a public view that excludes sensitive PII (email, phone)
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    user_id,
    full_name,
    avatar_url,
    bio,
    graduation_year,
    department,
    linkedin_url,
    created_at,
    updated_at
  FROM public.profiles;

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create new policy: users can only SELECT their own profile directly
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);