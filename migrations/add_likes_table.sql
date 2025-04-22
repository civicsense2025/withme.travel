-- Create enum for like item types
CREATE TYPE like_item_type AS ENUM ('destination', 'itinerary', 'attraction');

-- Create likes table with polymorphic relationships
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type like_item_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure users can only like an item once
  UNIQUE(user_id, item_id, item_type)
);

-- Add indexes for fast queries
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS likes_item_id_idx ON likes(item_id);
CREATE INDEX IF NOT EXISTS likes_item_type_idx ON likes(item_type);
CREATE INDEX IF NOT EXISTS likes_combined_idx ON likes(user_id, item_type);

-- Add RLS policies
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own likes
CREATE POLICY select_own_likes ON likes
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to select any likes for discovery (for counts, etc.)
CREATE POLICY select_all_likes ON likes
  FOR SELECT USING (true);

-- Allow users to insert their own likes
CREATE POLICY insert_own_likes ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY delete_own_likes ON likes
  FOR DELETE USING (auth.uid() = user_id); 