-- Create trip vote tables to support real-time decision making

-- Create trip_vote_polls table
CREATE TABLE trip_vote_polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE trip_vote_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES trip_vote_polls(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create individual votes table
CREATE TABLE trip_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES trip_vote_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES trip_vote_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- Only one vote per poll per user
);

-- Add RLS policies
ALTER TABLE trip_vote_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_votes ENABLE ROW LEVEL SECURITY;

-- Policies for trip_vote_polls
CREATE POLICY "Trip members can view polls" 
  ON trip_vote_polls 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_vote_polls.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members with edit permissions can create polls" 
  ON trip_vote_polls 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_vote_polls.trip_id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Trip admin/editor/creator can update polls" 
  ON trip_vote_polls 
  FOR UPDATE 
  USING (
    (created_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_vote_polls.trip_id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

-- Policies for trip_vote_options
CREATE POLICY "Trip members can view options" 
  ON trip_vote_options 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_vote_polls JOIN trip_members 
      ON trip_vote_polls.trip_id = trip_members.trip_id
      WHERE trip_vote_options.poll_id = trip_vote_polls.id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members with edit permissions can create options" 
  ON trip_vote_options 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_vote_polls JOIN trip_members 
      ON trip_vote_polls.trip_id = trip_members.trip_id
      WHERE trip_vote_options.poll_id = trip_vote_polls.id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

-- Policies for trip_votes
CREATE POLICY "Trip members can view votes" 
  ON trip_votes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_votes.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can vote" 
  ON trip_votes 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_votes.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own votes" 
  ON trip_votes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to check if a user has voted
CREATE OR REPLACE FUNCTION has_user_voted(
  p_poll_id UUID,
  p_user_id UUID DEFAULT auth.uid()
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM trip_votes 
    WHERE poll_id = p_poll_id AND user_id = p_user_id
  );
END;
$$;

-- Create REST API endpoints
CREATE OR REPLACE FUNCTION get_poll_with_options(poll_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_json JSON;
  options_json JSON;
BEGIN
  -- Get poll data
  SELECT json_build_object(
    'id', p.id,
    'trip_id', p.trip_id,
    'title', p.title,
    'description', p.description,
    'is_active', p.is_active,
    'created_by', p.created_by,
    'expires_at', p.expires_at,
    'created_at', p.created_at
  ) INTO poll_json
  FROM trip_vote_polls p
  WHERE p.id = poll_id;
  
  -- Get options with vote counts
  SELECT json_agg(
    json_build_object(
      'id', o.id,
      'title', o.title,
      'description', o.description,
      'image_url', o.image_url,
      'votes', (SELECT COUNT(*) FROM trip_votes v WHERE v.option_id = o.id),
      'has_voted', has_user_voted(poll_id, auth.uid())
    )
  ) INTO options_json
  FROM trip_vote_options o
  WHERE o.poll_id = poll_id;
  
  -- Combine the results
  RETURN json_build_object(
    'poll', poll_json,
    'options', options_json
  );
END;
$$; 