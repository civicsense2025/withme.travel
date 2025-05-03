-- Add section_id column to itinerary_items if it doesn't exist
-- Assuming UUID type based on potential relations
ALTER TABLE public.itinerary_items 
ADD COLUMN IF NOT EXISTS section_id UUID NULL; 

-- Optionally, add foreign key constraint if sections table exists and is created earlier
-- ALTER TABLE public.itinerary_items 
-- ADD CONSTRAINT fk_itinerary_items_section_id 
-- FOREIGN KEY (section_id) REFERENCES itinerary_sections(id) ON DELETE SET NULL; 