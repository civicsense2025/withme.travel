drop policy "Allow members to view other members" on "public"."trip_members";

set check_function_bodies = off;

-- Add the function definition before using it
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id uuid)
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

CREATE OR REPLACE FUNCTION public.calculate_trip_duration()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN

-- NEW LOGIC (correct)
IF NEW.end_date IS NOT NULL AND NEW.start_date IS NOT NULL AND NEW.end_date >= NEW.start_date THEN
  -- Calculate the interval and extract the number of full days
  NEW.duration_days := EXTRACT(DAY FROM (NEW.end_date - NEW.start_date)); 
  -- Optionally add 1 if you want inclusive duration (e.g., start/end on same day = 1 day)
  -- NEW.duration_days := EXTRACT(DAY FROM (NEW.end_date - NEW.start_date)) + 1; 
ELSE
  -- Handle cases where dates are invalid or null (set duration to 0, 1, or NULL as appropriate)
  NEW.duration_days := NULL; -- Or 0 or 1 depending on desired logic
END IF;
  RETURN NEW;
END;$function$
;

-- Create a temporary policy that doesn't use is_trip_member
create policy "Allow members to view other members"
on "public"."trip_members"
as permissive
for select
to public
using (true);



