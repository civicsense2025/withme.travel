-- Script to check for NULL day numbers in itinerary items
-- Trips with NULL day numbers won't have sections created by the scripts

-- Set the trip ID
\set trip_id '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'

-- Check if there are any items with NULL day_number
SELECT 
    id,
    title,
    day_number,
    position,
    created_at,
    updated_at
FROM 
    public.itinerary_items
WHERE 
    trip_id = :'trip_id'
    AND day_number IS NULL
ORDER BY 
    position;

-- Check the counts of NULL vs non-NULL day_number items
SELECT 
    CASE WHEN day_number IS NULL THEN 'NULL day_number' ELSE 'Has day_number' END as item_type,
    COUNT(*) as count
FROM 
    public.itinerary_items
WHERE 
    trip_id = :'trip_id'
GROUP BY 
    CASE WHEN day_number IS NULL THEN 'NULL day_number' ELSE 'Has day_number' END; 