-- Check if there's a duplicate slug column in itinerary_templates
DO $$
DECLARE
    col_count integer;
BEGIN
    -- Count how many columns named "slug" exist
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'itinerary_templates' 
    AND column_name = 'slug';
    
    -- If there's more than one slug column
    IF col_count > 1 THEN
        -- Keep only one slug column - drop the duplicate
        EXECUTE 'ALTER TABLE itinerary_templates DROP COLUMN slug CASCADE;';
        -- Add it back with proper constraints
        EXECUTE 'ALTER TABLE itinerary_templates ADD COLUMN slug VARCHAR(255) UNIQUE;';
        -- Copy values from description to slug where needed
        EXECUTE '
            UPDATE itinerary_templates 
            SET slug = description 
            WHERE slug IS NULL AND description LIKE ''%.-%''
        ';
    END IF;
END $$;

-- Ensure the destination_id column has proper foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'itinerary_templates_destination_id_fkey'
    ) THEN
        ALTER TABLE itinerary_templates 
        ADD CONSTRAINT itinerary_templates_destination_id_fkey 
        FOREIGN KEY (destination_id) REFERENCES destinations(id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Log error and continue
    RAISE NOTICE 'Failed to add foreign key constraint: %', SQLERRM;
END $$;

-- Fix any NULL slugs by creating them from title
UPDATE itinerary_templates
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- Make sure all templates have is_published value
UPDATE itinerary_templates
SET is_published = true
WHERE is_published IS NULL; 