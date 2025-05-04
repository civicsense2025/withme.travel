-- Drop both versions of the is_trip_member function to avoid conflicts
DROP FUNCTION IF EXISTS public.is_trip_member(uuid);
DROP FUNCTION IF EXISTS public.is_trip_member(uuid, uuid); 