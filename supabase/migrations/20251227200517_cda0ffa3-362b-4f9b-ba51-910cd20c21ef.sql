-- Tabela de tickets de suporte
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aberto',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de respostas dos tickets
CREATE TABLE public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Políticas para support_tickets
CREATE POLICY "Clientes podem ver seus tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Clientes podem criar tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clientes podem atualizar seus tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Super admin pode ver todos os tickets"
ON public.support_tickets
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE subscriptions.user_id = auth.uid() 
    AND subscriptions.is_super_admin = true
));

CREATE POLICY "Super admin pode atualizar todos os tickets"
ON public.support_tickets
FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE subscriptions.user_id = auth.uid() 
    AND subscriptions.is_super_admin = true
));

-- Políticas para ticket_replies
CREATE POLICY "Clientes podem ver respostas dos seus tickets"
ON public.ticket_replies
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE support_tickets.id = ticket_id 
        AND support_tickets.user_id = auth.uid()
    )
);

CREATE POLICY "Clientes podem criar respostas nos seus tickets"
ON public.ticket_replies
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE support_tickets.id = ticket_id 
        AND support_tickets.user_id = auth.uid()
    ) AND auth.uid() = user_id
);

CREATE POLICY "Super admin pode ver todas as respostas"
ON public.ticket_replies
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE subscriptions.user_id = auth.uid() 
    AND subscriptions.is_super_admin = true
));

CREATE POLICY "Super admin pode criar respostas"
ON public.ticket_replies
FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE subscriptions.user_id = auth.uid() 
    AND subscriptions.is_super_admin = true
));

-- Trigger para updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();