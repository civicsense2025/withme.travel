-- Add foreign key constraint between itinerary_templates.created_by and profiles.id
ALTER TABLE itinerary_templates 
ADD CONSTRAINT itinerary_templates_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Verify existing records don't violate the constraint
-- Comment this out after running once and verifying
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_count 
    FROM itinerary_templates it
    LEFT JOIN profiles p ON it.created_by = p.id
    WHERE it.created_by IS NOT NULL AND p.id IS NULL;
    
    IF invalid_count > 0 THEN
        RAISE NOTICE 'Warning: % itinerary templates have invalid created_by values that don''t match existing profiles', invalid_count;
    ELSE
        RAISE NOTICE 'All created_by values are valid';
    END IF;
END $$; 