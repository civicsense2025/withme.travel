-- Create itinerary_template_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS itinerary_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES itinerary_templates(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  item_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50),
  estimated_cost DECIMAL(10,2),
  currency VARCHAR(3),
  duration_minutes INTEGER,
  address VARCHAR(255),
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8),
  section_id UUID,
  links JSONB
);

-- Enable RLS
ALTER TABLE itinerary_template_items ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
CREATE POLICY "Allow template items access" ON itinerary_template_items FOR ALL USING (true);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON itinerary_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_template_items_section_id ON itinerary_template_items(section_id);
CREATE INDEX IF NOT EXISTS idx_template_items_day ON itinerary_template_items(day);

-- Identify and migrate template items from itinerary_items, if any exist
-- This assumes that template items in itinerary_items can be identified by
-- having a NULL trip_id and a non-NULL template_id, which may need to be adjusted
DO $$
DECLARE
  item_count INTEGER;
BEGIN
  -- Check if there are any itinerary items that need migration
  SELECT COUNT(*) INTO item_count 
  FROM itinerary_items 
  WHERE template_id IS NOT NULL;
  
  IF item_count > 0 THEN
    -- Migrate the items
    INSERT INTO itinerary_template_items (
      id, template_id, day, item_order, title, description, 
      start_time, end_time, location, place_id, created_at, updated_at,
      category, estimated_cost, currency, duration_minutes, address,
      latitude, longitude, section_id, links
    )
    SELECT 
      id, template_id, day_number, position, title, notes,
      start_time, end_time, location, place_id, created_at, updated_at,
      category, estimated_cost, currency, duration_minutes, address,
      latitude, longitude, section_id, NULL
    FROM itinerary_items
    WHERE template_id IS NOT NULL;
    
    -- Remove the migrated items from itinerary_items (optional)
    -- DELETE FROM itinerary_items WHERE template_id IS NOT NULL;
    
    RAISE NOTICE 'Successfully migrated % template items', item_count;
  ELSE
    RAISE NOTICE 'No template items found for migration';
  END IF;
END $$;

-- Update the constants.ts file to include ITINERARY_TEMPLATE_ITEMS for consistency
-- This is a note for manual action, as SQL can't modify TypeScript files 