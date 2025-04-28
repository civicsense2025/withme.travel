-- Migration: Personalized Random Itinerary Generator
-- Date: 2025-06-01

/*
This migration adds functionality to generate personalized random itineraries based on:
1. Destination
2. User preferences and travel personality
3. Content quality metrics
4. Balanced activity type distribution
5. Tag matching for personalization

The generator creates itineraries with logical daily structure and high-quality content
while accounting for user preferences.
*/

-- Function to generate a personalized random itinerary
CREATE OR REPLACE FUNCTION public.generate_random_itinerary(
    destination_id UUID,                -- Target destination
    user_id UUID,                       -- User to personalize for
    num_days INTEGER,                   -- Duration in days
    settings JSONB DEFAULT '{}'::JSONB  -- Customization settings
)
RETURNS TABLE (
    day_number INTEGER,                 -- Day in itinerary
    item_id UUID,                       -- ID of selected item
    title TEXT,                         -- Activity title
    category TEXT,                      -- Activity category
    start_time TIME,                    -- Suggested start time
    duration_minutes INTEGER,           -- Estimated duration
    match_score NUMERIC(5,2),           -- How well it matches user preferences (0-100)
    quality_score INTEGER               -- Content quality score (0-100)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- User preferences
    v_travel_personality TEXT;
    v_travel_squad TEXT;
    v_user_interests JSONB;
    
    -- Settings with defaults
    v_min_quality_score INTEGER := COALESCE((settings->>'min_quality_score')::INTEGER, 60);
    v_activities_per_day INTEGER := COALESCE((settings->>'activities_per_day')::INTEGER, 4);
    v_include_meals BOOLEAN := COALESCE((settings->>'include_meals')::BOOLEAN, TRUE);
    v_morning_start TIME := COALESCE((settings->>'morning_start')::TIME, '09:00:00'::TIME);
    v_evening_end TIME := COALESCE((settings->>'evening_end')::TIME, '21:00:00'::TIME);
    
    -- Custom category weights
    v_preferred_categories JSONB := COALESCE(settings->'category_weights', '{
        "attraction": 1.0,
        "restaurant": 1.0,
        "activity": 1.0,
        "transportation": 0.5,
        "accommodation": 0.3,
        "other": 0.5
    }'::JSONB);
    
    -- Temporary table for selected items
    v_selected_items UUID[] := '{}'::UUID[];
    v_current_day INTEGER;
    v_current_hour TIME;
    v_row_count INTEGER;
BEGIN
    -- Create temporary table for the generated itinerary
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_itinerary (
        day_number INTEGER,
        item_id UUID,
        title TEXT,
        category TEXT,
        start_time TIME,
        duration_minutes INTEGER,
        match_score NUMERIC(5,2),
        quality_score INTEGER
    ) ON COMMIT DROP;
    
    -- Clear any existing data
    DELETE FROM temp_itinerary;
    
    -- Get user preferences
    SELECT 
        p.travel_personality,
        p.travel_squad,
        COALESCE(
            (SELECT jsonb_object_agg(t.name, ui.strength::NUMERIC / 10)
             FROM user_interests ui
             JOIN tags t ON t.id = ui.tag_id
             WHERE ui.user_id = p.id),
            '{}'::JSONB
        )
    INTO 
        v_travel_personality,
        v_travel_squad,
        v_user_interests
    FROM profiles p
    WHERE p.id = user_id;
    
    -- Default preferences if none found
    IF v_travel_personality IS NULL THEN
        v_travel_personality := 'adventurer';
    END IF;
    
    IF v_travel_squad IS NULL THEN
        v_travel_squad := 'solo';
    END IF;
    
    -- Generate itinerary for each day
    FOR v_current_day IN 1..num_days LOOP
        -- Start time for this day
        v_current_hour := v_morning_start;
        
        -- Morning activity (cultural/attraction)
        INSERT INTO temp_itinerary
        WITH ranked_items AS (
            SELECT
                i.id,
                i.title,
                i.category::TEXT,
                v_current_hour AS start_time,
                COALESCE(i.duration_minutes, 120) AS duration_minutes,
                i.quality_score,
                -- Calculate match score based on multiple factors
                (
                    -- Tag matching (40%)
                    COALESCE(
                        (SELECT AVG(
                            COALESCE(v_user_interests->>tag, 0.5)::NUMERIC
                        ) * 40
                        FROM unnest(i.tags) AS tag
                        WHERE v_user_interests ? tag
                        ),
                        20 -- Default if no tags match
                    ) +
                    -- Category preference based on personality (30%)
                    CASE 
                        WHEN v_travel_personality = 'culture' AND i.category IN ('attraction', 'activity') THEN 30
                        WHEN v_travel_personality = 'foodie' AND i.category = 'restaurant' THEN 30
                        WHEN v_travel_personality = 'adventurer' AND i.category = 'activity' THEN 30
                        WHEN v_travel_personality = 'relaxer' AND i.place_id IN (
                            SELECT id FROM places WHERE category IN ('cafe', 'park')
                        ) THEN 30
                        ELSE 15
                    END +
                    -- Quality and popularity (30%)
                    (i.quality_score::NUMERIC * 0.2) +
                    (COALESCE(i.popularity_score, 0) * 0.1)
                )::NUMERIC(5,2) AS match_score,
                -- Boost based on category preference
                COALESCE((v_preferred_categories->>i.category::TEXT)::NUMERIC, 0.5) AS category_weight,
                ROW_NUMBER() OVER (PARTITION BY i.category ORDER BY 
                    -- Deterministic but still with randomness
                    (i.quality_score::NUMERIC * 0.5) + (random() * 50) DESC
                ) AS category_rank
            FROM itinerary_items i
            LEFT JOIN places p ON i.place_id = p.id
            WHERE 
                -- Filter criteria
                p.destination_id = generate_random_itinerary.destination_id
                AND i.quality_score >= v_min_quality_score
                AND i.is_verified = TRUE
                AND i.id <> ALL(v_selected_items)
                -- Morning activities - attractions and cultural sites
                AND i.category IN ('attraction', 'activity')
                -- Time appropriateness
                AND (
                    i.meta_keywords IS NULL
                    OR NOT ('evening_only' = ANY(i.meta_keywords))
                )
        )
        SELECT
            v_current_day,
            id,
            title,
            category,
            start_time,
            duration_minutes,
            match_score,
            quality_score
        FROM ranked_items
        WHERE category_rank <= 2
        ORDER BY match_score * category_weight DESC, random()
        LIMIT 1;
        
        -- Get row count to see if we added something
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        
        IF v_row_count > 0 THEN
            -- Add to selected items
            SELECT array_append(v_selected_items, item_id) INTO v_selected_items
            FROM temp_itinerary
            WHERE day_number = v_current_day AND start_time = v_current_hour;
            
            -- Advance time
            SELECT v_current_hour + (duration_minutes || ' minutes')::INTERVAL INTO v_current_hour
            FROM temp_itinerary
            WHERE day_number = v_current_day AND start_time = v_morning_start;
        ELSE
            -- Default time advance if nothing was found
            v_current_hour := v_current_hour + INTERVAL '2 hours';
        END IF;
        
        -- Add lunch if meals included
        IF v_include_meals AND v_current_hour < '14:00:00'::TIME THEN
            -- Set lunch time
            v_current_hour := '12:30:00'::TIME;
            
            -- Find a lunch spot
            INSERT INTO temp_itinerary
            SELECT
                v_current_day,
                i.id,
                i.title,
                i.category::TEXT,
                v_current_hour,
                COALESCE(i.duration_minutes, 90),
                (
                    -- Tag matching (40%)
                    COALESCE(
                        (SELECT AVG(
                            COALESCE(v_user_interests->>tag, 0.5)::NUMERIC
                        ) * 40
                        FROM unnest(i.tags) AS tag
                        WHERE v_user_interests ? tag
                        ),
                        20
                    ) +
                    -- Category preference (30%)
                    CASE 
                        WHEN v_travel_personality = 'foodie' THEN 30
                        ELSE 15
                    END +
                    -- Quality (30%)
                    (i.quality_score::NUMERIC * 0.3)
                )::NUMERIC(5,2) AS match_score,
                i.quality_score
            FROM itinerary_items i
            JOIN places p ON i.place_id = p.id
            WHERE 
                p.destination_id = generate_random_itinerary.destination_id
                AND i.quality_score >= v_min_quality_score
                AND i.id <> ALL(v_selected_items)
                AND i.category = 'restaurant'
                AND (
                    i.meta_keywords IS NULL
                    OR 'lunch' = ANY(i.meta_keywords)
                    OR NOT ('dinner_only' = ANY(i.meta_keywords))
                )
            ORDER BY 
                (i.quality_score::NUMERIC * 0.5) + (random() * 50) DESC
            LIMIT 1;
            
            -- Get row count and update selected items
            GET DIAGNOSTICS v_row_count = ROW_COUNT;
            
            IF v_row_count > 0 THEN
                SELECT array_append(v_selected_items, item_id) INTO v_selected_items
                FROM temp_itinerary
                WHERE day_number = v_current_day AND start_time = v_current_hour;
                
                -- Advance time
                SELECT v_current_hour + (duration_minutes || ' minutes')::INTERVAL INTO v_current_hour
                FROM temp_itinerary
                WHERE day_number = v_current_day AND start_time = v_current_hour;
            ELSE
                -- Default time advance if no lunch found
                v_current_hour := '14:00:00'::TIME;
            END IF;
        END IF;
        
        -- Afternoon activities (1-2)
        FOR afternoon_activity_num IN 1..2 LOOP
            -- Only add if we have time
            IF v_current_hour < '18:00:00'::TIME THEN
                INSERT INTO temp_itinerary
                WITH ranked_items AS (
                    SELECT
                        i.id,
                        i.title,
                        i.category::TEXT,
                        v_current_hour AS start_time,
                        COALESCE(i.duration_minutes, 90) AS duration_minutes,
                        i.quality_score,
                        (
                            -- Tag matching (40%)
                            COALESCE(
                                (SELECT AVG(
                                    COALESCE(v_user_interests->>tag, 0.5)::NUMERIC
                                ) * 40
                                FROM unnest(i.tags) AS tag
                                WHERE v_user_interests ? tag
                                ),
                                20
                            ) +
                            -- Category preference (30%)
                            CASE 
                                WHEN v_travel_personality = 'adventurer' AND i.category = 'activity' THEN 30
                                WHEN v_travel_personality = 'culture' AND i.category = 'attraction' THEN 30
                                WHEN v_travel_personality = 'relaxer' AND p.category IN ('cafe', 'park') THEN 30
                                ELSE 15
                            END +
                            -- Quality and popularity (30%)
                            (i.quality_score::NUMERIC * 0.2) +
                            (COALESCE(i.popularity_score, 0) * 0.1)
                        )::NUMERIC(5,2) AS match_score,
                        COALESCE((v_preferred_categories->>i.category::TEXT)::NUMERIC, 0.5) AS category_weight,
                        ROW_NUMBER() OVER (PARTITION BY i.category ORDER BY 
                            (i.quality_score::NUMERIC * 0.5) + (random() * 50) DESC
                        ) AS category_rank
                    FROM itinerary_items i
                    LEFT JOIN places p ON i.place_id = p.id
                    WHERE 
                        p.destination_id = generate_random_itinerary.destination_id
                        AND i.quality_score >= v_min_quality_score
                        AND i.id <> ALL(v_selected_items)
                        -- Afternoon activities - varied types
                        AND i.category IN ('activity', 'attraction')
                        -- Time appropriateness
                        AND (
                            i.meta_keywords IS NULL
                            OR NOT ('evening_only' = ANY(i.meta_keywords))
                        )
                )
                SELECT
                    v_current_day,
                    id,
                    title,
                    category,
                    start_time,
                    duration_minutes,
                    match_score,
                    quality_score
                FROM ranked_items
                WHERE category_rank <= 3
                ORDER BY 
                    -- Ensure variety by checking what's already selected for this day
                    CASE WHEN EXISTS (
                        SELECT 1 FROM temp_itinerary
                        WHERE day_number = v_current_day AND category = ranked_items.category
                    ) THEN 0.5 ELSE 1 END * match_score * category_weight DESC,
                    random()
                LIMIT 1;
                
                -- Get row count and update
                GET DIAGNOSTICS v_row_count = ROW_COUNT;
                
                IF v_row_count > 0 THEN
                    SELECT array_append(v_selected_items, item_id) INTO v_selected_items
                    FROM temp_itinerary
                    WHERE day_number = v_current_day AND start_time = v_current_hour;
                    
                    -- Advance time
                    SELECT v_current_hour + (duration_minutes || ' minutes')::INTERVAL INTO v_current_hour
                    FROM temp_itinerary
                    WHERE day_number = v_current_day AND start_time = v_current_hour;
                ELSE
                    -- Default time advance if nothing found
                    v_current_hour := v_current_hour + INTERVAL '1.5 hours';

