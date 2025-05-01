-- Force insert sections function with detailed logging
-- This function will insert sections for each day number found in itinerary items
-- and report exactly what was done or why nothing was done

DO $$
DECLARE
    v_trip_id UUID := '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85';
    v_day RECORD;
    v_section_exists BOOLEAN;
    v_section_id UUID;
    v_sections_created INTEGER := 0;
    v_sections_existing INTEGER := 0;
BEGIN
    -- Log that we're starting
    RAISE NOTICE 'Starting section creation for trip %', v_trip_id;
    
    -- First verify the trip exists
    IF NOT EXISTS (SELECT 1 FROM public.trips WHERE id = v_trip_id) THEN
        RAISE EXCEPTION 'Trip with ID % does not exist', v_trip_id;
    END IF;
    
    -- Get all unique day numbers from items for this trip
    FOR v_day IN (
        SELECT DISTINCT day_number 
        FROM public.itinerary_items 
        WHERE trip_id = v_trip_id AND day_number IS NOT NULL
        ORDER BY day_number
    ) LOOP
        -- Check if a section already exists for this day
        SELECT EXISTS (
            SELECT 1 FROM public.itinerary_sections 
            WHERE trip_id = v_trip_id AND day_number = v_day.day_number
        ) INTO v_section_exists;
        
        IF v_section_exists THEN
            RAISE NOTICE 'Day % already has a section', v_day.day_number;
            v_sections_existing := v_sections_existing + 1;
        ELSE
            -- Insert a new section for this day
            INSERT INTO public.itinerary_sections 
                (trip_id, day_number, title, position, created_at, updated_at)
            VALUES 
                (v_trip_id, v_day.day_number, 'Day ' || v_day.day_number, 
                 v_day.day_number, NOW(), NOW())
            RETURNING id INTO v_section_id;
            
            RAISE NOTICE 'Created section % for day %', v_section_id, v_day.day_number;
            v_sections_created := v_sections_created + 1;
        END IF;
    END LOOP;
    
    -- Update trip duration_days if needed
    UPDATE public.trips t
    SET duration_days = greatest(COALESCE(t.duration_days, 0), subquery.max_day)
    FROM (
        SELECT MAX(day_number) as max_day
        FROM public.itinerary_items
        WHERE trip_id = v_trip_id AND day_number IS NOT NULL
    ) subquery
    WHERE t.id = v_trip_id
      AND (t.duration_days IS NULL OR t.duration_days < subquery.max_day);
    
    -- Final summary
    RAISE NOTICE 'Summary: % sections existed, % sections created', 
        v_sections_existing, v_sections_created;
        
    IF v_sections_created = 0 AND v_sections_existing = 0 THEN
        RAISE WARNING 'No sections created or found - check if items have day_number values';
    END IF;
END $$;

-- After running the function, show the result
SELECT 
    'Itinerary items with day numbers:' as info,
    day_number,
    COUNT(*) as count
FROM 
    public.itinerary_items
WHERE 
    trip_id = '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'
    AND day_number IS NOT NULL
GROUP BY 
    day_number
ORDER BY 
    day_number;

SELECT 
    'Sections after script:' as info,
    id,
    day_number,
    title,
    position,
    created_at
FROM 
    public.itinerary_sections
WHERE 
    trip_id = '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'
ORDER BY 
    day_number; 