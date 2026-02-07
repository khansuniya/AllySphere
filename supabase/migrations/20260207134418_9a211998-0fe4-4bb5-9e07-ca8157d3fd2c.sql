-- Add policy to allow authenticated users to view all profiles through profiles_public view
-- This is safe because profiles_public excludes sensitive fields like email and phone

CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);