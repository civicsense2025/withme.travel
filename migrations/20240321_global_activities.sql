-- Create enum for place types
CREATE TYPE place_type AS ENUM (
    'attraction',
    'restaurant',
    'hotel',
    'bar',
    'cafe',
    'shopping',
    'activity',
    'landmark',
    'transportation',
    'other'
);

-- Create table for global places/activities
CREATE TABLE IF NOT EXISTS global_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    place_type place_type NOT NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website_url TEXT,
    phone VARCHAR(50),
    price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 0 AND 5),
    rating_count INTEGER DEFAULT 0,
    opening_hours JSONB,
    images JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false
);

-- Create table for place reviews
CREATE TABLE IF NOT EXISTS place_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES global_places(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    visit_date DATE,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for place operating hours
CREATE TABLE IF NOT EXISTS place_operating_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID REFERENCES global_places(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
    opens_at TIME,
    closes_at TIME,
    is_closed BOOLEAN DEFAULT false,
    special_hours BOOLEAN DEFAULT false,
    note TEXT
);

-- Add indexes
CREATE INDEX idx_global_places_destination ON global_places(destination_id);
CREATE INDEX idx_global_places_type ON global_places(place_type);
CREATE INDEX idx_global_places_location ON global_places USING gist (
    ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_place_reviews_place ON place_reviews(place_id);
CREATE INDEX idx_place_operating_hours_place ON place_operating_hours(place_id);

-- Add RLS policies
ALTER TABLE global_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE place_operating_hours ENABLE ROW LEVEL SECURITY;

-- Everyone can view global places
CREATE POLICY "Everyone can view global places"
    ON global_places FOR SELECT
    USING (true);

-- Only verified users can add global places
CREATE POLICY "Verified users can add global places"
    ON global_places FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_verified = true
        )
    );

-- Only admins can update global places
CREATE POLICY "Admins can update global places"
    ON global_places FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Everyone can view reviews
CREATE POLICY "Everyone can view reviews"
    ON place_reviews FOR SELECT
    USING (true);

-- Authenticated users can add reviews
CREATE POLICY "Users can add reviews"
    ON place_reviews FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
    ON place_reviews FOR UPDATE
    USING (user_id = auth.uid());

-- Function to update place rating
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE global_places
        SET 
            rating = (
                SELECT ROUND(AVG(rating)::numeric, 1)
                FROM place_reviews
                WHERE place_id = NEW.place_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM place_reviews
                WHERE place_id = NEW.place_id
            )
        WHERE id = NEW.place_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.rating <> NEW.rating THEN
            UPDATE global_places
            SET 
                rating = (
                    SELECT ROUND(AVG(rating)::numeric, 1)
                    FROM place_reviews
                    WHERE place_id = NEW.place_id
                )
            WHERE id = NEW.place_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE global_places
        SET 
            rating = (
                SELECT ROUND(AVG(rating)::numeric, 1)
                FROM place_reviews
                WHERE place_id = OLD.place_id
            ),
            rating_count = (
                SELECT COUNT(*)
                FROM place_reviews
                WHERE place_id = OLD.place_id
            )
        WHERE id = OLD.place_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for rating updates
CREATE TRIGGER update_place_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON place_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_place_rating();

-- Add columns to itinerary_items to link with global places
ALTER TABLE itinerary_items
ADD COLUMN IF NOT EXISTS place_id UUID REFERENCES global_places(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reservation_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT; 