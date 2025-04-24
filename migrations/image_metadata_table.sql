-- Create enum for image types
CREATE TYPE image_type AS ENUM (
  'destination',
  'trip_cover',
  'user_avatar',
  'template_cover'
);

-- Create table for image metadata
CREATE TABLE IF NOT EXISTS image_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL, -- ID of the destination/trip/user/template
  entity_type image_type NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  attribution TEXT,
  photographer_name TEXT,
  photographer_url TEXT,
  license TEXT,
  source TEXT NOT NULL, -- e.g., 'unsplash', 'user_upload', 'system'
  source_id TEXT, -- e.g., Unsplash photo ID
  width INTEGER,
  height INTEGER,
  focal_point_x FLOAT, -- For smart cropping
  focal_point_y FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indices for fast lookups
CREATE UNIQUE INDEX image_metadata_entity_idx ON image_metadata (entity_id, entity_type);

-- Add RLS policies
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Everyone can view image metadata
CREATE POLICY image_metadata_select_policy ON image_metadata
  FOR SELECT USING (true);

-- Only authenticated users can insert their own images
CREATE POLICY image_metadata_insert_policy ON image_metadata
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    (
      -- User can add their own avatar
      (entity_type = 'user_avatar' AND entity_id = auth.uid()) OR
      -- User can add images to their trips
      (entity_type = 'trip_cover' AND EXISTS (
        SELECT 1 FROM trips
        WHERE trips.id = entity_id
        AND trips.created_by = auth.uid()
      )) OR
      -- User can add images to their templates
      (entity_type = 'template_cover' AND EXISTS (
        SELECT 1 FROM library_templates
        WHERE library_templates.id = entity_id
        AND library_templates.user_id = auth.uid()
      ))
    )
  );

-- Only admins can update destination images
CREATE POLICY image_metadata_update_policy ON image_metadata
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (
      -- Admins can update any image
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
      ) OR
      -- Users can update their own images
      (
        (entity_type = 'user_avatar' AND entity_id = auth.uid()) OR
        (entity_type = 'trip_cover' AND EXISTS (
          SELECT 1 FROM trips
          WHERE trips.id = entity_id
          AND trips.created_by = auth.uid()
        )) OR
        (entity_type = 'template_cover' AND EXISTS (
          SELECT 1 FROM library_templates
          WHERE library_templates.id = entity_id
          AND library_templates.user_id = auth.uid()
        ))
      )
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_image_metadata_updated_at
  BEFORE UPDATE ON image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate entity references
CREATE OR REPLACE FUNCTION validate_image_metadata_entity()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the entity_id exists in the corresponding table based on entity_type
  CASE NEW.entity_type
    WHEN 'user_avatar' THEN
      IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid user_id: %', NEW.entity_id;
      END IF;
    WHEN 'trip_cover' THEN
      IF NOT EXISTS (SELECT 1 FROM trips WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid trip_id: %', NEW.entity_id;
      END IF;
    WHEN 'destination' THEN
      IF NOT EXISTS (SELECT 1 FROM destinations WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid destination_id: %', NEW.entity_id;
      END IF;
    WHEN 'template_cover' THEN
      IF NOT EXISTS (SELECT 1 FROM library_templates WHERE id = NEW.entity_id) THEN
        RAISE EXCEPTION 'Invalid template_id: %', NEW.entity_id;
      END IF;
  END CASE;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to validate entity references
CREATE TRIGGER validate_image_metadata_entity
  BEFORE INSERT OR UPDATE ON image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION validate_image_metadata_entity(); 