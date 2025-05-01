-- Script to verify if there are missing sections in the trip
-- This script directly checks if there are items with day numbers that don't have corresponding sections

-- Set the trip ID directly using a hardcoded value
WITH items_without_sections AS (
    -- Find all itinerary items with day numbers that don't have corresponding sections
    SELECT
        items.id as item_id,
        items.title as item_title,
        items.day_number,
        items.trip_id
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
)
SELECT
    *,
    'These items have day numbers but no corresponding sections' as issue
FROM
    items_without_sections;

-- If we don't find any missing sections, let's check what's actually in both tables
SELECT
    'ITINERARY ITEMS' as table_name,
    id,
    title,
    day_number,
    created_at
FROM
    public.itinerary_items
WHERE
    trip_id = '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'
    AND day_number IS NOT NULL
ORDER BY
    day_number, position;

SELECT
    'ITINERARY SECTIONS' as table_name,
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