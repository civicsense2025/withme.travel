-- Function to get detailed poll results including vote counts and percentages
CREATE OR REPLACE FUNCTION get_poll_results(poll_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  poll_data JSON;
  options_data JSON;
  total_votes INTEGER;
  user_vote_id UUID;
BEGIN
  -- Get poll information
  SELECT
    json_build_object(
      'id', p.id,
      'title', p.title,
      'description', p.description,
      'is_active', p.is_active,
      'created_at', p.created_at,
      'created_by', json_build_object(
        'id', u.id,
        'name', pr.name,
        'avatar_url', pr.avatar_url
      ),
      'expires_at', p.expires_at,
      'is_expired', (p.expires_at IS NOT NULL AND p.expires_at < NOW())
    )
  INTO poll_data
  FROM 
    trip_vote_polls p
    LEFT JOIN auth.users u ON p.created_by = u.id
    LEFT JOIN profiles pr ON u.id = pr.id
  WHERE 
    p.id = poll_id_param;
  
  -- Get the total votes for the poll
  SELECT COUNT(*) INTO total_votes
  FROM trip_votes
  WHERE poll_id = poll_id_param;
  
  -- Get the user's vote if they've voted
  IF auth.uid() IS NOT NULL THEN
    SELECT option_id INTO user_vote_id
    FROM trip_votes
    WHERE poll_id = poll_id_param AND user_id = auth.uid();
  END IF;
  
  -- Get options with detailed vote information
  SELECT
    json_agg(
      json_build_object(
        'id', o.id,
        'title', o.title,
        'description', o.description,
        'image_url', o.image_url,
        'vote_count', COALESCE(v.vote_count, 0),
        'percentage', CASE 
                        WHEN total_votes > 0 THEN 
                          ROUND((COALESCE(v.vote_count, 0)::NUMERIC / total_votes) * 100, 1)
                        ELSE 0 
                      END,
        'voters', COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', u.id,
              'name', p.name,
              'avatar_url', p.avatar_url
            )
          )
          FROM trip_votes tv
          JOIN auth.users u ON tv.user_id = u.id
          JOIN profiles p ON u.id = p.id
          WHERE tv.option_id = o.id
          ), '[]'::json
        ),
        'is_user_vote', (o.id = user_vote_id)
      )
      ORDER BY COALESCE(v.vote_count, 0) DESC, o.title
    )
  INTO options_data
  FROM
    trip_vote_options o
    LEFT JOIN (
      SELECT option_id, COUNT(*) as vote_count
      FROM trip_votes
      WHERE poll_id = poll_id_param
      GROUP BY option_id
    ) v ON o.id = v.option_id
  WHERE
    o.poll_id = poll_id_param;
  
  -- Return combined JSON result
  RETURN json_build_object(
    'poll', poll_data,
    'options', options_data,
    'total_votes', total_votes,
    'user_vote', user_vote_id
  );
END;
$$;

-- Function to get all votes cast by a user
CREATE OR REPLACE FUNCTION get_user_votes(
  trip_id_param UUID,
  user_id_param UUID DEFAULT auth.uid()
)
RETURNS TABLE (
  poll_id UUID,
  option_id UUID,
  voted_at TIMESTAMPTZ,
  poll_title TEXT,
  option_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.poll_id,
    v.option_id,
    v.created_at as voted_at,
    p.title as poll_title,
    o.title as option_title
  FROM
    trip_votes v
    JOIN trip_vote_polls p ON v.poll_id = p.id
    JOIN trip_vote_options o ON v.option_id = o.id
  WHERE
    v.trip_id = trip_id_param AND
    v.user_id = user_id_param
  ORDER BY
    v.created_at DESC;
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
    (p.expires_at IS NOT NULL AND p.expires_at < NOW())
  INTO poll_expired
  FROM
    trip_vote_polls p
  WHERE
    p.id = poll_id_param;
  
  RETURN COALESCE(poll_expired, FALSE);
END;
$$; 