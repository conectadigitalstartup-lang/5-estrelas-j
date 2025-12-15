
-- Tabela de empresas/restaurantes
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  google_review_link TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de feedbacks
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- RLS para companies: leitura pública, escrita restrita ao dono
CREATE POLICY "Qualquer pessoa pode ver empresas"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Donos podem inserir suas empresas"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Donos podem atualizar suas empresas"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Donos podem deletar suas empresas"
ON public.companies FOR DELETE
USING (auth.uid() = owner_id);

-- RLS para feedbacks: INSERT público, SELECT restrito ao dono da empresa
CREATE POLICY "Qualquer pessoa pode enviar feedback"
ON public.feedbacks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Donos podem ver feedbacks de suas empresas"
ON public.feedbacks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = feedbacks.company_id
    AND companies.owner_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para busca por slug
CREATE INDEX idx_companies_slug ON public.companies(slug);
