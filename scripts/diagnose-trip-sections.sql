-- Diagnostic script to check for missing sections in a trip
-- Trip ID to check
\set trip_id '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'

-- 1. Check if the trip exists
SELECT 
    id, 
    name, 
    duration_days
FROM 
    public.trips
WHERE 
    id = :'trip_id';

-- 2. List all itinerary items with their day numbers
SELECT 
    id,
    title,
    day_number,
    created_at
FROM 
    public.itinerary_items
WHERE 
    trip_id = :'trip_id'
ORDER BY 
    day_number NULLS LAST, 
    position;

-- 3. List existing sections
SELECT 
    id,
    day_number,
    title,
    position
FROM 
    public.itinerary_sections
WHERE 
    trip_id = :'trip_id'
ORDER BY 
    position;

-- 4. Check for day numbers in items that don't have sections
SELECT 
    items.day_number,
    COUNT(*) as item_count,
    'Missing section' as status
FROM 
    public.itinerary_items items
LEFT JOIN 
    public.itinerary_sections sections
    ON items.trip_id = sections.trip_id 
    AND items.day_number = sections.day_number
WHERE 
    items.trip_id = :'trip_id'
    AND items.day_number IS NOT NULL
    AND sections.id IS NULL
GROUP BY 
    items.day_number
ORDER BY 
    items.day_number;

-- 5. Count items by day number
SELECT 
    day_number,
    COUNT(*) as count
FROM 
    public.itinerary_items
WHERE 
    trip_id = :'trip_id'
GROUP BY 
    day_number
ORDER BY 
    day_number NULLS LAST; 