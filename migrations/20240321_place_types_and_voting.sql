-- Create tables for different place types
CREATE TABLE IF NOT EXISTS attractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website_url TEXT,
    price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
    estimated_duration_minutes INTEGER,
    tags TEXT[],
    images JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    suggested_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS food_and_beverage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- restaurant, cafe, bar, etc.
    cuisine_type VARCHAR(50),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website_url TEXT,
    price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
    opening_hours JSONB,
    tags TEXT[],
    images JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    suggested_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add status and voting to itinerary items
ALTER TABLE itinerary_items
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'suggested' CHECK (status IN ('suggested', 'confirmed', 'rejected')),
ADD COLUMN IF NOT EXISTS suggested_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS attraction_id UUID REFERENCES attractions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS food_beverage_id UUID REFERENCES food_and_beverage(id) ON DELETE SET NULL;

-- Create table for itinerary item votes
CREATE TABLE IF NOT EXISTS itinerary_item_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itinerary_item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(itinerary_item_id, user_id)
);

-- Add indexes
CREATE INDEX idx_attractions_destination ON attractions(destination_id);
CREATE INDEX idx_food_beverage_destination ON food_and_beverage(destination_id);
CREATE INDEX idx_itinerary_items_status ON itinerary_items(status);
CREATE INDEX idx_itinerary_item_votes_item ON itinerary_item_votes(itinerary_item_id);

-- Add RLS policies
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_and_beverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_item_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can view verified places
CREATE POLICY "Everyone can view verified places"
    ON attractions FOR SELECT
    USING (is_verified = true OR suggested_by = auth.uid());

CREATE POLICY "Everyone can view verified food places"
    ON food_and_beverage FOR SELECT
    USING (is_verified = true OR suggested_by = auth.uid());

-- Authenticated users can suggest new places
CREATE POLICY "Users can suggest places"
    ON attractions FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can suggest food places"
    ON food_and_beverage FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Trip members can vote
CREATE POLICY "Trip members can vote"
    ON itinerary_item_votes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trip_members tm
            JOIN itinerary_items ii ON ii.trip_id = tm.trip_id
            WHERE ii.id = itinerary_item_votes.itinerary_item_id
            AND tm.user_id = auth.uid()
        )
    );

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update metadata with vote counts
    UPDATE itinerary_items
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{votes}',
        (
            SELECT jsonb_build_object(
                'up', COUNT(*) FILTER (WHERE vote_type = 'up'),
                'down', COUNT(*) FILTER (WHERE vote_type = 'down'),
                'total', COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
            )
            FROM itinerary_item_votes
            WHERE itinerary_item_id = NEW.itinerary_item_id
        )
    )
    WHERE id = NEW.itinerary_item_id;

    -- Auto-confirm items with high vote ratio
    UPDATE itinerary_items
    SET 
        status = 'confirmed',
        confirmed_at = NOW(),
        confirmed_by = NULL -- System confirmation
    WHERE id = NEW.itinerary_item_id
    AND status = 'suggested'
    AND (metadata->'votes'->>'total')::integer >= 3; -- Configurable threshold

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote updates
CREATE TRIGGER update_votes_after_vote
    AFTER INSERT OR UPDATE OR DELETE ON itinerary_item_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_counts();

-- Function to handle place suggestions
CREATE OR REPLACE FUNCTION handle_place_suggestion()
RETURNS TRIGGER AS $$
BEGIN
    -- If suggested by verified user, auto-verify
    IF EXISTS (
        SELECT 1 FROM profiles
        WHERE id = NEW.suggested_by
        AND is_verified = true
    ) THEN
        NEW.is_verified := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for place suggestions
CREATE TRIGGER handle_attraction_suggestion
    BEFORE INSERT ON attractions
    FOR EACH ROW
    EXECUTE FUNCTION handle_place_suggestion();

CREATE TRIGGER handle_food_suggestion
    BEFORE INSERT ON food_and_beverage
    FOR EACH ROW
    EXECUTE FUNCTION handle_place_suggestion(); 