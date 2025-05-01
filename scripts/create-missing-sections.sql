-- Script to create missing itinerary sections for trips based on existing items
-- Run this in the Supabase SQL Editor

-- Substitute your specific trip ID below (or leave NULL to process all trips)
\set trip_id '41d4e9e6-f0f9-49d4-bbbc-bdf5757bae85'

-- Start a transaction so we can rollback if something goes wrong
BEGIN;

-- Get the current max section position for the trip (to use when creating sections)
CREATE TEMPORARY TABLE max_positions AS
SELECT 
    trip_id, 
    COALESCE(MAX(position), 0) as max_position
FROM 
    public.itinerary_sections
WHERE 
    trip_id = :'trip_id' OR :'trip_id' IS NULL
GROUP BY 
    trip_id;

-- Find all day numbers in itinerary_items that don't have corresponding sections
WITH missing_sections AS (
    SELECT DISTINCT
        items.trip_id,
        items.day_number
    FROM 
        public.itinerary_items items
    LEFT JOIN 
        public.itinerary_sections sections
        ON items.trip_id = sections.trip_id 
        AND items.day_number = sections.day_number
    WHERE 
        items.day_number IS NOT NULL
        AND sections.id IS NULL
        AND (items.trip_id = :'trip_id' OR :'trip_id' IS NULL)
)
-- Insert the missing sections with proper position values
INSERT INTO public.itinerary_sections 
    (trip_id, day_number, title, position, created_at, updated_at)
SELECT 
    ms.trip_id,
    ms.day_number,
    'Day ' || ms.day_number, -- Default title
    mp.max_position + ROW_NUMBER() OVER (PARTITION BY ms.trip_id ORDER BY ms.day_number), -- Increment position
    NOW(), -- created_at
    NOW()  -- updated_at
FROM 
    missing_sections ms
JOIN 
    max_positions mp ON ms.trip_id = mp.trip_id;

-- Optionally, update max duration_days in trips table if needed
UPDATE public.trips t
SET duration_days = greatest(t.duration_days, subquery.max_day)
FROM (
    SELECT 
        trip_id, 
        MAX(day_number) as max_day
    FROM 
        public.itinerary_items
    WHERE 
        day_number IS NOT NULL
        AND (trip_id = :'trip_id' OR :'trip_id' IS NULL)
    GROUP BY 
        trip_id
) subquery
WHERE t.id = subquery.trip_id
  AND (t.duration_days IS NULL OR t.duration_days < subquery.max_day);

-- Report on sections created
SELECT 
    'Created sections for missing days in trip: ' || trip_id as result,
    array_agg(day_number ORDER BY day_number) as days_created
FROM 
    public.itinerary_sections
WHERE 
    created_at > NOW() - INTERVAL '5 minutes'
    AND (trip_id = :'trip_id' OR :'trip_id' IS NULL)
GROUP BY 
    trip_id;

-- If no issues, commit the transaction
COMMIT; 