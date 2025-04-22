-- Add last sign in tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE;

-- Create an index for faster queries by last sign in date
CREATE INDEX IF NOT EXISTS idx_users_last_sign_in ON users (last_sign_in_at);

-- Comment to explain the purpose
COMMENT ON COLUMN users.last_sign_in_at IS 'Timestamp of the user''s most recent sign in, updated by middleware'; 