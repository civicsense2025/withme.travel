-- Create trip poll tables to support real-time decision making

-- Create trip polls table
CREATE TABLE IF NOT EXISTS trip_polls (
  id SERIAL PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS trip_poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INT NOT NULL REFERENCES trip_polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create individual votes table
CREATE TABLE IF NOT EXISTS trip_poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INT NOT NULL REFERENCES trip_polls(id) ON DELETE CASCADE,
  option_id INT NOT NULL REFERENCES trip_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- Only one vote per poll per user
);

-- Add RLS policies
ALTER TABLE trip_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for trip_polls
CREATE POLICY "Trip members can view polls" 
  ON trip_polls 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_polls.trip_id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members with edit permissions can create polls" 
  ON trip_polls 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_polls.trip_id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Trip admin/editor/creator can update polls" 
  ON trip_polls 
  FOR UPDATE 
  USING (
    (created_by = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = trip_polls.trip_id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

-- Policies for trip_poll_options
CREATE POLICY "Trip members can view poll options" 
  ON trip_poll_options 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_polls JOIN trip_members 
      ON trip_polls.trip_id = trip_members.trip_id
      WHERE trip_poll_options.poll_id = trip_polls.id 
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members with edit permissions can create poll options" 
  ON trip_poll_options 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_polls JOIN trip_members 
      ON trip_polls.trip_id = trip_members.trip_id
      WHERE trip_poll_options.poll_id = trip_polls.id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

-- Policies for trip_poll_votes
CREATE POLICY "Trip members can view votes" 
  ON trip_poll_votes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = (
        SELECT trip_id FROM trip_polls WHERE id = trip_poll_votes.poll_id
      )
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can vote" 
  ON trip_poll_votes 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM trip_members 
      WHERE trip_members.trip_id = (
        SELECT trip_id FROM trip_polls WHERE id = trip_poll_votes.poll_id
      )
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own votes" 
  ON trip_poll_votes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add function to get vote counts for poll options
CREATE OR REPLACE FUNCTION get_poll_option_vote_counts(poll_id_param INT)
RETURNS TABLE (
  option_id INT,
  count TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    trip_poll_options.id AS option_id,
    COUNT(trip_poll_votes.id)::TEXT AS count
  FROM 
    trip_poll_options
  LEFT JOIN 
    trip_poll_votes ON trip_poll_votes.option_id = trip_poll_options.id
  WHERE 
    trip_poll_options.poll_id = poll_id_param
  GROUP BY 
    trip_poll_options.id
  ORDER BY 
    trip_poll_options.id;
$$;

-- Add trigger to update timestamp on row changes
CREATE TRIGGER set_timestamp_trip_polls
BEFORE UPDATE ON trip_polls
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 