-- Add is_read column to feedbacks table
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Allow owners to update feedbacks (to mark as read)
CREATE POLICY "Donos podem atualizar feedbacks de suas empresas" 
ON public.feedbacks 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM companies
  WHERE ((companies.id = feedbacks.company_id) AND (companies.owner_id = auth.uid()))));
