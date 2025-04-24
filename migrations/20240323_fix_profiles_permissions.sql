-- Fix profiles table permissions
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow trigger function to manage profiles" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to the trigger function
GRANT ALL ON profiles TO postgres;
GRANT ALL ON profiles TO service_role;

-- Ensure the trigger function has proper permissions
ALTER FUNCTION sync_user_to_profile() SECURITY DEFINER;

-- Recreate the trigger with proper permissions
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;
CREATE TRIGGER sync_user_profile
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_to_profile();

-- Resync existing users to profiles
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