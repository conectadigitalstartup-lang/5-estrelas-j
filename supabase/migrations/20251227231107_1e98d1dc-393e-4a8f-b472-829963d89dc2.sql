-- Add Google Places rating data columns to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS google_rating numeric,
ADD COLUMN IF NOT EXISTS google_user_ratings_total integer;