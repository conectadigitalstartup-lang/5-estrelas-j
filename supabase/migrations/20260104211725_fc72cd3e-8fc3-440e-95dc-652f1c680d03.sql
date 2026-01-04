-- Adicionar coluna client_phone na tabela feedbacks
ALTER TABLE public.feedbacks 
ADD COLUMN IF NOT EXISTS client_phone text;

-- Criar índice para busca eficiente de clientes com contato
CREATE INDEX IF NOT EXISTS idx_feedbacks_client_phone ON public.feedbacks(client_phone) WHERE client_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_client_name ON public.feedbacks(client_name) WHERE client_name IS NOT NULL;