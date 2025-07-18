-- Update existing profiles to set email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;

-- Make email column required for new profiles (but allow existing ones to be null)
-- Note: We'll make it NOT NULL in a future migration after all existing profiles have email 