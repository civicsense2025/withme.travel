-- Create a simple function to check if current user is a trip member
CREATE OR REPLACE FUNCTION public.is_trip_member_simple(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id AND user_id = auth.uid()
  );
$function$;

-- Drop any existing policy with this name (for idempotency)
DROP POLICY IF EXISTS "Allow members to view trip members" ON public.trip_members;

-- Create a more restrictive policy for selecting trip members
CREATE POLICY "Allow members to view trip members" 
ON public.trip_members
FOR SELECT
TO public
USING (
  -- Can view members of trips that the user is a member of
  public.is_trip_member_simple(trip_id)
); 