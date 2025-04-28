-- Migration: Content Sharing Implementation
-- Date: 2025-06-10

/*
This migration implements content sharing functionality:
1. Content copying function
2. Attribution tracking
3. Customization handling
4. Popularity metrics

It builds upon the previous migrations (core schema, SEO, and user preferences)
to enable a complete system for sharing and customizing itinerary content.
*/

-- =============================================
-- SCHEMA UPDATES
-- =============================================

-- Add sharing-specific fields to itinerary_items
ALTER TABLE public.itinerary_items
    -- Sharing metrics
    ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_shared_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS shared_by UUID[] DEFAULT '{}'::UUID[],
    
    -- Permission and visibility
    ADD COLUMN IF NOT EXISTS sharing_enabled BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS sharing_permission_level TEXT DEFAULT 'copy_with_attribution',
    
    -- Versioning
    ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS forked_from_version INTEGER,
    ADD COLUMN IF NOT EXISTS has_been_modified BOOLEAN DEFAULT FALSE;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Main function to copy itinerary items between trips
CREATE OR REPLACE FUNCTION public.copy_itinerary_items(
    source_trip_id UUID,                 -- Original trip
    destination_trip_id UUID,            -- Target trip
    user_id UUID,                        -- User performing the copy
    item_ids UUID[] = NULL,              -- Specific items to copy
    day_numbers INTEGER[] = NULL,        -- Days to copy (alternative to item_ids)
    target_start_day INTEGER = NULL,     -- Where to place items in destination
    preserve_dates BOOLEAN = FALSE,      -- Keep exact dates or use relative
    preserve_customizations BOOLEAN = FALSE -- Copy user-specific customizations
) RETURNS TABLE (
    copied_item_id UUID,                 -- New item ID
    source_item_id UUID,                 -- Original item ID
    day_number INTEGER                   -- Day number in destination trip
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
    v_creator_username TEXT;
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
        -- Get original creator username for attribution
        SELECT username INTO v_creator_username
        FROM public.profiles
        WHERE id = COALESCE(r_item.original_creator_id, r_item.created_by);
        
        IF v_creator_username IS NULL THEN
            v_creator_username := 'another user';
        END IF;
        
        -- Create new copy of item
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
            tags,
            is_custom,
            
            -- Content layering
            original_description,
            
            -- Attribution
            source_item_id,
            original_creator_id,
            attribution_text,
            
            -- SEO
            content_type,
            url_format,
            public_slug,
            canonical_id,
            meta_title,
            meta_description,
            
            -- Quality metrics
            quality_tier,
            quality_score,
            
            -- Versioning
            version,
            forked_from_version
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
            r_item.tags,
            TRUE,
            
            -- Content layering
            r_item.description, -- Save original description
            
            -- Attribution
            r_item.id,
            COALESCE(r_item.original_creator_id, r_item.created_by),
            'Based on an activity originally created by ' || v_creator_username,
            
            -- SEO
            'public_trip',
            'hybrid',
            public.generate_slug(r_item.title),
            CASE 
                -- Maintain canonical reference if content is verified
                WHEN r_item.is_verified THEN COALESCE(r_item.canonical_id, r_item.id)
                ELSE NULL
            END,
            r_item.meta_title,
            r_item.meta_description,
            
            -- Quality metrics (slightly reduced for copies)
            CASE
                WHEN r_item.quality_tier = 'premium' THEN 'standard'
                ELSE r_item.quality_tier
            END,
            GREATEST(0, COALESCE(r_item.quality_score, 0) - 10),
            
            -- Versioning
            1, -- Start at version 1
            r_item.version -- Record which version this was forked from
        )
        RETURNING id INTO v_new_item_id;
        
        -- Step 5: Copy user customizations if requested
        IF preserve_customizations THEN
            INSERT INTO public.item_customizations (
                item_id,
                user_id,
                custom_title,
                custom_description,
                notes,
                reminders,
                custom_start_time,
                custom_duration_minutes,
                custom_date,
                custom_day_number,
                custom_links
            )
            SELECT
                v_new_item_id,
                copy_itinerary_items.user_id,
                custom_title,
                custom_description,
                notes,
                reminders,
                custom_start_time,
                custom_duration_minutes,
                CASE 
                    WHEN preserve_dates AND custom_date IS NOT NULL 
                    THEN custom_date + v_date_offset
                    ELSE custom_date
                END,
                CASE 
                    WHEN custom_day_number IS NOT NULL 
                    THEN custom_day_number + v_day_offset
                    ELSE custom_day_number
                END,
                custom_links
            FROM public.item_customizations
            WHERE item_id = r_item.id
            AND user_id = copy_itinerary_items.user_id;
        END IF;
        
        -- Step 6: Update popularity and sharing metrics on source item
        UPDATE public.itinerary_items
        SET 
            share_count = COALESCE(share_count, 0) + 1,
            last_shared_at = NOW(),
            shared_by = array_append(COALESCE(shared_by, '{}'::UUID[]), user_id),
            popularity_score = COALESCE(popularity_score, 0) + 2
        WHERE id = r_item.id;
        
        -- Step 7: Update user interests based on this copy action
        PERFORM public.record_item_interaction(
            user_id,
            r_item.id,
            'copy'
        );
        
        -- Return information about the copied item
        copied_item_id := v_new_item_id;
        source_item_id := r_item.id;
        day_number := r_item.day_number + v_day_offset;
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- Function to apply customizations to an item
CREATE OR REPLACE FUNCTION public.apply_item_customization(
    item_id UUID,
    user_id UUID,
    customizations JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_existing_id UUID;
BEGIN
    -- Check if customization already exists
    SELECT id INTO v_existing_id
    FROM public.item_customizations
    WHERE item_id = apply_item_customization.item_id
    AND user_id = apply_item_customization.user_id;
    
    IF v_existing_id IS NOT NULL THEN
        -- Update existing customization
        UPDATE public.item_customizations
        SET
            custom_title = COALESCE(customizations->>'custom_title', custom_title),
            custom_description = COALESCE(customizations->>'custom_description', custom_description),
            notes = COALESCE(customizations->>'notes', notes),
            reminders = COALESCE(customizations->'reminders'::TEXT[]::TEXT[], reminders),
            custom_start_time = COALESCE((customizations->>'custom_start_time')::TIME, custom_start_time),
            custom_duration_minutes = COALESCE((customizations->>'custom_duration_minutes')::INTEGER, custom_duration_minutes),
            custom_date = COALESCE((customizations->>'custom_date')::DATE, custom_date),
            custom_day_number = COALESCE((customizations->>'custom_day_number')::INTEGER, custom_day_number),
            custom_links = COALESCE(customizations->'custom_links', custom_links),
            is_favorite = COALESCE((customizations->>'is_favorite')::BOOLEAN, is_favorite),
            updated_at = NOW()
        WHERE id = v_existing_id;
        
        RETURN v_existing_id;
    ELSE
        -- Create new customization
        RETURN (
            INSERT INTO public.item_customizations (
                item_id,
                user_id,
                custom_title,
                custom_description,
                notes,
                reminders,
                custom_start_time,
                custom_duration_minutes,
                custom_date,
                custom_day_number,
                custom_links,
                is_favorite
            ) VALUES (
                apply_item_customization.item_id,
                apply_item_customization.user_id,
                customizations->>'custom_title',
                customizations->>'custom_description',
                customizations->>'notes',
                (customizations->'reminders')::TEXT[]::TEXT[],
                (customizations->>'custom_start_time')::TIME,
                (customizations->>'custom_duration_minutes')::INTEGER,
                (customizations->>'custom_date')::DATE,
                (customizations->>'custom_day_number')::INTEGER,
                customizations->'custom_links',
                (customizations->>'is_favorite')::BOOLEAN
            )
            RETURNING id
        );
    END IF;
END;
$$;

-- Function to get item with user customizations
CREATE OR REPLACE FUNCTION public.get_item_with_customizations(
    p_item_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    id UUID,
    trip_id UUID,
    title TEXT,
    description TEXT,
    start_time TIME,
    end_time TIME,
    day_number INTEGER,
    date DATE,
    category TEXT,
    place_id UUID,
    has_customizations BOOLEAN,
    notes TEXT,
    reminders TEXT[],
    is_favorite BOOLEAN,
    attribution_text TEXT,
    source_item_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.trip_id,
        COALESCE(c.custom_title, i.title) AS title,
        COALESCE(c.custom_description, i.description) AS description,
        COALESCE(c.custom_start_time, i.start_time) AS start_time,
        i.end_time,
        COALESCE(c.custom_day_number, i.day_number) AS day_number,
        COALESCE(c.custom_date, i.date) AS date,
        i.category::TEXT,
        i.place_id,
        (c.id IS NOT NULL) AS has_customizations,
        c.notes,
        c.reminders,
        COALESCE(c.is_favorite, FALSE),
        i.attribution_text,
        i.source_item_id
    FROM
        public.itinerary_items i
    LEFT JOIN
        public.item_customizations c ON i.id = c.item_id AND c.user_id = p_user_id
    WHERE
        i.id = p_item_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update item version when modified
CREATE OR REPLACE FUNCTION public.update_item_version()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only increment version on content changes
    IF T

