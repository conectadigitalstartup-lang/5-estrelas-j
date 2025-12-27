-- Habilitar extensões para cron job
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar cron job para verificar trials diariamente às 9h (horário de Brasília = 12h UTC)
SELECT cron.schedule(
  'check-trial-expiration-daily',
  '0 12 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://iqiebyifudmlgdkvapsk.supabase.co/functions/v1/check-trial-expiration',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWVieWlmdWRtbGdka3ZhcHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1Njg2MjcsImV4cCI6MjA4MTE0NDYyN30.5TM0dp8EGdq_2mHp9uTGmfoh66Ng0R92KPFvWEvtfWk"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);