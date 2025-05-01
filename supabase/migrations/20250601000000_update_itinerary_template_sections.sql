-- Migration to ensure itinerary_template_sections table handles UPSERT based on required fields.

-- Ensure the unique constraint exists on trip_id and day_number
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'itinerary_template_sections_trip_id_day_number_key'
          AND conrelid = 'public.itinerary_template_sections'::regclass
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD CONSTRAINT itinerary_template_sections_trip_id_day_number_key UNIQUE (trip_id, day_number);
    END IF;
END $$;

-- SQL statement for inserting or updating itinerary_template_sections
-- This assumes the table 'itinerary_template_sections' exists with at least 'id', 'trip_id', 'day_number', and 'created_at' columns.
-- Adjust if other non-nullable columns exist that aren't part of the required fields provided.
INSERT INTO public.itinerary_template_sections (trip_id, day_number)
VALUES
    -- Example Usage: Replace with actual values
    ('your-template-trip-id-uuid', 1),
    ('your-template-trip-id-uuid', 2)
ON CONFLICT (trip_id, day_number)
DO UPDATE SET
    -- Update fields if the row already exists. Based on required fields, there's nothing to update.
    -- If optional fields existed (e.g., title), you would update them here:
    -- title = EXCLUDED.title,
    trip_id = EXCLUDED.trip_id, -- Keep this to ensure the update happens, even if no other fields change
    day_number = EXCLUDED.day_number;

-- Note: The example VALUES clause should be replaced with actual data insertion logic
-- or removed if this script is only meant to ensure the constraint exists.
-- For a reusable function, you might create a PL/pgSQL function instead. 