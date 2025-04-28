-- Migration: Random Itinerary Generation
-- Date: 2025-06-10

/*
This migration implements personalized random itinerary generation:
1. Smart activity selection based on user preferences
2. Balanced day structure
3. Activity type distribution
4. Time scheduling optimization

This builds on previous migrations (core schema, SEO, user preferences, content sharing)
to enable one-click generation of personalized travel itineraries.
*/

-- =============================================
-- SCHEMA UPDATES
-- =============================================

-- Add generation-related fields to itinerary_items
ALTER TABLE public.itinerary_items
    -- Generation metadata
    ADD COLUMN IF NOT EXISTS is_generated BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS generation_timestamp TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS generation_settings JSONB;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Main function to generate a random itinerary
CREATE OR REPLACE FUNCTION public.generate_random_itinerary(
    destination_id UUID,           -- Target destination
    user_id UUID,                  -- User to personalize for
    num_days INTEGER,              -- How many days
    start_date DATE DEFAULT NULL,  -- Starting date (optional)
    settings JSONB DEFAULT '{}'    -- Additional settings and preferences
)
RETURNS TABLE (
    day_number INTEGER,            -- Day in itinerary
    item_id UUID,                  -- Selected item
    title TEXT,                    -- Item title
    category TEXT,                 -- Activity category
    start_time TIME,               -- Scheduled time
    duration_minutes INTEGER,      -- Activity duration
    place_name TEXT,               -- Location name
    match_score NUMERIC(5,2)       -- How well it matches user preferences
)
LANGUAGE plpgsql
SECURITY DEFINER
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
    v_category_counts JSONB := '{}'::JSONB;
    v_row_count INTEGER;
    v_current_date DATE := start_date;
    v_temp_table_name TEXT;
BEGIN
    -- Create temp table for results with a unique name to avoid conflicts
    v_temp_table_name := 'temp_itinerary_' || replace(gen_random_uuid()::text, '-', '');
    
    EXECUTE format('
        CREATE TEMPORARY TABLE %I (
            day_number INTEGER,
            item_id UUID,
            title TEXT,
            category TEXT,
            start_time TIME,
            duration_minutes INTEGER,
            place_name TEXT,
            match_score NUMERIC(5,2)
        ) ON COMMIT DROP', v_temp_table_name);
    
    -- Get user preferences
    SELECT * INTO v_prefs FROM public.user_preferences
    WHERE user_id = generate_random_itinerary.user_id;
    
    -- Use defaults if no preferences found
    IF v_prefs.user_id IS NULL THEN
        SELECT
            generate_random_itinerary.user_id,
            'moderate'::public.travel_pace,
            '{}'::TEXT[],
            '{}'::TEXT[],
            v_morning_start,
            v_evening_end,
            '{"breakfast": "08:00", "lunch": "13:00", "dinner": "19:00"}'::JSONB,
            60,
            180,
            v_activities_per_day,
            TRUE
        INTO v_prefs;
    END IF;
    
    -- For each day in the itinerary
    FOR v_current_day IN 1..num_days LOOP
        -- Start time for this day
        v_current_time := v_prefs.typical_day_start;
        
        -- Morning activity (cultural/attraction)
        EXECUTE format('
            INSERT INTO %I
            WITH ranked_items AS (
                SELECT
                    i.id,
                    i.title,
                    i.category::TEXT,
                    %L AS start_time,
                    COALESCE(i.duration_minutes, 120) AS duration_minutes,
                    p.name AS place_name,
                    -- Calculate match score
                    public.calculate_match_score(i.id, %L) AS match_score,
                    -- Category rank for variety
                    ROW_NUMBER() OVER (
                        PARTITION BY i.category 
                        ORDER BY public.calculate_match_score(i.id, %L) DESC
                    ) AS category_rank,
                    -- Add controlled randomness
                    random() AS random_factor
                FROM public.itinerary_items i
                JOIN public.places p ON i.place_id = p.id
                WHERE 
                    p.destination_id = %L
                    AND i.quality_score >= %L
                    AND i.id <> ALL(%L)
                    -- Morning activities - attractions and cultural sites
                    AND i.category IN (''attraction'', ''activity'')
                    -- Time appropriateness
                    AND (
                        i.meta_keywords IS NULL
                        OR NOT (''evening_only'' = ANY(i.meta_keywords))
                    )
            )
            SELECT
                %L,
                id,
                title,
                category,
                start_time,
                duration_minutes,
                place_name,
                match_score
            FROM ranked_items
            WHERE category_rank <= 3
            ORDER BY 
                -- Balance randomness with preference
                (match_score * 0.8) + (random_factor * 20.0) DESC
            LIMIT 1',
            v_temp_table_name,
            v_current_time,
            user_id,
            user_id,
            destination_id,
            v_min_quality_score,
            v_selected_items,
            v_current_day
        );
        
        -- Get row count to see if we added something
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE day_number = %L AND start_time = %L', 
            v_temp_table_name, v_current_day, v_current_time) INTO v_row_count;
        
        IF v_row_count > 0 THEN
            -- Add to selected items
            EXECUTE format('
                SELECT array_append(%L, item_id) 
                FROM %I 
                WHERE day_number = %L AND start_time = %L', 
                v_selected_items, v_temp_table_name, v_current_day, v_current_time
            ) INTO v_selected_items;
            
            -- Advance time
            EXECUTE format('
                SELECT %L + (duration_minutes || '' minutes'')::INTERVAL
                FROM %I
                WHERE day_number = %L AND start_time = %L',
                v_current_time, v_temp_table_name, v_current_day, v_current_time
            ) INTO v_current_time;
            
            -- Add buffer time
            v_current_time := v_current_time + '30 minutes'::INTERVAL;
        ELSE
            -- Default time advance if nothing was found
            v_current_time := v_current_time + INTERVAL '2 hours';
        END IF;
        
        -- Add lunch if meals included
        IF v_include_meals AND v_current_time < '14:00:00'::TIME THEN
            -- Set lunch time
            v_current_time := '12:30:00'::TIME;
            
            -- Find a lunch spot
            EXECUTE format('
                INSERT INTO %I
                SELECT
                    %L,
                    i.id,
                    i.title,
                    i.category::TEXT,
                    %L,
                    COALESCE(i.duration_minutes, 90),
                    p.name,
                    public.calculate_match_score(i.id, %L)
                FROM public.itinerary_items i
                JOIN public.places p ON i.place_id = p.id
                WHERE 
                    p.destination_id = %L
                    AND i.quality_score >= %L
                    AND i.id <> ALL(%L)
                    AND i.category = ''restaurant''
                    AND (
                        i.meta_keywords IS NULL
                        OR ''lunch'' = ANY(i.meta_keywords)
                        OR NOT (''dinner_only'' = ANY(i.meta_keywords))
                    )
                ORDER BY 
                    (public.calculate_match_score(i.id, %L) * 0.7) + (random() * 30) DESC
                LIMIT 1',
                v_temp_table_name,
                v_current_day,
                v_current_time,
                user_id,
                destination_id,
                v_min_quality_score,
                v_selected_items,
                user_id
            );
            
            -- Get row count and update selected items
            EXECUTE format('SELECT COUNT(*) FROM %I WHERE day_number = %L AND start_time = %L', 
                v_temp_table_name, v_current_day, v_current_time) INTO v_row_count;
            
            IF v_row_count > 0 THEN
                EXECUTE format('
                    SELECT array_append(%L, item_id) 
                    FROM %I 
                    WHERE day_number = %L AND start_time = %L', 
                    v_selected_items, v_temp_table_name, v_current_day, v_current_time
                ) INTO v_selected_items;
                
                -- Advance time
                EXECUTE format('
                    SELECT %L + (duration_minutes || '' minutes'')::INTERVAL
                    FROM %I
                    WHERE day_number = %L AND start_time = %L',
                    v_current_time, v_temp_table_name, v_current_day, v_current_time
                ) INTO v_current_time;
                
                -- Add buffer time
                v_current_time := v_current_time + '30 minutes'::INTERVAL;
            ELSE
                -- Default time advance if no lunch found
                v_current_time := '14:00:00'::TIME;
            END IF;
        END IF;
        
        -- Afternoon activities (1-2)
        FOR afternoon_activity_num IN 1..2 LOOP
            -- Only add if we have time
            IF v_current_time < '18:00:00'::TIME THEN
                EXECUTE format('
                    INSERT INTO %I
                    WITH ranked_items AS (
                        SELECT
                            i.id,
                            i.title,
                            i.category::TEXT,
                            %L AS start_time,
                            COALESCE(i.duration_minutes, 90) AS duration_minutes,
                            p.name AS place_name,
                            public.calculate_match_score(i.id, %L) AS match_score,
                            -- Track category distribution
                            COALESCE((%L->>i.category::TEXT)::INTEGER, 0) AS category_count,
                            ROW_NUMBER() OVER (
                                PARTITION BY i.category 
                                ORDER BY public.calculate_match_score(i.id, %L) DESC
                            ) AS category_rank
                        FROM public.itinerary_items i
                        JOIN public.places p ON i.place_id = p.id
                        WHERE 
                            p.destination_id = %L
                            AND i.quality_score >= %L
                            AND i.id <> ALL(%L)
                            -- Afternoon activities - varied types
                            AND i.category IN (''activity'', ''attraction'')
                            -- Time appropriateness
                            AND (
                                i.meta_keywords IS NULL
                                OR NOT (''evening_only'' = ANY(i.meta_keywords))
                            )
                    )
                    SELECT
                        %L,
                        id,
                        title,
                        category,
                        start_time,
                        duration_minutes,
                        place_name,
                        match_score
                    FROM ranked_items
                    WHERE category_rank <= 3
                    ORDER BY 
                        -- Ensure variety by checking what''s already selected for this day
                        CASE WHEN EXISTS (
                            SELECT 1 FROM %I
                            WHERE day_number = %L AND category = ranked_items.category
                        ) THEN 0.5 ELSE 1 END * match_score DESC,
                        -- Decrease priority for over-represented categories
                        (1.0 / (category_count + 1)) DESC,
                        random()
                    LIMIT 1',
                    v_temp_table_name,
                    v_current_time,
                    user_id,
                    v_category_counts,
                    user_id,
                    destination_id,
                    v_min_quality_score,
                    v_selected_items,
                    v_current_day,
                    v_temp_table_name,
                    v_current_day
                );
                
                -- Get row count and update
                EXECUTE format('SELECT COUNT(*) FROM %I WHERE day_number = %L AND start_time = %L', 
                    v_temp_table_name, v_current_day, v_current_time) INTO v_row_count;
                
                IF v_row_count > 0 THEN
                    -- Add to selected items
                    EXECUTE format('
                        SELECT array_append(%L, item_id) 
                        FROM %I 
                        WHERE day_number = %L AND start_time = %L', 
                        v_selected_items, v_temp_table_name, v_current_day, v_current_time
                    ) INTO v_selected_items;
                    
                    -- Update category counts
                    EXECUTE format('
                        SELECT jsonb_set(
                            %L,
                            ARRAY[category],
                            to_jsonb(COALESCE((%L->>category)::INTEGER, 0) + 1)
                        )
                        FROM %I
                        WHERE day_number = %L AND start_time = %L',
                        v_category_counts,
                        v_category_counts,
                        v_temp_table_name,
                        v_current_day,
                        v_current_time
                    ) INTO v_category_counts;
                    
                    -- Advance time
                    EXECUTE format('
                        SELECT %L + (duration_minutes || '' minutes'')::INTERVAL
                        FROM %I
                        WHERE day_number = %L AND start_time = %L',
                        v_current_time, v_temp_table_name, v_current_day, v_current_time
                    ) INTO v_current_time;
                    
                    -- Add buffer time
                    v_current_time := v_current_time + '30 minutes'::INTERVAL;
                ELSE
                    -- Default time advance if nothing found
                    v_current_time := v_current_time + INTERVAL '1.5 hours';
                END IF;
            END IF;
        END LOOP;
        
        -- Evening activity (dinner)
        IF v_include_meals AND v_current_time < v_evening_end THEN
            -- Set dinner time, either based on current time or default
            v_current_time := GREATEST(
                v_current_time,
                '18:30:00'::TIME
            );
            
            EXECUTE format('
                INSERT INTO %I
                SELECT
                    %L,
                    i.id,
                    i.title,
                    i.category::TEXT,
                    %L,
                    COALESCE(i.duration_minutes, 90),
                    p.name,
                    public.calculate_match_score(i.id, %L)
                FROM public.itinerary_items i
                JOIN public.places p ON i.place_id = p.id
                WHERE 
                    p.destination_id = %L
                    AND i.quality_score >= %L
                    AND i.id <> ALL(%L)
                    AND i.category = ''restaurant''
                    AND (
                        i.meta_keywords IS NULL
                        OR ''dinner'' = ANY(i.meta_keywords)
                        OR NOT (''lunch_only'' = ANY(i.meta_keywords))
                    )
                ORDER BY 
                    public.calculate_match_score(i.id, %L) * 0.7 +
                    random() * 30 DESC
                LIMIT 1',
                v_temp_table_name,
                v_current_day,
                v_current_time,
                user_id,
                destination_id,
                v_min_quality_score,
                v_selected_items,
                user_id
            );
            
            -- Update selected items and advance time
            EXECUTE format('
                SELECT array_append(%L, item_id)
                FROM %I
                WHERE day_number = %L AND start_time = %L',
                v_selected_items,
                v_temp_table_name,
                v_current_day,
                v_current_time
            ) INTO v_selected_items;
        END IF;
        
        -- Optional: Add evening entertainment after dinner
        IF v_current_time < '20:00:00'::TIME AND settings->>'include_nightlife' = 'true' THEN
            v_current_time := '20:00:00'::TIME;
            
            EXECUTE format('
                INSERT INTO %I
                SELECT
                    %L,
                    i.id,
                    i.title,
                    i.category::TEXT,
                    %L,
                    COALESCE(i.duration_minutes, 120),
                    p.name,
                    public.calculate_match_score(i.id, %L)
                FROM public.itinerary_items i
                JOIN public.places p ON i.place_id = p.id
                WHERE 
                    p.destination_id = %L
                    AND i.quality_score >= %L
                    AND i.id <> ALL(%L)
                    AND i.category IN (''activity'')
                    AND (
                        ''evening'' = ANY(i.meta_keywords) OR
                        ''nightlife'' = ANY(i.meta_keywords)
                    )
                ORDER BY 
                    public.calculate_match_score(i.id, %L) * 0.7 +
                    random() * 30 DESC
                LIMIT 1',
                v_temp_table_name,
                v_current_day,
                v_current_time,
                user_id,
                destination_id,
                v_min_quality_score,
                v_selected_items,
                user_id
            );
        END IF;
        
        -- Optional: Add dates if start_date was provided
        IF v_current_date IS NOT NULL THEN
            EXECUTE format('
                UPDATE %I 
                SET date = %L 
                WHERE day_number = %L',
                v_temp_table_name,
                v_current_date,
                v_current_day
            );
            v_current_date := v_current_date + INTERVAL '1 day';
        END IF;
    END LOOP;
    
    -- Return the generated itinerary
    RETURN QUERY EXECUTE format('
        SELECT 
            day_number,
            item_id,
            title,
            category,
            start_time,
            duration_minutes,
            place_name,
            match_score
        FROM %I
        ORDER BY day_number, start_time',
        v_temp_table_name
    );
END;
$$;

-- Function to validate a generated itinerary
CREATE OR REPLACE FUNCTION public.validate_itinerary(
    item_ids UUID[]
)
RETURNS TABLE (
    issue_type TEXT,
    description TEXT,
    severity TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_category_distribution JSONB;
BEGIN
    -- Create temporary table for issues
    CREATE TEMPORARY TABLE temp_issues (
        issue_type TEXT,
        description TEXT,
        severity TEXT
    ) ON COMMIT DROP;
    
    -- 1. Check for scheduling conflicts
    INSERT INTO temp_issues
    SELECT 
        'timing_conflict',
        format('Timing conflict on day %s: %s (%s-%s) overlaps with %s (%s-%s)', 
            a.day_number, 
            a.title, 
            a.start_time::text, 
            (a.start_time + (a.duration_minutes || ' minutes')::interval)::time::text,
            b.title,
            b.start_time::text,
            (b.start_time + (b.duration_minutes || ' minutes')::interval)::time::text
        ),
        'high'
    FROM public.itinerary_items a
    JOIN public.itinerary_items b ON 
        a.day_number = b.day_number AND
        a.id <> b.id AND
        a.id = ANY(item_ids) AND
        b.id = ANY(item_ids) AND
        a.id < b.id -- Avoid duplicate reports
    WHERE
        (a.start_time <= b.start_time AND 
         a.start_time + (a.duration_minutes || ' minutes')::interval > b.start_time)
        OR
        (b.start_time <= a.start_time AND 
         b.start_time + (b.duration_minutes || ' minutes')::interval > a.start_time);
    
    -- 2. Check category distribution
    WITH category_counts AS (
        SELECT 
            category,
            COUNT(*) AS count,
            ROUND((COUNT(*) * 100.0 / ARRAY_LENGTH(item_ids, 1))::numeric, 1) AS percentage
        FROM public.itinerary_items
        WHERE id = ANY(item_ids)
        GROUP BY category
    )
    INSERT INTO temp_issues
    SELECT
        'category_imbalance',
        format('Category %s is over-represented at %s%%', category, percentage),
        CASE 
            WHEN percentage > 50 THEN 'high'
            WHEN percentage > 40 THEN 'medium'
            ELSE 'low'
        END
    FROM category_counts
    WHERE percentage > 40;
    
    -- 3. Check for insufficient activities per day
    WITH day_counts AS (
        SELECT 
            day_number,
            COUNT(*) AS activity_count
        FROM public.itinerary_items
        WHERE id = ANY(item_ids)
        GROUP BY day_number
    )
    INSERT INTO temp_issues
    SELECT
        'sparse_day',
        format('Day %s has only %s activities', day_number, activity_count),
        CASE
            WHEN activity_count < 2 THEN 'high'
            WHEN activity_count < 3 THEN 'medium'
            ELSE 'low'
        END
    FROM day_counts
    WHERE activity_count < 3;
    
    -- 4. Check for overpacked days
    WITH day_counts AS (
        SELECT 
            day_number,
            COUNT(*) AS activity_count,
            SUM(duration_minutes) AS total_duration
        FROM public.itinerary_items
        WHERE id = ANY(item_ids)
        GROUP BY day_number
    )
    INSERT INTO temp_issues
    SELECT
        'packed_day',
        format('Day %s has %s activities totaling %s minutes', 
            day_number, activity_count, total_duration),
        CASE
            WHEN total_duration > 600 THEN 'high'  -- 10 hours
            WHEN total_duration > 480 THEN 'medium' -- 8 hours
            ELSE 'low'
        END
    FROM day_counts
    WHERE total_duration > 480;
    
    -- Return all identified issues
    RETURN QUERY SELECT * FROM temp_issues;
END;
$$;

-- Function to optimize timing in an itinerary
CREATE OR REPLACE FUNCTION public.optimize_itinerary_timing(
    trip_id UUID,
    day_number INTEGER = NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_time TIME;
    v_current_day INTEGER;
    r_item RECORD;
BEGIN
    -- Process each day (or specific day if provided)
    FOR v_current_day IN (
        SELECT DISTINCT day_number 
        FROM public.itinerary_items 
        WHERE trip_id = optimize_itinerary_timing.trip_id
        AND (
            optimize_itinerary_timing.day_number IS NULL 
            OR day_number = optimize_itinerary_timing.day_number
        )
        ORDER BY day_number
    ) LOOP
        -- Start at 9:00 AM for each day
        v_current_time := '09:00:00'::TIME;
        
        -- Process each item in order of existing start time
        FOR r_item IN (
            SELECT * 
            FROM public.itinerary_items
            WHERE trip_id = optimize_itinerary_timing.trip_id
            AND day_number = v_current_day
            ORDER BY start_time
        ) LOOP
            -- Special handling for meals - try to keep at standard times
            IF r_item.category = 'restaurant' THEN
                -- Lunch around noon
                IF v_current_time BETWEEN '10:30:00'::TIME AND '13:30:00'::TIME THEN
                    v_current_time := '12:30:00'::TIME;
                -- Dinner in evening
                ELSIF v_current_time BETWEEN '17:00:00'::TIME AND '20:00:00'::TIME THEN
                    v_current_time := '19:00:00'::TIME;
                END IF;
            END IF;
            
            -- Update item timing
            UPDATE public.itinerary_items
            SET 
                start_time = v_current_time,
                end_time = v_current_time + (duration_minutes || ' minutes')::INTERVAL
            WHERE id = r_item.id;
            
            -- Advance current time (add duration plus 30 min buffer)
            v_current_time := v_current_time + 
                (r_item.duration_minutes || ' minutes')::INTERVAL + 
                '30 minutes'::INTERVAL;
        END LOOP;
    END LOOP;
END;
$$;

-- Function to apply an itinerary template to a trip
CREATE OR REPLACE FUNCTION public.apply_template_to_trip(
    template_id UUID,
    trip_id UUID,
    user_id UUID,
    start_date DATE = NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_items_count INTEGER := 0;
    v_current_date DATE := start_date;
BEGIN
    -- Get template items
    WITH template_items AS (
        SELECT 
            i.title,
            i.description,
            i.category,
            i.day_number,
            i.start_time,
            i.duration_minutes,
            i.place_id,
            i.source_item_id,
            i.original_creator_id,
            i.attribution_text,
            i.tags
        FROM public.itinerary_items i
        WHERE i.trip_id = template_id
        ORDER BY i.day_number, i.start_time
    )
    INSERT INTO public.itinerary_items (
        trip_id,
        created_by,
        title,
        description,
        category,
        day_number,
        date,
        start_time,
        duration_minutes,
        place_id,
        source_item_id,
        original_creator_id,
