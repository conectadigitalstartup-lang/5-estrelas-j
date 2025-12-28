-- Add client_name column to feedbacks table
ALTER TABLE public.feedbacks 
ADD COLUMN client_name text;