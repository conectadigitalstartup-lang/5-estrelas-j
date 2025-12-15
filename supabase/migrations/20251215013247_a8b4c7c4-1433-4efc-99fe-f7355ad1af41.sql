-- Add trial and subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'inactive', 'cancelled')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add missing fields to companies table for onboarding
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS restaurant_type TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;