-- Create utility functions for database operations

-- Function to automatically update timestamps on rows
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add page_path field to user_presence if not exists
ALTER TABLE user_presence ADD COLUMN IF NOT EXISTS page_path TEXT;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_presence_editing_item_id ON user_presence(editing_item_id); 