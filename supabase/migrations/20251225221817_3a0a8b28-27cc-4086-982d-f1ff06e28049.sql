-- Remove políticas antigas de delete para feedbacks
DROP POLICY IF EXISTS "Donos podem deletar feedbacks de suas empresas" ON feedbacks;

-- Recria como PERMISSIVE (padrão) para donos de empresas
CREATE POLICY "Donos podem deletar feedbacks de suas empresas"
ON feedbacks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = feedbacks.company_id
    AND companies.owner_id = auth.uid()
  )
);

-- Adiciona política para super admin deletar qualquer feedback
CREATE POLICY "Super admin pode deletar qualquer feedback"
ON feedbacks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM subscriptions
    WHERE subscriptions.user_id = auth.uid()
    AND subscriptions.is_super_admin = true
  )
);