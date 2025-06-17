-- Add avatar_url and email columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles to set email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;

-- Make email column required for new profiles
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL; 