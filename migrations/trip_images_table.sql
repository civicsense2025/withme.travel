-- Create trip_images table to store references to uploaded images
CREATE TABLE IF NOT EXISTS trip_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add metadata fields
  width INTEGER,
  height INTEGER,
  description TEXT,
  
  -- Add index for fast retrieval
  CONSTRAINT trip_images_trip_id_idx UNIQUE (trip_id, file_path)
);

-- Create RLS policies for the trip_images table
ALTER TABLE trip_images ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select images for trips they are members of
CREATE POLICY trip_images_select_policy ON trip_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_images.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

-- Policy: Users can insert images for trips they are members of (except viewers)
CREATE POLICY trip_images_insert_policy ON trip_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_images.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role != 'viewer'
    )
  );

-- Policy: Only owners or editors can delete images
CREATE POLICY trip_images_delete_policy ON trip_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = trip_images.trip_id
      AND trip_members.user_id = auth.uid()
      AND (trip_members.role = 'owner' OR trip_members.role = 'editor')
    )
  );

-- Create storage bucket for trip content if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-content', 'Trip Content', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the trip-content bucket
CREATE POLICY "Trip members can view trip content"
  ON storage.objects FOR SELECT
  USING (
    -- Extract trip_id from the path pattern "trip-images/trip-{tripId}-*"
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = (
        CASE
          WHEN REGEXP_MATCH(name, '^trip-images/trip-([0-9a-f-]+)-') IS NOT NULL
          THEN (REGEXP_MATCH(name, '^trip-images/trip-([0-9a-f-]+)-'))[1]::uuid
          ELSE NULL
        END
      )
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip editors and owners can upload trip content"
  ON storage.objects FOR INSERT
  WITH CHECK (
    -- Check authenticated
    auth.role() = 'authenticated' 
    AND
    -- Extract trip_id from the path pattern "trip-images/trip-{tripId}-*"
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = (
        CASE
          WHEN REGEXP_MATCH(name, '^trip-images/trip-([0-9a-f-]+)-') IS NOT NULL
          THEN (REGEXP_MATCH(name, '^trip-images/trip-([0-9a-f-]+)-'))[1]::uuid
          ELSE NULL
        END
      )
      AND trip_members.user_id = auth.uid()
      AND trip_members.role != 'viewer'
    )
  );

CREATE POLICY "Trip owners can delete trip content"
  ON storage.objects FOR DELETE
  USING (
    -- Check authenticated
    auth.role() = 'authenticated' 
    AND
    -- Extract trip_id from the path pattern "trip-images/trip-{tripId}-*"
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = (
        CASE
          WHEN REGEXP_MATCH(name, '^trip-images/trip-([0-9a-f-]+)-') IS NOT NULL
          THEN (REGEXP_MATCH(name, '^trip-images/trip-([0-9a-f-]+)-'))[1]::uuid
          ELSE NULL
        END
      )
      AND trip_members.user_id = auth.uid()
      AND (trip_members.role = 'owner' OR trip_members.role = 'editor')
    )
  ); 