-- Create the tags table
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comments to the tags table and columns
COMMENT ON TABLE public.tags IS 'Stores unique tags that can be applied to trips.';
COMMENT ON COLUMN public.tags.id IS 'Unique identifier for the tag.';
COMMENT ON COLUMN public.tags.name IS 'The unique name of the tag.';
COMMENT ON COLUMN public.tags.created_at IS 'Timestamp when the tag was created.';

-- Create the trip_tags join table
CREATE TABLE IF NOT EXISTS public.trip_tags (
    trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (trip_id, tag_id) -- Composite primary key
);

-- Add comments to the trip_tags table and columns
COMMENT ON TABLE public.trip_tags IS 'Join table linking trips to tags.';
COMMENT ON COLUMN public.trip_tags.trip_id IS 'Foreign key referencing the trip.';
COMMENT ON COLUMN public.trip_tags.tag_id IS 'Foreign key referencing the tag.';
COMMENT ON COLUMN public.trip_tags.assigned_at IS 'Timestamp when the tag was assigned to the trip.';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trip_tags_trip_id ON public.trip_tags(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_tags_tag_id ON public.trip_tags(tag_id);
