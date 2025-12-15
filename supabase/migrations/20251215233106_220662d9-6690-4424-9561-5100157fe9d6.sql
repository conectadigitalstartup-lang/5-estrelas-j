-- Add notification preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_summary BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS negative_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS full_name TEXT;