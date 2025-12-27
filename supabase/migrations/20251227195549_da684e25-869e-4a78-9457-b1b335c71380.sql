-- Create table for CEO test restaurants
CREATE TABLE public.admin_test_restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  google_review_link text,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_test_restaurants ENABLE ROW LEVEL SECURITY;

-- Only super admin can manage test restaurants
CREATE POLICY "Super admin can manage test restaurants"
ON public.admin_test_restaurants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.user_id = auth.uid()
    AND subscriptions.is_super_admin = true
  )
);

-- Allow public read access for QR code pages
CREATE POLICY "Anyone can view test restaurants"
ON public.admin_test_restaurants
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_test_restaurants_updated_at
BEFORE UPDATE ON public.admin_test_restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();