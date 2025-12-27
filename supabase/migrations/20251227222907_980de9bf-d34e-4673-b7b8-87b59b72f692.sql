-- Adicionar campo place_id à tabela companies para identificação única do Google Places
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS google_place_id text;

-- Criar índice único no place_id (permite null para empresas existentes)
CREATE UNIQUE INDEX IF NOT EXISTS companies_google_place_id_unique 
ON public.companies (google_place_id) 
WHERE google_place_id IS NOT NULL;

-- Atualizar função de verificação para usar place_id
CREATE OR REPLACE FUNCTION public.check_place_id_exists(place_id text)
RETURNS TABLE (
  exists_flag boolean,
  masked_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id_found uuid;
  owner_email text;
BEGIN
  -- Procurar se o place_id já existe
  SELECT c.owner_id INTO owner_id_found
  FROM companies c
  WHERE c.google_place_id = place_id
  LIMIT 1;
  
  IF owner_id_found IS NULL THEN
    RETURN QUERY SELECT false, ''::text;
    RETURN;
  END IF;
  
  -- Buscar email do dono via auth.users
  SELECT u.email INTO owner_email
  FROM auth.users u
  WHERE u.id = owner_id_found;
  
  IF owner_email IS NULL THEN
    RETURN QUERY SELECT true, '***@***.***'::text;
    RETURN;
  END IF;
  
  -- Mascarar email
  RETURN QUERY SELECT true, 
    CASE 
      WHEN length(split_part(owner_email, '@', 1)) > 2 THEN
        left(split_part(owner_email, '@', 1), 2) || '***@' || 
        left(split_part(owner_email, '@', 2), 3) || '***'
      ELSE
        '***@***'
    END;
END;
$$;