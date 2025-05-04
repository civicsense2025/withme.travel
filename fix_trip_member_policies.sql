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

-- Drop any existing policy with this name
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

-- Create policy for inserting trip members (admin only)
CREATE POLICY "Allow trip admins to insert members" 
ON public.trip_members
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM trip_members
    WHERE trip_members.trip_id = trip_id 
    AND trip_members.user_id = auth.uid()
    AND trip_members.role = 'admin'
  )
);

-- Create policy for updating trip members (admin only)
CREATE POLICY "Allow trip admins to update members" 
ON public.trip_members
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM trip_members
    WHERE trip_members.trip_id = trip_id 
    AND trip_members.user_id = auth.uid()
    AND trip_members.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM trip_members
    WHERE trip_members.trip_id = trip_id 
    AND trip_members.user_id = auth.uid()
    AND trip_members.role = 'admin'
  )
);

-- Create policy for deleting trip members (admin only or self)
CREATE POLICY "Allow trip admins to delete members or members to delete self" 
ON public.trip_members
FOR DELETE
TO public
USING (
  (
    -- Admin can delete any member
    EXISTS (
      SELECT 1 
      FROM trip_members
      WHERE trip_members.trip_id = trip_id 
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  ) OR (
    -- Members can delete themselves
    user_id = auth.uid()
  )
); 