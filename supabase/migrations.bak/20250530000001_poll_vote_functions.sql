-- Create functions for retrieving poll results with detailed vote counts and percentages

-- Function to get detailed poll results including vote counts and percentages
CREATE OR REPLACE FUNCTION get_poll_results(poll_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_json JSON;
  results_json JSON;
  total_votes INT;
BEGIN
  -- Check if poll exists
  IF NOT EXISTS (SELECT 1 FROM trip_vote_polls WHERE id = poll_id_param) THEN
    RETURN json_build_object('error', 'Poll not found');
  END IF;
  
  -- Get poll data
  SELECT json_build_object(
    'id', p.id,
    'trip_id', p.trip_id,
    'title', p.title,
    'description', p.description,
    'is_active', p.is_active,
    'created_by', p.created_by,
    'expires_at', p.expires_at,
    'created_at', p.created_at,
    'is_expired', CASE WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW() THEN true ELSE false END
  ) INTO poll_json
  FROM trip_vote_polls p
  WHERE p.id = poll_id_param;
  
  -- Get total votes count
  SELECT COUNT(*) INTO total_votes
  FROM trip_votes
  WHERE poll_id = poll_id_param;
  
  -- Get options with vote counts and percentages
  WITH option_votes AS (
    SELECT 
      o.id AS option_id,
      o.title AS option_title,
      o.description AS option_description,
      COUNT(v.id) AS vote_count
    FROM 
      trip_vote_options o
    LEFT JOIN 
      trip_votes v ON v.option_id = o.id
    WHERE 
      o.poll_id = poll_id_param
    GROUP BY 
      o.id, o.title, o.description
    ORDER BY 
      vote_count DESC, o.title
  )
  SELECT json_agg(
    json_build_object(
      'option', json_build_object(
        'id', option_id,
        'text', option_title,
        'description', option_description
      ),
      'votes', vote_count,
      'percentage', CASE 
        WHEN total_votes > 0 THEN ROUND((vote_count::float / total_votes) * 100)
        ELSE 0
      END,
      'voters', (
        SELECT json_agg(
          json_build_object(
            'id', u.id,
            'email', u.email,
            'profile', json_build_object(
              'username', p.username,
              'full_name', p.full_name,
              'avatar_url', p.avatar_url
            )
          )
        )
        FROM trip_votes tv
        JOIN auth.users u ON tv.user_id = u.id
        JOIN profiles p ON u.id = p.id
        WHERE tv.option_id = ov.option_id
      )
    )
  ) INTO results_json
  FROM option_votes ov;
  
  -- Return combined result
  RETURN json_build_object(
    'poll', poll_json,
    'results', results_json,
    'total_votes', total_votes,
    'user_vote', (
      SELECT option_id 
      FROM trip_votes 
      WHERE poll_id = poll_id_param AND user_id = auth.uid()
    )
  );
END;
$$;

-- Function to get a user's vote for a specific poll
CREATE OR REPLACE FUNCTION get_user_poll_vote(
  p_poll_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vote_data JSON;
BEGIN
  SELECT json_build_object(
    'option_id', v.option_id,
    'option_title', o.title,
    'created_at', v.created_at
  ) INTO vote_data
  FROM trip_votes v
  JOIN trip_vote_options o ON v.option_id = o.id
  WHERE v.poll_id = p_poll_id AND v.user_id = p_user_id;
  
  IF vote_data IS NULL THEN
    RETURN json_build_object('has_voted', false);
  ELSE
    RETURN json_build_object(
      'has_voted', true,
      'vote', vote_data
    );
  END IF;
END;
$$;

-- Function to check if a poll has expired
CREATE OR REPLACE FUNCTION is_poll_expired(poll_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_expired BOOLEAN;
BEGIN
  SELECT 
    CASE 
      WHEN p.expires_at IS NULL THEN false
      WHEN p.expires_at < NOW() THEN true
      ELSE false
    END INTO poll_expired
  FROM trip_vote_polls p
  WHERE p.id = poll_id_param;
  
  RETURN COALESCE(poll_expired, false);
END;
$$; 