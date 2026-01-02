-- Update check_company_access function to be bulletproof
-- Rule: Paid = Access. Not Paid = Blocked.

CREATE OR REPLACE FUNCTION public.check_company_access(company_slug text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  company_record RECORD;
  sub_record RECORD;
BEGIN
  -- 1. Find the company by slug
  SELECT id, owner_id, created_at INTO company_record 
  FROM companies WHERE slug = company_slug;
  
  IF company_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 2. Get the subscription record for the owner
  SELECT 
    status, 
    is_super_admin, 
    trial_ends_at,
    current_period_end,
    cancel_at_period_end
  INTO sub_record 
  FROM subscriptions 
  WHERE user_id = company_record.owner_id;

  -- 3. No subscription record = no access (unless super admin)
  IF sub_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 4. Super admin ALWAYS has access (bypass all checks)
  IF sub_record.is_super_admin = true THEN
    RETURN TRUE;
  END IF;

  -- 5. Active subscription = ACCESS
  IF sub_record.status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- 6. Trialing with valid trial period = ACCESS
  IF sub_record.status = 'trialing' THEN
    IF sub_record.trial_ends_at IS NOT NULL AND sub_record.trial_ends_at > now() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- 7. Canceled but still in paid period (cancel_at_period_end = true) = ACCESS
  -- This handles the case where user canceled but subscription runs until end of billing period
  IF sub_record.status = 'active' AND sub_record.cancel_at_period_end = true THEN
    IF sub_record.current_period_end IS NOT NULL AND sub_record.current_period_end > now() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- 8. All other cases = BLOCKED
  -- This includes: past_due, canceled, unpaid, expired trial
  RETURN FALSE;
END;
$function$;

-- Also create a helper function to check access from edge functions
CREATE OR REPLACE FUNCTION public.has_valid_subscription(check_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sub_record RECORD;
BEGIN
  SELECT 
    status, 
    is_super_admin, 
    trial_ends_at,
    current_period_end,
    cancel_at_period_end
  INTO sub_record 
  FROM subscriptions 
  WHERE user_id = check_user_id;

  -- No subscription = no access
  IF sub_record IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super admin always has access
  IF sub_record.is_super_admin = true THEN
    RETURN TRUE;
  END IF;

  -- Active subscription = access
  IF sub_record.status = 'active' THEN
    RETURN TRUE;
  END IF;

  -- Valid trial = access
  IF sub_record.status = 'trialing' THEN
    IF sub_record.trial_ends_at IS NOT NULL AND sub_record.trial_ends_at > now() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Canceled but still in paid period = access
  IF sub_record.cancel_at_period_end = true THEN
    IF sub_record.current_period_end IS NOT NULL AND sub_record.current_period_end > now() THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- All other cases = no access
  RETURN FALSE;
END;
$function$;