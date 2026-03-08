-- Allow anon users to SELECT from the profiles table so profiles_public view works for unauthenticated visitors
CREATE POLICY "Profiles publicly readable via view"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);
