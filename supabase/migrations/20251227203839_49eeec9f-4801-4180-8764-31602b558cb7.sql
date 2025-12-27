-- Tabela de Clientes VIP
CREATE TABLE IF NOT EXISTS public.clientes_vip (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.clientes_vip ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios clientes VIP"
ON public.clientes_vip FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar clientes VIP"
ON public.clientes_vip FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus clientes VIP"
ON public.clientes_vip FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus clientes VIP"
ON public.clientes_vip FOR DELETE
USING (auth.uid() = user_id);