-- Add new fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Update existing rows to have empty arrays for interests if null
UPDATE users SET interests = '{}' WHERE interests IS NULL;
