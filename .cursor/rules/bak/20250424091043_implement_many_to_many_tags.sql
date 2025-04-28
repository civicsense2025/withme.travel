-- 1. Create the 'tags' table to store unique tag names
CREATE TABLE IF NOT EXISTS public.tags (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE, -- Ensure tag names are unique
    created_at timestamptz NULL DEFAULT now()
);

COMMENT ON TABLE public.tags IS 'Stores unique tags that can be applied to trips.';
COMMENT ON COLUMN public.tags.name IS 'The unique name of the tag (e.g., "beach", "hiking").';

-- Enable RLS for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tags: Allow authenticated users to read all tags
DROP POLICY IF EXISTS "Allow authenticated users to read tags" ON public.tags;
CREATE POLICY "Allow authenticated users to read tags"
    ON public.tags
    FOR SELECT
    TO authenticated -- Or your specific logged-in role
    USING (true);

-- RLS Policy for tags: Potentially allow authenticated users to insert new tags? (Optional)
-- Decide if any authenticated user can create a tag, or only admins, etc.
-- Example: Allow any logged-in user to insert (could lead to many tags)
DROP POLICY IF EXISTS "Allow authenticated users to insert tags" ON public.tags;
CREATE POLICY "Allow authenticated users to insert tags"
    ON public.tags
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
-- Consider adding policies for UPDATE/DELETE if needed (e.g., only for admins)


-- 2. Create the 'trip_tags' join table
CREATE TABLE IF NOT EXISTS public.trip_tags (
    trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    assigned_at timestamptz NULL DEFAULT now(),
    PRIMARY KEY (trip_id, tag_id) -- Composite primary key prevents duplicate tags per trip
);

COMMENT ON TABLE public.trip_tags IS 'Join table linking trips to their tags.';

-- Add indexes for potentially faster lookups
CREATE INDEX IF NOT EXISTS idx_trip_tags_trip_id ON public.trip_tags(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_tags_tag_id ON public.trip_tags(tag_id);

-- Enable RLS for trip_tags
ALTER TABLE public.trip_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_tags:
-- We can reuse the RLS helper functions created earlier (is_trip_member, can_manage_trip_members)

-- Allow trip members to view the tags associated with their trip
DROP POLICY IF EXISTS "Allow members to view their trip tags" ON public.trip_tags;
CREATE POLICY "Allow members to view their trip tags"
    ON public.trip_tags
    FOR SELECT
    USING ( is_trip_member(trip_id) ); -- Assumes is_trip_member(uuid) function exists

-- Allow trip admins/editors to manage tags for their trip (insert/delete)
DROP POLICY IF EXISTS "Allow admins/editors to manage trip tags" ON public.trip_tags;
CREATE POLICY "Allow admins/editors to manage trip tags"
    ON public.trip_tags
    FOR ALL -- Covers INSERT, DELETE (UPDATE doesn't make sense here)
    USING ( can_manage_trip_members(trip_id) ) -- Assumes can_manage_trip_members(uuid) function exists
    WITH CHECK ( can_manage_trip_members(trip_id) );


-- 3. Remove the old 'tags' array column from the 'trips' table if it exists
ALTER TABLE public.trips
DROP COLUMN IF EXISTS tags;
