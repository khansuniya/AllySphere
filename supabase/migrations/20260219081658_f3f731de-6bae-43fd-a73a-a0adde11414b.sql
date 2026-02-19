
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'job',
  reference_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System/trigger can insert notifications (using security definer function)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to notify matching students when a job is posted
CREATE OR REPLACE FUNCTION public.notify_students_on_new_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_record RECORD;
  job_skills text[];
  poster_dept text;
BEGIN
  job_skills := COALESCE(NEW.skills, '{}'::text[]);
  
  -- Get the poster's department
  SELECT department INTO poster_dept FROM public.profiles WHERE user_id = NEW.posted_by;
  
  -- Find students whose department matches OR who have overlapping skills in alumni_details
  FOR student_record IN
    SELECT DISTINCT ur.user_id
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    LEFT JOIN public.alumni_details ad ON ad.user_id = ur.user_id
    WHERE ur.role = 'student'
      AND (
        -- Department match
        (p.department IS NOT NULL AND p.department = poster_dept AND poster_dept IS NOT NULL)
        OR
        -- Skills overlap (check student skills in alumni_details if they have any)
        (ad.skills IS NOT NULL AND ad.skills && job_skills AND array_length(job_skills, 1) > 0)
      )
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    VALUES (
      student_record.user_id,
      'New Job: ' || NEW.title,
      NEW.company || ' is hiring for ' || NEW.title || ' (' || NEW.job_type || ')',
      'job',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_new_job_notify_students
AFTER INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.notify_students_on_new_job();
