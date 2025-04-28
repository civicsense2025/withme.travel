-- Enable read access for trips marked as public or shared_with_link for ALL users (including anon)
DROP POLICY IF EXISTS "Allow public read access based on privacy_setting" ON public.trips;

CREATE POLICY "Allow public read access based on privacy_setting"
ON public.trips
FOR SELECT
TO anon, authenticated -- Apply to both anon and authenticated roles
USING (
    privacy_setting = 'public'
    OR privacy_setting = 'shared_with_link'
);

-- Optionally, drop the old policy based on `is_public` if it still exists
DROP POLICY IF EXISTS "Allow public read access" ON public.trips; 