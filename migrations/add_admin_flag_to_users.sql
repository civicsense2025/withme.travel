-- Add admin flag to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create initial admin user (you'll need to update this with your user ID)
-- UPDATE users SET is_admin = TRUE WHERE id = 'your-user-id-here';
