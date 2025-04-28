-- Migration: Add function for copying parts of itineraries
-- Date: 2025-05-31

/*
This migration adds a function to copy selected parts of itineraries while:
1. Maintaining SEO integrity
2. Preserving attribution 
3. Allowing flexible selection of items
4. Keeping proper day structure

This builds on the comprehensive SEO implementation and enables 
users to selectively copy itinerary items they like.
*/

-- Function to copy selected parts of an itinerary
CREATE OR REPLACE FUNCTION public.copy_itinerary_parts(
    source_trip_id UUID,                -- Source trip containing items to copy
    destination_trip_id UUID,           -- Destination trip where items will be copied
    user_id UUID,                       -- User performing the copy
    item_ids UUID[] = NULL,             -- Optional: specific items to copy (if NULL, uses day_numbers)
    day_numbers INTEGER[] = NULL,       -- Optional: specific days to copy (if item_ids is NULL)
    target_start_day INTEGER = NULL,    -- Optional: day number to start copying to (preserves relative structure)
    preserve_dates BOOLEAN = FALSE,     -- Whether to preserve exact dates or just day structure
    add_attribution BOOLEAN = TRUE      -- Whether to add attribution text to copied items
) RETURNS TABLE (
    copied_item_id UUID,               -- ID of newly created item
    source_item_id UUID,               -- ID of original item
    day_number INTEGER                 -- Day number in destination trip
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_items_to_copy UUID[];
    v_min_day_number INTEGER;
    v_day_offset INTEGER := 0;
    v_source_trip_start_date DATE;
    v_dest_trip_start_date DATE;
    v_date_offset INTEGER := 0;
    r_item RECORD;
    v_new_item_id UUID;
BEGIN
    -- Step 1: Determine which items to copy
    IF item_ids IS NOT NULL AND array_length(item_ids, 1) > 0 THEN
        -- Use provided item IDs
        v_items_to_copy := item_ids;
    ELSIF day_numbers IS NOT NULL AND array_length(day_numbers, 1) > 0 THEN
        -- Get all items from specified days
        SELECT array_agg(id) INTO v_items_to_copy
        FROM public.itinerary_items
        WHERE trip_id = source_trip_id
        AND day_number = ANY(day_numbers);
    ELSE
        -- No specific selection, raise exception
        RAISE EXCEPTION 'Either item_ids or day_numbers must be provided';
    END IF;
    
    -- Ensure we found items to copy
    IF v_items_to_copy IS NULL OR array_length(v_items_to_copy, 1) = 0 THEN
        RAISE EXCEPTION 'No items found to copy';
    END IF;
    
    -- Step 2: Calculate day offset if target_start_day is specified
    IF target_start_day IS NOT NULL THEN
        -- Find minimum day number from selected items
        SELECT MIN(day_number) INTO v_min_day_number
        FROM public.itinerary_items
        WHERE id = ANY(v_items_to_copy);
        
        v_day_offset := target_start_day - v_min_day_number;
    END IF;
    
    -- Step 3: Calculate date offset if preserve_dates is true
    IF preserve_dates THEN
        -- Get trip start dates
        SELECT start_date INTO v_source_trip_start_date
        FROM public.trips
        WHERE id = source_trip_id;
        
        SELECT start_date INTO v_dest_trip_start_date
        FROM public.trips
        WHERE id = destination_trip_id;
        
        -- Calculate date offset in days
        IF v_source_trip_start_date IS NOT NULL AND v_dest_trip_start_date IS NOT NULL THEN
            v_date_offset := v_dest_trip_start_date - v_source_trip_start_date;
        END IF;
    END IF;
    
    -- Step 4: Copy each item
    FOR r_item IN 
        SELECT * FROM public.itinerary_items
        WHERE id = ANY(v_items_to_copy)
        ORDER BY day_number, start_time
    LOOP
        -- Insert new copy of the item
        INSERT INTO public.itinerary_items (
            -- Basic fields
            trip_id,
            created_by,
            title,
            description,
            status,
            start_time,
            end_time,
            day_number,
            date,
            address,
            latitude,
            longitude,
            place_id,
            category,
            is_custom,
            tags,
            personal_notes,

            -- SEO and attribution fields
            source_item_id,
            original_creator_id,
            attribution_text,
            content_type,
            url_format,
            canonical_id,
            
            -- Content quality fields
            quality_tier,
            moderation_status,
            content_word_count,
            has_images,
            has_videos
        )
        VALUES (
            -- Basic fields
            destination_trip_id,
            user_id,
            r_item.title,
            r_item.description,
            'suggested',
            r_item.start_time,
            r_item.end_time,
            r_item.day_number + v_day_offset,
            CASE 
                WHEN preserve_dates AND r_item.date IS NOT NULL 
                THEN r_item.date + v_date_offset
                ELSE NULL
            END,
            r_item.address,
            r_item.latitude,
            r_item.longitude,
            r_item.place_id,
            r_item.category,
            TRUE,
            r_item.tags,
            NULL, -- Personal notes are not copied
            
            -- SEO and attribution fields
            r_item.id, -- Reference to source item
            COALESCE(r_item.original_creator_id, r_item.created_by),
            CASE 
                WHEN add_attribution THEN
                    CASE
                        WHEN r_item.attribution_text IS NOT NULL THEN r_item.attribution_text
                        ELSE 'Based on an activity originally created by ' || 
                            (SELECT username FROM public.profiles WHERE id = COALESCE(r_item.original_creator_id, r_item.created_by))
                    END
                ELSE NULL
            END,
            'public_trip',
            'hybrid',
            -- Maintain canonical reference if source is verified
            CASE 
                WHEN r_item.is_verified THEN COALESCE(r_item.canonical_id, r_item.id)
                ELSE NULL
            END,
            
            -- Content quality fields (slightly reduced)
            CASE
                WHEN r_item.quality_tier = 'premium' THEN 'standard'
                ELSE r_item.quality_tier
            END,
            'pending_review',
            r_item.content_word_count,
            r_item.has_images,
            r_item.has_videos
        )
        RETURNING id INTO v_new_item_id;
        
        -- Increment popularity metrics on source item
        UPDATE public.itinerary_items
        SET 
            popularity_score = COALESCE(popularity_score, 0) + 1
        WHERE id = r_item.id;
        
        -- Return information about the copied item
        copied_item_id := v_new_item_id;
        source_item_id := r_item.id;
        day_number := r_item.day_number + v_day_offset;
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Create helpful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_day 
    ON public.itinerary_items(trip_id, day_number);
    
CREATE INDEX IF NOT EXISTS idx_itinerary_items_source 
    ON public.itinerary_items(source_item_id);

-- Add documentation
COMMENT ON FUNCTION public.copy_itinerary_parts IS $$
Function to copy selected parts of an itinerary while maintaining SEO integrity and proper attribution.

Examples:

1. Copy specific items to another trip:
   SELECT * FROM public.copy_itinerary_parts(
       'abc123'::uuid,                       -- Source trip
       'def456'::uuid,                       -- Destination trip
       current_user_id(),                    -- Current user
       ARRAY['item1'::uuid, 'item2'::uuid],  -- Specific items to copy
       NULL,                                 -- No day numbers (using item IDs)
       3,                                    -- Start at day 3 in destination
       false,                                -- Don't preserve dates
       true                                  -- Add attribution
   );

2. Copy entire days:
   SELECT * FROM public.copy_itinerary_parts(
       'abc123'::uuid,                       -- Source trip
       'def456'::uuid,                       -- Destination trip
       current_user_id(),                    -- Current user
       NULL,                                 -- No specific items
       ARRAY[2, 3],                          -- Copy days 2 and 3
       5,                                    -- Start at day 5 in destination
       true,                                 -- Preserve dates
       true                                  -- Add attribution
   );

Notes:
- The function preserves SEO benefits by maintaining canonical references for verified content
- Attribution is preserved to give credit to original creators
- Day structure is maintained with configurable starting day
- Date adjustments can be made relative to trip start dates
$$;

