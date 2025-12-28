-- Update the create_trial_on_signup function to use 7 days instead of 14 days
CREATE OR REPLACE FUNCTION public.create_trial_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, trial_ends_at, plan)
  VALUES (NEW.id, 'trialing', now() + interval '7 days', 'basico')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;