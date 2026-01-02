-- Create storage bucket for background textures
INSERT INTO storage.buckets (id, name, public)
VALUES ('background-textures', 'background-textures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to background textures
CREATE POLICY "Public can view background textures"
ON storage.objects FOR SELECT
USING (bucket_id = 'background-textures');

-- Add photo enhancements counter to subscriptions for future limits
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS photo_enhancements_count integer DEFAULT 0;