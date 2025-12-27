-- A) ANTI-FRAUDE: Adicionar constraint UNIQUE no google_review_link
ALTER TABLE public.companies 
ADD CONSTRAINT companies_google_review_link_unique UNIQUE (google_review_link);

-- B) TRIAL 7 DIAS: Alterar default de trial_ends_at de 14 para 7 dias
ALTER TABLE public.subscriptions 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '7 days');

ALTER TABLE public.profiles 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '7 days');

-- Criar função para verificar se link já existe e retornar email mascarado
CREATE OR REPLACE FUNCTION public.check_google_link_exists(google_link text)
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
  -- Procurar se o link já existe
  SELECT c.owner_id INTO owner_id_found
  FROM companies c
  WHERE c.google_review_link = google_link
  LIMIT 1;
  
  IF owner_id_found IS NULL THEN
    RETURN QUERY SELECT false, ''::text;
    RETURN;
  END IF;
  
  -- Buscar email do dono via auth.users (usando service role internamente)
  SELECT u.email INTO owner_email
  FROM auth.users u
  WHERE u.id = owner_id_found;
  
  IF owner_email IS NULL THEN
    RETURN QUERY SELECT true, '***@***.***'::text;
    RETURN;
  END IF;
  
  -- Mascarar email: mostrar 2 primeiras letras + *** + @ + domínio parcial
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

-- Atualizar função check_company_access para usar lógica de 7 dias
CREATE OR REPLACE FUNCTION public.check_company_access(company_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_record RECORD;
  sub_record RECORD;
  days_since_creation integer;
BEGIN
  -- 1. Buscar empresa e data de criação
  SELECT id, owner_id, created_at INTO company_record 
  FROM companies WHERE slug = company_slug;
  
  IF company_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Calcular dias desde criação
  days_since_creation := EXTRACT(DAY FROM (now() - company_record.created_at));

  -- 3. Buscar assinatura do dono
  SELECT status, is_super_admin, trial_ends_at INTO sub_record 
  FROM subscriptions WHERE user_id = company_record.owner_id;

  -- 4. Super admin sempre tem acesso
  IF sub_record.is_super_admin = true THEN
    RETURN TRUE;
  END IF;

  -- 5. Se status é 'active', acesso liberado
  IF sub_record.status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- 6. Se está em trial E dentro de 7 dias, acesso liberado
  IF sub_record.status = 'trialing' THEN
    IF sub_record.trial_ends_at IS NOT NULL AND sub_record.trial_ends_at > now() THEN
      RETURN TRUE;
    END IF;
    -- Fallback: usar created_at da empresa se trial_ends_at não definido
    IF days_since_creation <= 7 THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- 7. Caso contrário, bloquear
  RETURN FALSE;
END;
$$;