-- Policy for itinerary_items: Allow public read access if trip is public/shared
DROP POLICY IF EXISTS "Allow public read access for itinerary items" ON public.itinerary_items;
CREATE POLICY "Allow public read access for itinerary items"
ON public.itinerary_items
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.trips t
        WHERE t.id = public.itinerary_items.trip_id
        AND (t.privacy_setting = 'public' OR t.privacy_setting = 'shared_with_link')
    )
);

-- Policy for itinerary_items: Allow members to view items for their trips (keep existing policy)
-- Ensure this policy exists or adjust as needed. If it exists, the name might be different.
-- If creating anew or unsure, use this:
DROP POLICY IF EXISTS "Allow members to view itinerary items" ON public.itinerary_items;
CREATE POLICY "Allow members to view itinerary items"
ON public.itinerary_items
FOR SELECT
TO authenticated -- Only applies to logged-in users
USING (
    EXISTS (
        SELECT 1 FROM public.trip_members tm
        WHERE tm.trip_id = public.itinerary_items.trip_id AND tm.user_id = auth.uid()
    )
);


-- Assuming itinerary_sections table exists and needs similar RLS:
-- Policy for itinerary_sections: Allow public read access if trip is public/shared
DROP POLICY IF EXISTS "Allow public read access for itinerary sections" ON public.itinerary_sections;
CREATE POLICY "Allow public read access for itinerary sections"
ON public.itinerary_sections
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.trips t
        WHERE t.id = public.itinerary_sections.trip_id
        AND (t.privacy_setting = 'public' OR t.privacy_setting = 'shared_with_link')
    )
);

-- Policy for itinerary_sections: Allow members to view sections for their trips
DROP POLICY IF EXISTS "Allow members to view itinerary sections" ON public.itinerary_sections;
CREATE POLICY "Allow members to view itinerary sections"
ON public.itinerary_sections
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trip_members tm
        WHERE tm.trip_id = public.itinerary_sections.trip_id AND tm.user_id = auth.uid()
    )
); 