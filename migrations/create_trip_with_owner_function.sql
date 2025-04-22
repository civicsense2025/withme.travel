-- Function to create a trip and add the creator as owner in a single transaction
-- This avoids RLS policy recursion by performing both operations in a single transaction
CREATE OR REPLACE FUNCTION create_trip_with_owner(
  trip_data JSONB,
  owner_id UUID
) RETURNS JSONB AS $$
DECLARE
  new_trip_id UUID;
  result JSONB;
  final_slug TEXT;
BEGIN
  -- Ensure slug is unique, append random chars if needed
  final_slug := trip_data->>'slug';
  IF EXISTS (SELECT 1 FROM trips WHERE slug = final_slug) THEN
    final_slug := final_slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;

  -- Start transaction
  BEGIN
    -- Insert trip data, including slug, description, and destination_name
    INSERT INTO trips (
      name,
      slug,
      description,
      destination_id,
      destination_name,
      start_date,
      end_date,
      date_flexibility,
      travelers_count,
      vibe,
      budget,
      is_public,
      created_by
    ) VALUES (
      trip_data->>'name',
      final_slug,
      trip_data->>'description',
      (trip_data->>'destination_id')::UUID,
      trip_data->>'destination_name',
      (trip_data->>'start_date')::TIMESTAMP WITH TIME ZONE,
      (trip_data->>'end_date')::TIMESTAMP WITH TIME ZONE,
      trip_data->>'date_flexibility',
      (trip_data->>'travelers_count')::INTEGER,
      trip_data->>'vibe',
      trip_data->>'budget',
      (trip_data->>'is_public')::BOOLEAN,
      owner_id
    )
    RETURNING id INTO new_trip_id;

    -- Add trip creator as owner
    INSERT INTO trip_members (
      trip_id,
      user_id,
      role
    ) VALUES (
      new_trip_id,
      owner_id,
      'owner'
    );

    -- Prepare result object
    result := jsonb_build_object(
      'trip_id', new_trip_id,
      'success', true
    );

    -- Return result if everything succeeds
    RETURN result;

  EXCEPTION
    WHEN unique_violation THEN
      -- Handle potential unique constraint violation (e.g., slug race condition)
       RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to create trip due to conflicting data (slug might already exist). Please try a different name/slug.',
        'detail', SQLSTATE || ': ' || SQLERRM
      );
    WHEN OTHERS THEN
      -- Handle any other errors
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Database error during trip creation: ' || SQLERRM,
        'detail', SQLSTATE
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_trip_with_owner(JSONB, UUID) TO authenticated;

-- Comment on function
COMMENT ON FUNCTION create_trip_with_owner IS 'Creates a trip and adds the creator as an owner in a single transaction. Handles slug, description, and destination_name.'; 