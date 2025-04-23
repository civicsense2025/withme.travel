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
  trip_name TEXT;
  destination_id UUID;
  destination_name TEXT;
BEGIN
  -- Validate required fields from trip_data
  trip_name := trip_data->>'name';
  IF trip_name IS NULL OR trim(trip_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Trip name is required.');
  END IF;

  final_slug := trip_data->>'slug';
  IF final_slug IS NULL OR trim(final_slug) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Trip slug is required.');
  END IF;

  -- Validate destination_id (assuming it's required)
  BEGIN
    destination_id := (trip_data->>'destination_id')::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid destination ID format.');
    WHEN others THEN -- Catch case where destination_id is missing/null before casting
       RETURN jsonb_build_object('success', false, 'error', 'Destination ID is required.');
  END;
  
  -- Validate destination_name (assuming it's required)
  destination_name := trip_data->>'destination_name';
  IF destination_name IS NULL OR trim(destination_name) = '' THEN
     RETURN jsonb_build_object('success', false, 'error', 'Destination name is required.');
  END IF;

  -- Check if destination exists (optional but recommended)
  -- IF NOT EXISTS (SELECT 1 FROM destinations WHERE id = destination_id) THEN
  --   RETURN jsonb_build_object('success', false, 'error', 'Selected destination does not exist.');
  -- END IF;

  -- Ensure slug is unique, append random chars if needed
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
      trip_name, -- Use validated variable
      final_slug,
      trip_data->>'description', -- Optional, no explicit validation needed here unless required
      destination_id, -- Use validated variable
      destination_name, -- Use validated variable
      (trip_data->>'start_date')::TIMESTAMP WITH TIME ZONE, -- Cast handles null, but could add checks if specific error needed
      (trip_data->>'end_date')::TIMESTAMP WITH TIME ZONE, -- Cast handles null
      trip_data->>'date_flexibility',
      (trip_data->>'travelers_count')::INTEGER, -- Cast handles null/invalid with error, could add check
      trip_data->>'vibe',
      trip_data->>'budget',
      (trip_data->>'is_public')::BOOLEAN, -- Cast handles null/invalid with error
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
      'success', true,
      'slug', final_slug -- Return the potentially modified slug
    );

    -- Return result if everything succeeds
    RETURN result;

  EXCEPTION
    WHEN unique_violation THEN
      -- Handle potential unique constraint violation (e.g., slug race condition after check)
       RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to create trip due to conflicting data (slug might already exist). Please try a different name/slug.',
        'detail', SQLSTATE || ': ' || SQLERRM
      );
    WHEN foreign_key_violation THEN
       RETURN jsonb_build_object(
         'success', false,
         'error', 'Failed to create trip due to invalid reference (e.g., destination not found).',
         'detail', SQLSTATE || ': ' || SQLERRM
       );
    WHEN invalid_text_representation THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to create trip due to invalid data format (e.g., date, number).',
        'detail', SQLSTATE || ': ' || SQLERRM
      );
    WHEN check_violation THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to create trip due to data constraint violation.',
        'detail', SQLSTATE || ': ' || SQLERRM
      );
    WHEN OTHERS THEN
      -- Handle any other errors
      RETURN jsonb_build_object(
        'success', false,
        'error', 'An unexpected database error occurred during trip creation.',
        'detail', SQLSTATE || ': ' || SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_trip_with_owner(JSONB, UUID) TO authenticated;

-- Comment on function
COMMENT ON FUNCTION create_trip_with_owner IS 'Creates a trip and adds the creator as an owner in a single transaction. Validates required fields and handles common errors.'; 