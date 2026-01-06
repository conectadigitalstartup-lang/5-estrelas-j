-- Create table for visitor feedback and suggestions
CREATE TABLE public.visitor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('feedback', 'suggestion')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (visitors can submit without auth)
CREATE POLICY "Anyone can submit visitor feedback"
ON public.visitor_feedback
FOR INSERT
WITH CHECK (true);

-- Only service role can read (for admin review later)
CREATE POLICY "Service role can read visitor feedback"
ON public.visitor_feedback
FOR SELECT
USING (auth.role() = 'service_role');

-- Add AI usage counter to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS ai_usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_usage_reset_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create function to get AI limit based on plan
CREATE OR REPLACE FUNCTION public.get_ai_limit(plan_name TEXT, is_trial BOOLEAN)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Trial users get 2 free uses
  IF is_trial THEN
    RETURN 2;
  END IF;
  
  CASE plan_name
    WHEN 'pro' THEN RETURN 100;
    WHEN 'basico' THEN RETURN 20;
    ELSE RETURN 2; -- Default for unknown plans
  END CASE;
END;
$$;