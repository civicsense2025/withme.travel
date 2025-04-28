-- Migration: User Preferences System
-- Date: 2025-04-26
-- Description: Implements user preferences, travel styles, and preference matching

-- Create travel style and pace enums
CREATE TYPE travel_style AS ENUM (
    'adventurous',
    'relaxed',
    'cultural',
    'luxury',
    'budget',
    'family',
    'solo',
    'nightlife',
    'nature',
    'food_focused'
);

CREATE TYPE travel_pace AS ENUM (
    'very_slow',
    'slow',
    'moderate',
    'fast',
    'very_fast'
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    travel_styles travel_style[] DEFAULT ARRAY[]::travel_style[],
    preferred_pace travel_pace DEFAULT 'moderate',
    budget_range INT4RANGE,  -- Stored as cents, e.g., 5000,15000 for $50-$150
    preferred_activity_types TEXT[],
    preferred_times_of_day TIME[] DEFAULT ARRAY['09:00:00'::TIME, '19:00:00'::TIME],
    accessibility_needs TEXT[],
    dietary_restrictions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id)
);

-- Create preference weights table for customizable scoring
CREATE TABLE IF NOT EXISTS preference_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    subcategory TEXT,
    weight FLOAT CHECK (weight BETWEEN 0 AND 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, subcategory)
);

-- Insert default weights
INSERT INTO preference_weights (category, subcategory, weight) VALUES
    ('travel_style', NULL, 0.3),
    ('travel_pace', NULL, 0.2),
    ('budget', NULL, 0.15),
    ('activity_type', NULL, 0.15),
    ('time_of_day', NULL, 0.1),
    ('accessibility', NULL, 0.05),
    ('dietary', NULL, 0.05)
ON CONFLICT (category, subcategory) DO NOTHING;

-- Create user activity history for preference learning
CREATE TABLE IF NOT EXISTS user_activity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL,
    interaction_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add RLS to new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE preference_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
    ON user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- RLS policies for preference_weights
CREATE POLICY "Everyone can view preference weights"
    ON preference_weights FOR SELECT
    USING (true);

CREATE POLICY "Only admins can manage preference weights"
    ON preference_weights FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'is_admin' = 'true'
        )
    );

-- RLS policies for user_activity_history
CREATE POLICY "Users can view their own activity history"
    ON user_activity_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity history"
    ON user_activity_history FOR INSERT
    WITH CHECK (true);

-- Function to calculate preference match score
CREATE OR REPLACE FUNCTION calculate_preference_match(
    p_item_id UUID,
    p_user_id UUID
) RETURNS FLOAT AS $$
DECLARE
    v_score FLOAT := 0;
    v_user_prefs user_preferences%ROWTYPE;
    v_item itinerary_items%ROWTYPE;
    v_weight FLOAT;
BEGIN
    -- Get user preferences
    SELECT * INTO v_user_prefs
    FROM user_preferences
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN 0.5; -- Default score for users without preferences
    END IF;
    
    -- Get item details
    SELECT * INTO v_item
    FROM itinerary_items
    WHERE id = p_item_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate style match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'travel_style';
    
    v_score := v_score + (
        CASE WHEN v_item.metadata->>'style' = ANY(v_user_prefs.travel_styles::text[])
        THEN v_weight ELSE 0 END
    );
    
    -- Calculate pace match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'travel_pace';
    
    v_score := v_score + (
        CASE WHEN v_item.metadata->>'pace' = v_user_prefs.preferred_pace::text
        THEN v_weight ELSE 0 END
    );
    
    -- Calculate budget match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'budget';
    
    IF (v_item.metadata->>'cost')::int <@ v_user_prefs.budget_range THEN
        v_score := v_score + v_weight;
    END IF;
    
    -- Calculate activity type match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'activity_type';
    
    IF v_item.category = ANY(v_user_prefs.preferred_activity_types) THEN
        v_score := v_score + v_weight;
    END IF;
    
    -- Calculate time of day match
    SELECT weight INTO v_weight
    FROM preference_weights
    WHERE category = 'time_of_day';
    
    IF v_item.start_time::time <@ timerange(
        v_user_prefs.preferred_times_of_day[1],
        v_user_prefs.preferred_times_of_day[2],
        '[]'
    ) THEN
        v_score := v_score + v_weight;
    END IF;
    
    -- Normalize score to 0-1 range
    RETURN GREATEST(LEAST(v_score, 1), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences based on activity
CREATE OR REPLACE FUNCTION update_preferences_from_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Record the activity
    INSERT INTO user_activity_history (
        user_id,
        item_id,
        interaction_type,
        interaction_data
    ) VALUES (
        NEW.user_id,
        NEW.item_id,
        NEW.interaction_type,
        NEW.interaction_data
    );
    
    -- Update user preferences based on activity
    -- This is a simplified version; in practice, you'd want more sophisticated
    -- preference learning algorithms
    IF NEW.interaction_type = 'like' THEN
        UPDATE user_preferences
        SET 
            preferred_activity_types = array_append(
                preferred_activity_types,
                (SELECT category FROM itinerary_items WHERE id = NEW.item_id)
            ),
            updated_at = NOW()
        WHERE user_id = NEW.user_id
        AND NOT (SELECT category FROM itinerary_items WHERE id = NEW.item_id) = ANY(preferred_activity_types);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_prefs_lookup ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_user ON user_activity_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_history_item ON user_activity_history(item_id);

-- Add comments
COMMENT ON TABLE user_preferences IS 'Stores user travel preferences and settings';
COMMENT ON TABLE preference_weights IS 'Configurable weights for preference matching algorithm';
COMMENT ON TABLE user_activity_history IS 'Tracks user interactions for preference learning';
COMMENT ON FUNCTION calculate_preference_match IS 'Calculates how well an item matches user preferences';
COMMENT ON FUNCTION update_preferences_from_activity IS 'Updates user preferences based on their activity';

