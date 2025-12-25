-- Adiciona coluna para identificar super usuários
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Cria índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_subscriptions_super_admin 
ON subscriptions(is_super_admin) 
WHERE is_super_admin = true;

-- Função que cria/atualiza assinatura especial para o super admin
CREATE OR REPLACE FUNCTION handle_super_admin_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se o email é o do CEO
  IF NEW.email = 'alexandrehugolb@gmail.com' THEN
    -- Insere ou atualiza assinatura especial
    INSERT INTO subscriptions (
      user_id,
      status,
      is_super_admin,
      trial_ends_at,
      plan,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      'active',
      true,
      NULL,
      'pro',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
      status = 'active',
      is_super_admin = true,
      trial_ends_at = NULL,
      plan = 'pro',
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Remove trigger anterior se existir
DROP TRIGGER IF EXISTS on_super_admin_created ON auth.users;

-- Cria trigger que executa após inserção de usuário
CREATE TRIGGER on_super_admin_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_super_admin_signup();