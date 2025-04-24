-- Trip reviews are created after a trip ends and contribute to destination ratings
CREATE TABLE IF NOT EXISTS trip_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    -- Overall trip experience
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    review_text TEXT,
    visit_start_date DATE,
    visit_end_date DATE,
    -- Specific aspects of the destination
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
    cuisine_rating INTEGER CHECK (cuisine_rating BETWEEN 1 AND 5),
    cultural_rating INTEGER CHECK (cultural_rating BETWEEN 1 AND 5),
    nightlife_rating INTEGER CHECK (nightlife_rating BETWEEN 1 AND 5),
    outdoor_rating INTEGER CHECK (outdoor_rating BETWEEN 1 AND 5),
    transportation_rating INTEGER CHECK (transportation_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    -- Additional fields
    travel_season VARCHAR(20), -- 'summer', 'winter', 'spring', 'fall'
    travel_type VARCHAR(50)[], -- ['solo', 'family', 'couple', 'friends', 'business']
    trip_highlights TEXT,
    trip_tips TEXT,
    would_visit_again BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(trip_id, user_id) -- One review per trip per user
);

-- Add indexes
CREATE INDEX idx_trip_reviews_destination ON trip_reviews(destination_id);
CREATE INDEX idx_trip_reviews_user ON trip_reviews(user_id);

-- Enable RLS
ALTER TABLE trip_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own trip reviews"
    ON trip_reviews FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_id = trip_reviews.trip_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public trip reviews"
    ON trip_reviews FOR SELECT
    TO PUBLIC
    USING (true);

-- Function to update destination ratings based on trip reviews
CREATE OR REPLACE FUNCTION update_destination_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Update destination ratings
    UPDATE destinations
    SET 
        safety_rating = (
            SELECT ROUND(AVG(safety_rating)::numeric, 1)
            FROM trip_reviews
            WHERE destination_id = NEW.destination_id
            AND safety_rating IS NOT NULL
        ),
        cuisine_rating = (
            SELECT ROUND(AVG(cuisine_rating)::numeric, 1)
            FROM trip_reviews
            WHERE destination_id = NEW.destination_id
            AND cuisine_rating IS NOT NULL
        ),
        cultural_attractions = (
            SELECT ROUND(AVG(cultural_rating)::numeric, 1)
            FROM trip_reviews
            WHERE destination_id = NEW.destination_id
            AND cultural_rating IS NOT NULL
        ),
        nightlife_rating = (
            SELECT ROUND(AVG(nightlife_rating)::numeric, 1)
            FROM trip_reviews
            WHERE destination_id = NEW.destination_id
            AND nightlife_rating IS NOT NULL
        ),
        outdoor_activities = (
            SELECT ROUND(AVG(outdoor_rating)::numeric, 1)
            FROM trip_reviews
            WHERE destination_id = NEW.destination_id
            AND outdoor_rating IS NOT NULL
        ),
        public_transportation = (
            SELECT ROUND(AVG(transportation_rating)::numeric, 1)
            FROM trip_reviews
            WHERE destination_id = NEW.destination_id
            AND transportation_rating IS NOT NULL
        ),
        -- Update metadata with review counts and seasonal data
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{reviews}',
            (
                SELECT jsonb_build_object(
                    'total_count', COUNT(*),
                    'average_rating', ROUND(AVG(overall_rating)::numeric, 1),
                    'would_visit_again_percent', 
                        ROUND((COUNT(*) FILTER (WHERE would_visit_again = true) * 100.0 / COUNT(*))::numeric, 1),
                    'seasonal_ratings', (
                        SELECT jsonb_object_agg(
                            travel_season,
                            jsonb_build_object(
                                'count', COUNT(*),
                                'avg_rating', ROUND(AVG(overall_rating)::numeric, 1)
                            )
                        )
                        FROM (
                            SELECT travel_season, overall_rating
                            FROM trip_reviews r2
                            WHERE r2.destination_id = NEW.destination_id
                            AND travel_season IS NOT NULL
                        ) season_data
                        GROUP BY travel_season
                    )
                )
                FROM trip_reviews r
                WHERE r.destination_id = NEW.destination_id
            )
        )
    WHERE id = NEW.destination_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating destination ratings
CREATE TRIGGER update_destination_ratings_after_review
    AFTER INSERT OR UPDATE ON trip_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_destination_ratings();

-- Drop the global_place_reviews table since we're using trip_reviews for destinations
-- and keeping place-specific reviews in their respective tables
DROP TABLE IF EXISTS global_place_reviews CASCADE;

-- Modify global_place_ratings to exclude destinations since they use trip_reviews
ALTER TABLE global_place_ratings
    ADD CONSTRAINT valid_place_types 
    CHECK (place_type NOT IN ('destination')); 