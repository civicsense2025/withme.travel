-- Create tables for trip item comments system

-- Create trip item comments table
CREATE TABLE trip_item_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_id UUID NOT NULL, -- References different item types depending on context (trip_days, trip_items, etc)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create likes for comments
CREATE TABLE trip_comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES trip_item_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id) -- A user can only like a comment once
);

-- Enable Row Level Security
ALTER TABLE trip_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_comment_likes ENABLE ROW LEVEL SECURITY;

-- Create indexes for faster queries
CREATE INDEX idx_trip_item_comments_tripid_itemid ON trip_item_comments(trip_id, item_id);
CREATE INDEX idx_trip_item_comments_userid ON trip_item_comments(user_id);
CREATE INDEX idx_trip_comment_likes_commentid ON trip_comment_likes(comment_id);
CREATE INDEX idx_trip_comment_likes_userid ON trip_comment_likes(user_id);

-- RLS Policies for trip_item_comments
CREATE POLICY "Trip members can view comments" 
  ON trip_item_comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_item_comments.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can add comments" 
  ON trip_item_comments 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_item_comments.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" 
  ON trip_item_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON trip_item_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for trip_comment_likes
CREATE POLICY "Trip members can view likes" 
  ON trip_comment_likes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_comment_likes.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can like comments" 
  ON trip_comment_likes 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_comment_likes.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can unlike their own likes" 
  ON trip_comment_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add triggers for real-time functionality
CREATE TRIGGER set_updated_at_trip_item_comments
BEFORE UPDATE ON trip_item_comments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Function to count comments for an item
CREATE OR REPLACE FUNCTION count_item_comments(
  p_item_id UUID
) 
RETURNS INT 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  comment_count INT;
BEGIN
  SELECT COUNT(*)
  INTO comment_count
  FROM trip_item_comments
  WHERE item_id = p_item_id;
  
  RETURN comment_count;
END;
$$;

-- Function to check if user has liked a comment
CREATE OR REPLACE FUNCTION has_user_liked_comment(
  p_comment_id UUID,
  p_user_id UUID DEFAULT auth.uid()
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM trip_comment_likes 
    WHERE comment_id = p_comment_id AND user_id = p_user_id
  );
END;
$$; 