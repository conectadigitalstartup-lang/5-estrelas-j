-- Adicionar colunas para snapshot inicial e atual do Google
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS initial_google_rating numeric,
ADD COLUMN IF NOT EXISTS initial_google_ratings_total integer,
ADD COLUMN IF NOT EXISTS current_google_rating numeric,
ADD COLUMN IF NOT EXISTS current_google_ratings_total integer;

-- Migrar dados existentes: copiar valores atuais para as novas colunas
UPDATE public.companies
SET 
  initial_google_rating = google_rating,
  initial_google_ratings_total = google_user_ratings_total,
  current_google_rating = google_rating,
  current_google_ratings_total = google_user_ratings_total
WHERE google_rating IS NOT NULL OR google_user_ratings_total IS NOT NULL;