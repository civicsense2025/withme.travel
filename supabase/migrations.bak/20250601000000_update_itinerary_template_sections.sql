-- Migration to ensure itinerary_template_sections table handles UPSERT based on required fields.

-- Ensure the unique constraint exists on template_id and day_number
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'itinerary_template_sections_template_id_day_number_key'
          AND conrelid = 'public.itinerary_template_sections'::regclass
    ) THEN
        ALTER TABLE public.itinerary_template_sections
        ADD CONSTRAINT itinerary_template_sections_template_id_day_number_key UNIQUE (template_id, day_number);
    END IF;
END $$;

-- Remove the problematic INSERT statement below
-- -- SQL statement for inserting or updating itinerary_template_sections
-- -- This assumes the table 'itinerary_template_sections' exists with at least 'id', 'template_id', 'day_number', and 'created_at' columns.
-- -- Adjust if other non-nullable columns exist that aren't part of the required fields provided.
-- 
-- INSERT INTO public.itinerary_template_sections (template_id, day_number)
-- VALUES (:template_id, :day_number) -- Use parameterized values if applicable, or replace with actual logic
-- ON CONFLICT (template_id, day_number)
-- DO UPDATE SET
--   updated_at = NOW(); -- Or update other fields as needed

-- Add other necessary updates or constraints for itinerary_template_sections here 