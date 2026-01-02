-- Add column to track when the counter was last reset
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS photo_enhancements_reset_at timestamp with time zone DEFAULT now();

-- Create function to get remaining photo enhancements based on plan
CREATE OR REPLACE FUNCTION public.get_photo_limit(plan_name text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE plan_name
    WHEN 'pro' THEN RETURN 40;
    WHEN 'basico' THEN RETURN 10;
    ELSE RETURN 10; -- Default for trial users
  END CASE;
END;
$$;