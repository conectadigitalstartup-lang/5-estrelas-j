-- Tabela de teste para demonstrar o fluxo de migração
CREATE TABLE IF NOT EXISTS public.migration_test (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_message TEXT NOT NULL DEFAULT 'Migração funcionou!',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Após confirmar que funciona, podemos deletar esta tabela