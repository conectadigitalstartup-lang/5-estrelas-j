-- Add missing columns to feedbacks table
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Allow owners to delete feedbacks from their companies
CREATE POLICY "Donos podem deletar feedbacks de suas empresas" 
ON public.feedbacks 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM companies
  WHERE ((companies.id = feedbacks.company_id) AND (companies.owner_id = auth.uid()))));