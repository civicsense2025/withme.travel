-- Script to forcibly create sections for every day number in a trip
-- Run this in the Supabase SQL Editor

-- Using a variable in PL/pgSQL instead of \set
DO $$ 
DECLARE
    v_trip_id UUID := '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85';
BEGIN
    -- 1. Get all unique day numbers from items and insert sections
    INSERT INTO public.itinerary_sections
        (trip_id, day_number, title, position, created_at, updated_at)
    SELECT 
        trip_id,
        day_number,
        'Day ' || day_number AS title,
        day_number AS position, -- Just use day number as position
        NOW() AS created_at,
        NOW() AS updated_at
    FROM (
        SELECT DISTINCT 
            trip_id,
            day_number
        FROM 
            public.itinerary_items
        WHERE 
            trip_id = v_trip_id
            AND day_number IS NOT NULL
    ) d
    WHERE NOT EXISTS (
        -- Only insert if a section for this day doesn't already exist
        SELECT 1 FROM public.itinerary_sections 
        WHERE trip_id = d.trip_id AND day_number = d.day_number
    );

    -- 3. Update trip duration_days if needed
    UPDATE public.trips t
    SET duration_days = greatest(t.duration_days, subquery.max_day)
    FROM (
        SELECT MAX(day_number) as max_day
        FROM public.itinerary_items
        WHERE trip_id = v_trip_id AND day_number IS NOT NULL
    ) subquery
    WHERE t.id = v_trip_id
      AND (t.duration_days IS NULL OR t.duration_days < subquery.max_day);
END $$;

-- Show what items exist with day numbers
SELECT 
    'Items with day numbers:' as info,
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

-- Show sections after our operation
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

-- Show any day numbers that still don't have sections
SELECT 
    'MISSING SECTIONS:' as problem,
    items.day_number,
    COUNT(*) as item_count
FROM 
    public.itinerary_items items
LEFT JOIN 
    public.itinerary_sections sections
    ON items.trip_id = sections.trip_id 
    AND items.day_number = sections.day_number
WHERE 
    items.trip_id = '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'
    AND items.day_number IS NOT NULL
    AND sections.id IS NULL
GROUP BY 
    items.day_number
ORDER BY 
    items.day_number; 