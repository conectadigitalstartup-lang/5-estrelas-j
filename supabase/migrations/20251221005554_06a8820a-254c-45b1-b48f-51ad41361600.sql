-- Fix 1: Add CHECK constraint to limit comment length at database level
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_comment_length CHECK (length(comment) <= 1000);

-- Fix 2: Add CHECK constraint to prevent customer_name and customer_email from being set
-- Since the application doesn't collect these fields, we restrict them at database level
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_no_pii CHECK (customer_name IS NULL AND customer_email IS NULL);