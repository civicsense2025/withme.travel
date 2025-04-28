\
-- Migration to create/update the RPC function for reordering itinerary items
-- This version KEEPS itinerary_sections and handles section_id lookup.

-- Ensure section_id column exists and is nullable on itinerary_items
ALTER TABLE public.itinerary_items
  ADD COLUMN IF NOT EXISTS section_id uuid NULL REFERENCES public.itinerary_sections(id) ON DELETE SET NULL,
  ALTER COLUMN day_number DROP NOT NULL; -- Ensure day_number can be NULL

-- Ensure position column exists
ALTER TABLE public.itinerary_items
  ADD COLUMN IF NOT EXISTS "position" integer NOT NULL DEFAULT 0;

-- Create or replace the function
CREATE OR REPLACE FUNCTION public.update_itinerary_item_position(
    p_item_id uuid,
    p_trip_id uuid,
    p_day_number integer, -- Target day number (NULL for unscheduled)
    p_position integer   -- Target position within the day/unscheduled list
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Or INVOKER if preferred and permissions are set
AS $$
DECLARE
  v_old_day_number integer;
  v_old_position integer;
  v_old_section_id uuid;
  v_new_section_id uuid; -- Target section_id
BEGIN
  -- 1. Get the old state of the item being moved
  SELECT day_number, "position", section_id
  INTO v_old_day_number, v_old_position, v_old_section_id
  FROM public.itinerary_items
  WHERE id = p_item_id AND trip_id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Itinerary item with id % not found for trip %', p_item_id, p_trip_id;
    RETURN;
  END IF;

  -- 2. Determine the target section_id based on p_day_number
  IF p_day_number IS NULL THEN
    v_new_section_id := NULL; -- Moving to unscheduled
  ELSE
    -- Find the section for the target day
    SELECT id
    INTO v_new_section_id
    FROM public.itinerary_sections
    WHERE trip_id = p_trip_id AND day_number = p_day_number;

    -- Optional: Create section if it doesn't exist? Or raise error?
    IF v_new_section_id IS NULL THEN
       RAISE EXCEPTION 'Target itinerary section for trip %, day % not found.', p_trip_id, p_day_number;
       -- Alternatively, you could insert a new section here:
       -- INSERT INTO public.itinerary_sections (trip_id, day_number, position)
       -- VALUES (p_trip_id, p_day_number, p_day_number) -- Simple position based on day
       -- RETURNING id INTO v_new_section_id;
       RETURN; -- Exit if section not found (or after creating)
    END IF;
  END IF;

  -- 3. Check if a meaningful change is actually happening
  IF v_old_day_number IS NOT DISTINCT FROM p_day_number AND
     v_old_position IS NOT DISTINCT FROM p_position AND
     v_old_section_id IS NOT DISTINCT FROM v_new_section_id THEN
     -- RAISE NOTICE 'No change needed for item %', p_item_id;
     RETURN; -- Exit if no change
  END IF;

  -- 4. Adjust positions in the OLD location (day/section or unscheduled)
  UPDATE public.itinerary_items
  SET "position" = "position" - 1,
      updated_at = now()
  WHERE trip_id = p_trip_id
    AND id != p_item_id
    AND day_number IS NOT DISTINCT FROM v_old_day_number -- Match old day (handles NULL)
    AND section_id IS NOT DISTINCT FROM v_old_section_id -- Match old section (handles NULL)
    AND "position" > v_old_position;                 -- Only items after the old position

  -- 5. Adjust positions in the NEW location (day/section or unscheduled)
  UPDATE public.itinerary_items
  SET "position" = "position" + 1,
      updated_at = now()
  WHERE trip_id = p_trip_id
    AND id != p_item_id
    AND day_number IS NOT DISTINCT FROM p_day_number -- Match new day (handles NULL)
    AND section_id IS NOT DISTINCT FROM v_new_section_id -- Match new section (handles NULL)
    AND "position" >= p_position;                -- Items at or after the new position

  -- 6. Update the target item itself
  UPDATE public.itinerary_items
  SET
    day_number = p_day_number,      -- New day number (or NULL)
    "position" = p_position,        -- New position
    section_id = v_new_section_id,  -- New section_id (or NULL)
    updated_at = now()              -- Update timestamp
  WHERE id = p_item_id AND trip_id = p_trip_id;

END;
$$;

-- Grant execute permission if needed (e.g., for SECURITY INVOKER or specific roles)
-- GRANT EXECUTE ON FUNCTION public.update_itinerary_item_position(uuid, uuid, integer, integer) TO authenticated; 