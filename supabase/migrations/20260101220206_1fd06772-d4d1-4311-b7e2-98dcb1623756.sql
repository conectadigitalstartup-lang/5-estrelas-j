-- Add is_blocked column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_blocked IS 'Flag to block user login access';