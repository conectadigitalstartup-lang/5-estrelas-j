-- Add WhatsApp column to companies table
ALTER TABLE public.companies 
ADD COLUMN whatsapp_number text;