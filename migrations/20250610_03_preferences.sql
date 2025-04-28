-- Migration: User Preferences System
-- Date: 2025-06-10

/*
This migration implements the user preferences system for content personalization:
1. User preferences storage
2. Travel style settings
3. Preference weighting
4. Match scoring functions

These capabilities enable personalized content recommendations and will support
the random itinerary generation feature in a subsequent migration.
*/

-- =============================================
-- TYPES
-- =============================================

-- Travel personality type
CREATE TYPE public.travel_personality_type AS ENUM (
    'planner',      -- Organized, schedule-oriented
    'adventurer',   -- Spontaneous, activity-focused
    'foodie',       -- Cuisine-oriented
    'sightseer',    -- Attractions, landmarks
    'relaxer',      -- Relaxation, slow pace
    'culture'       -- History, museums, local experiences
);

-- Travel pace preference
CREATE TYPE public.travel_pace AS ENUM (
    'relaxed',      -- Few activities, flexible timing
    'moderate',     -- Balanced pace
    'intense'       -- Many activities, efficient timing
);

-- Travel squad type
CREATE TYPE public.travel_squad_type AS ENUM (
    'solo',         -- Traveling alone
    'couple',       -- Romantic partner
    'family',       -- With children
    'friends',      -- Friend group
    'coworkers',    -- Business associates
    'mixed'         -- Mixed group
);

-- =============================================
-- TABLES
-- =============================================

-- Main user preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Basic preferences
    travel_personality public.travel_personality_type DEFAULT 'sightseer',
    travel_pace public.travel_pace DEFAULT 'moderate',
    travel_squad public.travel_squad_type DEFAULT 'solo',
    
    -- Timing preferences
    typical_day_start TIME DEFAULT '09:00:00',
    typical_day_end TIME DEFAULT '21:00:00',
    meal_times JSONB DEFAULT '{
        "breakfast": "08:00", 
        "lunch": "13:00", 
        "dinner": "19:00"
    }'::JSONB,
    
    -- Activity preferences
    preferred_categories TEXT[] DEFAULT '{}'::TEXT[],
    avoided_categories TEXT[] DEFAULT '{}'::TEXT[],
    min_activity_duration INTEGER DEFAULT 60,  -- minutes
    max_activity_duration INTEGER DEFAULT 180, -- minutes
    max_activities_per_day INTEGER DEFAULT 5,
    include_meals BOOLEAN DEFAULT TRUE,
    
    -- Category weights (0.0 to 1.0)
    category_weights JSONB DEFAULT '{
        "attraction": 1.0,
        "restaurant": 1.0,
        "activity": 1.0,
        "transportation": 0.5,
        "accommodation": 0.3,
        "other": 0.5
    }'::JSONB,
    
    -- Preference weighting (must sum to 1.0)
    quality_importance NUMERIC(3,2) DEFAULT 0.3,
    popularity_importance NUMERIC(3,2) DEFAULT 0.2,
    tag_match_importance NUMERIC(3,2) DEFAULT 0.5,
    
    -- Special needs
    accessibility_needs TEXT[],
    dietary_restrictions TEXT[],
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure weights sum to 1.0
    CONSTRAINT valid_importance_weights CHECK (
        quality_importance + 
        popularity_importance + 
        tag_match_importance = 1.0
    )
);

-- User interests with strength
CREATE TABLE IF NOT EXISTS public.user_interests (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    strength INTEGER CHECK (strength BETWEEN 1 AND 10),
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, tag_id)
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Calculate how well an item matches user preferences
CREATE OR REPLACE FUNCTION public.calculate_match_score(
    item_id UUID,
    user_id UUID
)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_prefs RECORD;
    v_item RECORD;
    v_score NUMERIC(5,2) := 50.0;  -- Start with neutral score
    v_tag_match_score NUMERIC(5,2) := 0;
    v_category_weight NUMERIC(5,2) := 1.0;
    v_tag_count INTEGER := 0;
BEGIN
    -- Get user preferences
    SELECT * INTO v_prefs 
    FROM public.user_preferences
    WHERE user_id = calculate_match_score.user_id;
    
    -- Get item data
    SELECT * INTO v_item
    FROM public.itinerary_items
    WHERE id = item_id;
    
    -- If no preferences, return neutral score
    IF v_prefs IS NULL THEN
        RETURN 50;
    END IF;
    
    -- 1. Tag matching (weighted by user interest strength)
    SELECT 
        COALESCE(AVG(ui.strength) * v_prefs.tag_match_importance * 10, 0),
        COUNT(*)
    INTO v_tag_match_score, v_tag_count
    FROM unnest(v_item.tags) tag_name
    JOIN tags t ON t.name = tag_name
    JOIN user_interests ui ON ui.tag_id = t.id AND ui.user_id = calculate_match_score.user_id;
    
    -- If we matched tags, add to score
    IF v_tag_count > 0 THEN
        v_score := v_score + v_tag_match_score;
    END IF;
    
    -- 2. Travel personality match
    CASE 
        WHEN v_prefs.travel_personality = 'foodie' AND v_item.category = 'restaurant' THEN
            v_score := v_score + 15;
            
        WHEN v_prefs.travel_personality = 'adventurer' AND v_item.category = 'activity' THEN
            v_score := v_score + 15;
            
        WHEN v_prefs.travel_personality = 'sightseer' AND v_item.category = 'attraction' THEN
            v_score := v_score + 15;
            
        WHEN v_prefs.travel_personality = 'culture' AND 
             (v_item.category = 'attraction' OR 'museum' = ANY(v_item.tags)) THEN
            v_score := v_score + 15;
            
        WHEN v_prefs.travel_personality = 'relaxer' AND 
             ('relaxing' = ANY(v_item.tags) OR 'leisure' = ANY(v_item.tags)) THEN
            v_score := v_score + 15;
    END CASE;
    
    -- 3. Category preference
    IF v_item.category = ANY(v_prefs.preferred_categories) THEN
        v_score := v_score + 10;
    END IF;
    
    IF v_item.category = ANY(v_prefs.avoided_categories) THEN
        v_score := v_score - 15;
    END IF;
    
    -- 4. Quality and popularity (weighted by importance)
    v_score := v_score + (v_item.quality_score * v_prefs.quality_importance / 5);
    v_score := v_score + (v_item.popularity_score * v_prefs.popularity_importance / 10);
    
    -- 5. Apply category weight
    v_category_weight := COALESCE((v_prefs.category_weights->>v_item.category::TEXT)::NUMERIC, 0.5);
    v_score := v_score * v_category_weight;
    
    -- Ensure score is between 0-100
    RETURN GREATEST(LEAST(v_score, 100), 0);
END;
$$;

-- Create default preferences for a user
CREATE OR REPLACE FUNCTION public.initialize_user_preferences(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only create if not exists
    INSERT INTO public.user_preferences (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Update user interest based on interactions
CREATE OR REPLACE FUNCTION public.update_user_interest(
    p_user_id UUID,
    p_tag_id UUID,
    p_change INTEGER DEFAULT 1,
    p_source TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.user_interests (
        user_id,
        tag_id,
        strength,
        source
    ) VALUES (
        p_user_id,
        p_tag_id,
        5 + p_change, -- Default 5, adjusted by change
        p_source
    )
    ON CONFLICT (user_id, tag_id) DO UPDATE
    SET 
        strength = GREATEST(LEAST(user_interests.strength + p_change, 10), 1), -- Keep between 1-10
        updated_at = NOW(),
        source = COALESCE(p_source, user_interests.source);
END;
$$;

-- Update interests based on item interaction
CREATE OR REPLACE FUNCTION public.record_item_interaction(
    p_user_id UUID,
    p_item_id UUID,
    p_interaction_type TEXT -- 'view', 'copy', 'favorite', 'hide'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_strength_change INTEGER;
    r_tag RECORD;
BEGIN
    -- Determine strength change based on interaction type
    v_strength_change := CASE p_interaction_type
        WHEN 'view' THEN 1
        WHEN 'copy' THEN 2
        WHEN 'favorite' THEN 3
        WHEN 'hide' THEN -2
        ELSE 0
    END;
    
    -- Skip if no change
    IF v_strength_change = 0 THEN
        RETURN;
    END IF;
    
    -- Update interest for each tag in the item
    FOR r_tag IN (
        SELECT t.id 
        FROM public.itinerary_items i
        JOIN unnest(i.tags) tag_name ON TRUE
        JOIN public.tags t ON t.name = tag_name
        WHERE i.id = p_item_id
    ) LOOP
        PERFORM public.update_user_interest(
            p_user_id, 
            r_tag.id, 
            v_strength_change,
            p_interaction_type
        );
    END LOOP;
    
    -- Update item metrics
    UPDATE public.itinerary_items
    SET 
        popularity_score = popularity_score + 
            CASE 
                WHEN p_interaction_type = 'view' THEN 1
                WHEN p_interaction_type = 'copy' THEN 5
                WHEN p_interaction_type = 'favorite' THEN 3
                ELSE 0
            END
    WHERE id = p_item_id;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Keep updated_at current
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_preferences_timestamp
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER trg_update_interests_timestamp
    BEFORE UPDATE ON public.user_interests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();

-- =============================================
-- INDEXES
-- =============================================

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_interests_tag ON public.user_interests(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_strength ON public.user_interests(user_id, strength DESC);
CREATE INDEX IF NOT EXISTS idx_preferences_personality ON public.user_preferences(travel_personality);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE public.user_preferences IS 'Stores user travel preferences for personalization';
COMMENT ON TABLE public.user_interests IS 'Tracks user interest levels in different tags for recommendations';

COMMENT ON COLUMN public.user_preferences.travel_personality IS 'Primary travel style that determines activity preferences';
COMMENT ON COLUMN public.user_preferences.travel_pace IS 'Preferred pace of travel activities (relaxed to intense)';
COMMENT ON COLUMN public.user_preferences.category_weights IS 'Custom weighting factors for activity categories';

COMMENT ON COLUMN public.user_interests.strength IS 'Interest level from 1 (dislike) to 10 (strong preference)';
COMMENT ON COLUMN public.user_interests.source IS 'How this interest was determined (explicit preference, interaction, etc.)';

COMMENT ON FUNCTION public.calculate_match_score IS 'Calculates how well an itinerary item matches a user\'s preferences';
COMMENT ON FUNCTION public.update_user_interest IS 'Updates user interest level for a specific tag';
COMMENT ON FUNCTION public.record_item_interaction IS 'Records user interaction with an item and updates interests accordingly';

