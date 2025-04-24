-- Global Level Tables (Site-wide data)
CREATE TABLE IF NOT EXISTS global_place_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_type VARCHAR(50) NOT NULL, -- 'destination', 'attraction', 'food_beverage', etc.
    place_id UUID NOT NULL,
    rating_type VARCHAR(50) NOT NULL, -- 'safety', 'cuisine', 'nightlife', etc.
    rating_value INTEGER CHECK (rating_value BETWEEN 1 AND 5),
    rating_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(place_type, place_id, rating_type)
);

CREATE TABLE IF NOT EXISTS global_place_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_type VARCHAR(50) NOT NULL,
    place_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    visit_date DATE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Trip Level Tables (Group-specific data)
CREATE TABLE IF NOT EXISTS trip_place_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    place_type VARCHAR(50) NOT NULL,
    place_id UUID NOT NULL,
    note_type VARCHAR(50) NOT NULL, -- 'general', 'tips', 'warning', etc.
    content TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS trip_place_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    place_type VARCHAR(50) NOT NULL,
    place_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down', 'maybe', 'skip')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(trip_id, place_id, user_id)
);

CREATE TABLE IF NOT EXISTS trip_place_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    place_type VARCHAR(50) NOT NULL,
    place_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('suggested', 'confirmed', 'rejected', 'maybe')),
    suggested_by UUID REFERENCES auth.users(id),
    confirmed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER, -- For ordering within confirmed items
    day_number INTEGER,
    time_slot VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'flexible'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(trip_id, place_id)
);

-- User Level Tables (Personal data)
CREATE TABLE IF NOT EXISTS user_place_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    list_name VARCHAR(100) NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_place_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES user_place_lists(id) ON DELETE CASCADE,
    place_type VARCHAR(50) NOT NULL,
    place_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(list_id, place_type, place_id)
);

CREATE TABLE IF NOT EXISTS user_place_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    place_type VARCHAR(50) NOT NULL,
    place_id UUID NOT NULL,
    preference_type VARCHAR(50) NOT NULL, -- 'favorite', 'visited', 'want_to_visit', 'not_interested'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, place_type, place_id, preference_type)
);

-- Add indexes for performance
CREATE INDEX idx_global_place_ratings_place ON global_place_ratings(place_type, place_id);
CREATE INDEX idx_global_place_reviews_place ON global_place_reviews(place_type, place_id);
CREATE INDEX idx_trip_place_notes_trip ON trip_place_notes(trip_id);
CREATE INDEX idx_trip_place_votes_trip ON trip_place_votes(trip_id);
CREATE INDEX idx_trip_place_status_trip ON trip_place_status(trip_id);
CREATE INDEX idx_user_place_lists_user ON user_place_lists(user_id);
CREATE INDEX idx_user_place_preferences_user ON user_place_preferences(user_id);

-- Add RLS policies
ALTER TABLE global_place_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_place_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_place_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_place_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_place_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_place_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_place_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_place_preferences ENABLE ROW LEVEL SECURITY;

-- Global level policies (public read, restricted write)
CREATE POLICY "Everyone can view global ratings"
    ON global_place_ratings FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Everyone can view public reviews"
    ON global_place_reviews FOR SELECT
    TO PUBLIC
    USING (is_verified = true);

-- Trip level policies (trip members only)
CREATE POLICY "Trip members can view notes"
    ON trip_place_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_id = trip_place_notes.trip_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can add notes"
    ON trip_place_notes FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_id = trip_place_notes.trip_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Trip members can vote"
    ON trip_place_votes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_id = trip_place_votes.trip_id
            AND user_id = auth.uid()
        )
    );

-- User level policies (personal access only)
CREATE POLICY "Users can manage their lists"
    ON user_place_lists FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view public lists"
    ON user_place_lists FOR SELECT
    USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage their preferences"
    ON user_place_preferences FOR ALL
    USING (user_id = auth.uid());

-- Function to update global ratings when reviews are added
CREATE OR REPLACE FUNCTION update_global_ratings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO global_place_ratings (
        place_type,
        place_id,
        rating_type,
        rating_value,
        rating_count
    )
    VALUES (
        NEW.place_type,
        NEW.place_id,
        'overall',
        NEW.rating,
        1
    )
    ON CONFLICT (place_type, place_id, rating_type)
    DO UPDATE SET
        rating_value = (
            (global_place_ratings.rating_value * global_place_ratings.rating_count + NEW.rating)
            / (global_place_ratings.rating_count + 1)
        )::integer,
        rating_count = global_place_ratings.rating_count + 1,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ratings_after_review
    AFTER INSERT ON global_place_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_global_ratings();

-- Function to handle trip place voting and status updates
CREATE OR REPLACE FUNCTION handle_trip_place_vote()
RETURNS TRIGGER AS $$
DECLARE
    up_votes INTEGER;
    down_votes INTEGER;
    total_members INTEGER;
BEGIN
    -- Count votes
    SELECT 
        COUNT(*) FILTER (WHERE vote_type = 'up'),
        COUNT(*) FILTER (WHERE vote_type = 'down')
    INTO up_votes, down_votes
    FROM trip_place_votes
    WHERE trip_id = NEW.trip_id
    AND place_id = NEW.place_id;

    -- Get total trip members
    SELECT COUNT(*) INTO total_members
    FROM trip_members
    WHERE trip_id = NEW.trip_id;

    -- Update status based on voting threshold
    IF up_votes > (total_members * 0.5) THEN -- Configurable threshold
        INSERT INTO trip_place_status (
            trip_id,
            place_type,
            place_id,
            status,
            confirmed_at
        )
        VALUES (
            NEW.trip_id,
            NEW.place_type,
            NEW.place_id,
            'confirmed',
            NOW()
        )
        ON CONFLICT (trip_id, place_id)
        DO UPDATE SET
            status = 'confirmed',
            confirmed_at = NOW();
    ELSIF down_votes > (total_members * 0.5) THEN
        INSERT INTO trip_place_status (
            trip_id,
            place_type,
            place_id,
            status
        )
        VALUES (
            NEW.trip_id,
            NEW.place_type,
            NEW.place_id,
            'rejected'
        )
        ON CONFLICT (trip_id, place_id)
        DO UPDATE SET
            status = 'rejected';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_vote_after_insert
    AFTER INSERT OR UPDATE ON trip_place_votes
    FOR EACH ROW
    EXECUTE FUNCTION handle_trip_place_vote(); 