
-- Add work_mode column
ALTER TABLE public.jobs ADD COLUMN work_mode text NOT NULL DEFAULT 'on-site';

-- Add skills array column
ALTER TABLE public.jobs ADD COLUMN skills text[] DEFAULT '{}'::text[];

-- Add last_date_to_apply column
ALTER TABLE public.jobs ADD COLUMN last_date_to_apply date;
