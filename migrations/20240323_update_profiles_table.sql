-- Add missing fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create function to sync user data to profiles
CREATE OR REPLACE FUNCTION sync_user_to_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update profile
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = EXCLUDED.updated_at;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync user data
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;
CREATE TRIGGER sync_user_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_to_profile();

-- Migrate existing data from users to profiles
INSERT INTO profiles (
  id,
  email,
  name,
  avatar_url,
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  raw_user_meta_data->>'avatar_url',
  updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = EXCLUDED.updated_at;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow trigger function to manage profiles
CREATE POLICY "Allow trigger function to manage profiles" ON profiles
  FOR ALL
  USING (current_user = current_database_owner())
  WITH CHECK (current_user = current_database_owner());

-- Comment on table
COMMENT ON TABLE profiles IS 'Public profiles of users with additional metadata'; 