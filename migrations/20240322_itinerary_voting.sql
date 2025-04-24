-- Add status and approval fields to global places
ALTER TABLE global_places
ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('approved', 'pending', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add status to itinerary items
ALTER TABLE itinerary_items
ADD COLUMN IF NOT EXISTS status VARCHAR(20) CHECK (status IN ('confirmed', 'suggested')) DEFAULT 'suggested';

-- Create table for itinerary item votes
CREATE TABLE IF NOT EXISTS itinerary_item_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES itinerary_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, user_id)
);

-- Add vote count to itinerary items
ALTER TABLE itinerary_items
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- Create function to update vote count
CREATE OR REPLACE FUNCTION update_itinerary_item_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE itinerary_items
        SET vote_count = (
            SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - 
                   COUNT(*) FILTER (WHERE vote_type = 'down')
            FROM itinerary_item_votes
            WHERE item_id = NEW.item_id
        )
        WHERE id = NEW.item_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE itinerary_items
        SET vote_count = (
            SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - 
                   COUNT(*) FILTER (WHERE vote_type = 'down')
            FROM itinerary_item_votes
            WHERE item_id = OLD.item_id
        )
        WHERE id = OLD.item_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type <> NEW.vote_type THEN
            UPDATE itinerary_items
            SET vote_count = (
                SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - 
                       COUNT(*) FILTER (WHERE vote_type = 'down')
                FROM itinerary_item_votes
                WHERE item_id = NEW.item_id
            )
            WHERE id = NEW.item_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote updates
CREATE TRIGGER update_itinerary_item_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON itinerary_item_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_itinerary_item_votes();

-- Add RLS policies
ALTER TABLE itinerary_item_votes ENABLE ROW LEVEL SECURITY;

-- Policies for votes
CREATE POLICY "Users can vote on items in their trips"
    ON itinerary_item_votes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trip_members tm
            JOIN itinerary_items ii ON ii.trip_id = tm.trip_id
            WHERE ii.id = itinerary_item_votes.item_id
            AND tm.user_id = auth.uid()
        )
    );

-- Update policies for global places
CREATE POLICY "Pending places are only visible to admins and submitters"
    ON global_places FOR SELECT
    USING (
        status = 'approved' OR
        auth.uid() IN (submitted_by, approved_by) OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Function to automatically confirm items with enough votes
CREATE OR REPLACE FUNCTION auto_confirm_itinerary_item()
RETURNS TRIGGER AS $$
DECLARE
    v_total_members INTEGER;
    v_vote_threshold INTEGER;
BEGIN
    -- Get total number of trip members
    SELECT COUNT(*) INTO v_total_members
    FROM trip_members
    WHERE trip_id = (
        SELECT trip_id 
        FROM itinerary_items 
        WHERE id = NEW.id
    );
    
    -- Set threshold to 50% of members
    v_vote_threshold := v_total_members / 2;
    
    -- Update status if votes exceed threshold
    IF NEW.vote_count >= v_vote_threshold AND NEW.status = 'suggested' THEN
        UPDATE itinerary_items
        SET status = 'confirmed'
        WHERE id = NEW.id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-confirmation
CREATE TRIGGER auto_confirm_itinerary_item_trigger
    AFTER UPDATE OF vote_count ON itinerary_items
    FOR EACH ROW
    EXECUTE FUNCTION auto_confirm_itinerary_item(); 