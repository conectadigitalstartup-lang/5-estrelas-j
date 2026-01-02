-- Create storage bucket for enhanced food photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('enhanced-photos', 'enhanced-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload their own enhanced photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'enhanced-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own enhanced photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'enhanced-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own enhanced photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'enhanced-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create table to track enhanced photos
CREATE TABLE public.enhanced_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  storage_path text NOT NULL,
  original_filename text,
  background_choice text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enhanced_photos ENABLE ROW LEVEL SECURITY;

-- Users can view their own photos
CREATE POLICY "Users can view their own enhanced photos"
ON public.enhanced_photos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own photos
CREATE POLICY "Users can insert their own enhanced photos"
ON public.enhanced_photos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own enhanced photos"
ON public.enhanced_photos FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_enhanced_photos_user_id ON public.enhanced_photos(user_id);
CREATE INDEX idx_enhanced_photos_created_at ON public.enhanced_photos(created_at DESC);