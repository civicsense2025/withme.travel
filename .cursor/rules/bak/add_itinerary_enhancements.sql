-- Migration script to add columns for itinerary builder enhancements

-- Add duration_days to trips table if it doesn't exist
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 1;

-- Add estimated_cost to itinerary_items table if it doesn't exist
ALTER TABLE public.itinerary_items
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC;

-- Add currency to itinerary_items table if it doesn't exist
ALTER TABLE public.itinerary_items
ADD COLUMN IF NOT EXISTS currency TEXT;

-- Add duration_minutes to itinerary_items table if it doesn't exist
ALTER TABLE public.itinerary_items
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Optional: Add an index for faster querying by day and position
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day_position 
ON public.itinerary_items (trip_id, day_number, position);

-- Add comment for clarity
COMMENT ON COLUMN public.trips.duration_days IS 'Explicit number of days for the trip itinerary.';
COMMENT ON COLUMN public.itinerary_items.estimated_cost IS 'Estimated cost for the itinerary item.';
COMMENT ON COLUMN public.itinerary_items.currency IS 'Currency code for the estimated cost (e.g., USD, EUR).';
COMMENT ON COLUMN public.itinerary_items.duration_minutes IS 'Estimated duration of the activity in minutes.'; 