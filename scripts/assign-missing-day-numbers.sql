-- Script to assign day numbers to items with NULL day_number values
-- This is useful for fixing trips that have items without day numbers

DO $$
DECLARE
    v_trip_id UUID := '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85';
    v_default_day INTEGER := 1;  -- Default day number to assign
    v_updated_count INTEGER := 0;
BEGIN
    -- Update all items with NULL day_number to have the default day
    UPDATE public.itinerary_items
    SET 
        day_number = v_default_day,
        updated_at = NOW()
    WHERE 
        trip_id = v_trip_id
        AND day_number IS NULL
    RETURNING (1) INTO v_updated_count;
    
    -- Log what we did
    IF v_updated_count > 0 THEN
        RAISE NOTICE 'Updated % items to have day_number = %', v_updated_count, v_default_day;
        
        -- Now create the section for day 1 if it doesn't exist
        INSERT INTO public.itinerary_sections 
            (trip_id, day_number, title, position, created_at, updated_at)
        VALUES 
            (v_trip_id, v_default_day, 'Day ' || v_default_day, v_default_day, NOW(), NOW())
        ON CONFLICT (trip_id, day_number) DO NOTHING;
        
        -- Update the trip's duration_days if needed
        UPDATE public.trips t
        SET 
            duration_days = GREATEST(COALESCE(t.duration_days, 0), v_default_day),
            updated_at = NOW()
        WHERE 
            t.id = v_trip_id
            AND (t.duration_days IS NULL OR t.duration_days < v_default_day);
    ELSE
        RAISE NOTICE 'No items with NULL day_number found for trip %', v_trip_id;
    END IF;
END $$;

-- Show current state after updates
SELECT 
    'Itinerary items by day number:' as info,
    day_number,
    COUNT(*) as count
FROM 
    public.itinerary_items
WHERE 
    trip_id = '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'
GROUP BY 
    day_number
ORDER BY 
    day_number NULLS LAST;

-- Show sections
SELECT 
    'Sections:' as info,
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