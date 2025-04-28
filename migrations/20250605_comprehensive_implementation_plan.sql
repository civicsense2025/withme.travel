-- Migration: Comprehensive Implementation Plan
-- Date: 2025-06-05

/*
This migration implements a comprehensive system that ties together:
1. Content sharing with personalization
2. SEO and canonical management
3. Random itinerary generation 
4. User preferences and matching

The system enables users to discover, customize, and share travel content
while maintaining proper attribution, SEO best practices, and personalization.
*/

-- =============================================
-- PART 1: ENHANCED ITINERARY ITEMS
-- =============================================

-- Core itinerary items table enhancements
ALTER TABLE public.itinerary_items
    -- Content layering
    ADD COLUMN IF NOT EXISTS original_description TEXT,
    ADD COLUMN IF NOT EXISTS personal_notes TEXT,
    
    -- Sharing and attribution
    ADD COLUMN IF NOT EXISTS source_item_id UUID REFERENCES public.itinerary_items(id),
    ADD COLUMN IF NOT EXISTS original_creator_id UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS attribution_text TEXT,
    ADD COLUMN IF NOT EXISTS copy_count INTEGER DEFAULT 0,
    
    -- SEO fields
    ADD COLUMN IF NOT EXISTS canonical_id UUID REFERENCES public.itinerary_items(id),
    ADD COLUMN IF NOT EXISTS canonical_url TEXT,
    ADD COLUMN IF NOT EXISTS public_slug TEXT,
    ADD COLUMN IF NOT EXISTS meta_title TEXT,
    ADD COLUMN IF NOT EXISTS meta_description TEXT,
    ADD COLUMN IF NOT EXISTS content_type public.content_type,
    ADD COLUMN IF NOT EXISTS url_format public.url_format DEFAULT 'hybrid',
    
    -- Quality metrics
    ADD COLUMN IF NOT EXISTS quality_tier public.quality_tier DEFAULT 'standard',
    ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS popularity_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    
    -- Additional metadata
    ADD COLUMN IF NOT EXISTS custom_metadata JSONB DEFAULT '{}'::JSONB;

-- Personal customizations table 
CREATE TABLE IF NOT EXISTS public.item_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.itinerary_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    custom_title TEXT,
    custom_description TEXT,
    custom_start_time TIME,
    custom_duration_minutes INTEGER,
    custom_date DATE,
    custom_day_number INTEGER,
    notes TEXT,
    reminders TEXT[],
    custom_links JSONB DEFAULT '[]'::JSONB,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

-- =============================================
-- PART 2: USER PREFERENCES SYSTEM
-- =============================================

-- Travel preferences for personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Travel style preferences
    travel_pace TEXT CHECK (travel_pace IN ('relaxed', 'moderate', 'intense')),
    preferred_activity_types TEXT[] DEFAULT '{}'::TEXT[],
    avoided_activity_types TEXT[] DEFAULT '{}'::TEXT[],
    
    -- Timing preferences
    typical_day_start TIME DEFAULT '09:00:00',
    typical_day_end TIME DEFAULT '21:00:00',
    meal_times JSONB DEFAULT '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}'::JSONB,
    
    -- Activity preferences
    min_activity_duration INTEGER DEFAULT 60,
    max_activity_duration INTEGER DEFAULT 180,
    max_activities_per_day INTEGER DEFAULT 5,
    include_meals BOOLEAN DEFAULT TRUE,
    
    -- Category weights
    category_weights JSONB DEFAULT '{
        "attraction": 1.0,
        "restaurant": 1.0,
        "activity": 1.0,
        "transportation": 0.5,
        "accommodation": 0.3,
        "other": 0.5
    }'::JSONB,
    
    -- Ranking factors
    quality_importance NUMERIC(3,2) DEFAULT 0.3,
    popularity_importance NUMERIC(3,2) DEFAULT 0.2,
    tag_match_importance NUMERIC(3,2) DEFAULT 0.5,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PART 3: CORE FUNCTIONS
-- =============================================

-- Function 1: Copy itinerary items with personalization
CREATE OR REPLACE FUNCTION public.copy_itinerary_items(
    source_trip_id UUID,
    destination_trip_id UUID,
    user_id UUID,
    item_ids UUID[] = NULL,
    day_numbers INTEGER[] = NULL,
    target_start_day INTEGER = NULL,
    preserve_dates BOOLEAN = FALSE,
    add_attribution BOOLEAN = TRUE
) RETURNS TABLE (
    copied_item_id UUID,
    source_item_id UUID,
    day_number INTEGER
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
    
    -- Calculate day offset for target placement
    IF target_start_day IS NOT NULL THEN
        SELECT MIN(day_number) INTO v_min_day_number
        FROM public.itinerary_items
        WHERE id = ANY(v_items_to_copy);
        
        v_day_offset := target_start_day - v_min_day_number;
    END IF;
    
    -- Calculate date offset if preserving dates
    IF preserve_dates THEN
        SELECT start_date INTO v_source_trip_start_date
        FROM public.trips
        WHERE id = source_trip_id;
        
        SELECT start_date INTO v_dest_trip_start_date
        FROM public.trips
        WHERE id = destination_trip_id;
        
        IF v_source_trip_start_date IS NOT NULL AND v_dest_trip_start_date IS NOT NULL THEN
            v_date_offset := v_dest_trip_start_date - v_source_trip_start_date;
        END IF;
    END IF;
    
    -- Process each item
    FOR r_item IN 
        SELECT * FROM public.itinerary_items
        WHERE id = ANY(v_items_to_copy)
        ORDER BY day_number, start_time
    LOOP
        -- Create copy with proper attribution
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
            
            -- Content layering
            original_description,
            
            -- Attribution
            source_item_id,
            original_creator_id,
            attribution_text,
            
            -- SEO
            canonical_id,
            content_type,
            url_format,
            public_slug,
            
            -- Quality
            quality_tier,
            quality_score
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
            
            -- Content layering
            r_item.description,
            
            -- Attribution
            r_item.id,
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
            
            -- SEO
            CASE 
                WHEN r_item.is_verified THEN COALESCE(r_item.canonical_id, r_item.id)
                ELSE NULL
            END,
            'public_trip',
            'hybrid',
            public.generate_slug(r_item.title),
            
            -- Quality (slightly reduced for copies)
            CASE
                WHEN r_item.quality_tier = 'premium' THEN 'standard'
                ELSE r_item.quality_tier
            END,
            GREATEST(0, COALESCE(r_item.quality_score, 0) - 10)
        )
        RETURNING id INTO v_new_item_id;
        
        -- Increment popularity counter on source
        UPDATE public.itinerary_items
        SET 
            popularity_score = COALESCE(popularity_score, 0) + 1,
            copy_count = COALESCE(copy_count, 0) + 1
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

-- Function 2: Generate personalized random itinerary
CREATE OR REPLACE FUNCTION public.generate_random_itinerary(
    destination_id UUID,
    user_id UUID,
    num_days INTEGER,
    settings JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
    day_number INTEGER,
    title TEXT,
    category TEXT,
    start_time TIME,
    duration_minutes INTEGER,
    place_name TEXT,
    match_score NUMERIC(5,2),
    item_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- User preferences
    v_prefs RECORD;
    
    -- Settings with defaults
    v_min_quality_score INTEGER := COALESCE((settings->>'min_quality_score')::INTEGER, 60);
    v_activities_per_day INTEGER := COALESCE((settings->>'activities_per_day')::INTEGER, 4);
    v_include_meals BOOLEAN := COALESCE((settings->>'include_meals')::BOOLEAN, TRUE);
    v_morning_start TIME := COALESCE((settings->>'morning_start')::TIME, '09:00:00'::TIME);
    v_evening_end TIME := COALESCE((settings->>'evening_end')::TIME, '21:00:00'::TIME);
    
    -- Working variables
    v_selected_items UUID[] := '{}'::UUID[];
    v_current_day INTEGER;
    v_current_time TIME;
BEGIN
    -- Create temporary table for results
    CREATE TEMPORARY TABLE temp_itinerary (
        day_number INTEGER,
        title TEXT,
        category TEXT,
        start_time TIME,
        duration_minutes INTEGER,
        place_name TEXT,
        match_score NUMERIC(5,2),
        item_id UUID
    ) ON COMMIT DROP;
    
    -- Get user preferences
    SELECT * INTO v_prefs FROM public.user_preferences
    WHERE user_id = generate_random_itinerary.user_id;
    
    -- Use defaults if no preferences found
    IF v_prefs.user_id IS NULL THEN
        SELECT
            generate_random_itinerary.user_id,
            'moderate',
            '{}'::TEXT[],
            '{}'::TEXT[],
            '09:00:00'::TIME,
            '21:00:00'::TIME,
            '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}'::JSONB,
            60,
            180,
            5,
            TRUE,
            '{
                "attraction": 1.0,
                "restaurant": 1.0,
                "activity": 1.0,
                "transportation": 0.5,
                "accommodation": 0.3,
                "other": 0.5
            }'::JSONB,
            0.3,
            0.2,
            0.5,
            NOW(),
            NOW()
        INTO v_prefs;
    END IF;
    
    -- For each day in the itinerary
    FOR v_current_day IN 1..num_days LOOP
        -- Start the day
        v_current_time := v_prefs.typical_day_start;
        
        -- Morning activity
        INSERT INTO temp_itinerary
        SELECT 
            v_current_day,
            i.title,
            i.category::TEXT,
            v_current_time,
            COALESCE(i.duration_minutes, 120),
            p.name,
            public.calculate_item_match_score(i.id, user_id),
            i.id
        FROM public.itinerary_items i
        JOIN public.places p ON i.place_id = p.id
        WHERE 
            p.destination_id = generate_random_itinerary.destination_id
            AND i.quality_score >= v_min_quality_score
            AND i.id <> ALL(v_selected_items)
            AND i.category IN ('attraction', 'activity')
        ORDER BY 
            public.calculate_item_match_score(i.id, user_id) DESC,
            random()
        LIMIT 1;
        
        -- Update selected items and current time
        SELECT 
            array_append(v_selected_items

