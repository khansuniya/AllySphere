
-- Tighten the INSERT policy: only allow inserts where user_id matches auth.uid()
-- The trigger uses SECURITY DEFINER so it bypasses RLS anyway
DROP POLICY "System can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
