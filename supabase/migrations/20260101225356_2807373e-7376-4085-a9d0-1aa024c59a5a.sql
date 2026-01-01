-- PARTE 1: Adicionar coluna whatsapp_number na tabela companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- PARTE 2: Criar índice único no google_place_id (anti-fraude)
-- Nota: já existe verificação no código, mas vamos garantir no banco
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_google_place_id_unique 
ON public.companies (google_place_id) 
WHERE google_place_id IS NOT NULL;

-- PARTE 3: Criar índice único no google_review_link (anti-fraude adicional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_google_review_link_unique 
ON public.companies (google_review_link) 
WHERE google_review_link IS NOT NULL;