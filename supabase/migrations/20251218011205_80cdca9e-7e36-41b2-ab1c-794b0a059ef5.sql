-- Performance indexes for feedbacks table
CREATE INDEX IF NOT EXISTS idx_feedbacks_company_id ON public.feedbacks(company_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON public.feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_feedbacks_is_read ON public.feedbacks(is_read);

-- Performance indexes for companies table
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);

-- Enable realtime for feedbacks (for dashboard live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;