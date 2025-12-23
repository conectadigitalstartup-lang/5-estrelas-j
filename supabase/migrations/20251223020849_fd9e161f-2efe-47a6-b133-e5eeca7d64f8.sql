-- Função para verificar se a empresa tem acesso (assinatura válida)
CREATE OR REPLACE FUNCTION public.check_company_access(company_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_owner_id uuid;
  sub_status text;
BEGIN
  -- 1. Acha o dono da empresa pelo slug
  SELECT owner_id INTO company_owner_id FROM companies WHERE slug = company_slug;
  
  IF company_owner_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Verifica o status da assinatura
  SELECT status INTO sub_status FROM subscriptions WHERE user_id = company_owner_id;

  -- 3. Se não tem assinatura, bloqueia
  IF sub_status IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Retorna TRUE apenas se status for válido (active, trialing, past_due)
  IF sub_status IN ('active', 'trialing', 'past_due') THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;