-- supabase/migrations/20250425000000_create_trip_history.sql

-- Optional: Create an ENUM type for standardized action types
CREATE TYPE trip_action_type AS ENUM (
    'TRIP_CREATED',
    'TRIP_UPDATED',           -- Changes to trips table fields (name, dates, description, budget etc.)
    'ITINERARY_ITEM_ADDED',
    'ITINERARY_ITEM_UPDATED',
    'ITINERARY_ITEM_DELETED',
    'MEMBER_ADDED',
    'MEMBER_REMOVED',
    'MEMBER_ROLE_UPDATED',
    'INVITATION_SENT',
    'ACCESS_REQUEST_SENT',
    'ACCESS_REQUEST_UPDATED', -- Covers approval/rejection
    'NOTE_CREATED',
    'NOTE_UPDATED',
    'NOTE_DELETED',
    'IMAGE_UPLOADED',
    'TAG_ADDED',
    'TAG_REMOVED',
    'SPLITWISE_GROUP_LINKED',
    'SPLITWISE_GROUP_UNLINKED',
    'SPLITWISE_GROUP_CREATED_AND_LINKED'
    -- Add more as needed...
); 

CREATE TABLE trip_history (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,              
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,   
    action_type trip_action_type NOT NULL,                      
    details JSONB NULL                                           
);

-- Add indexes for efficient querying
CREATE INDEX idx_trip_history_trip_id ON trip_history(trip_id);
CREATE INDEX idx_trip_history_created_at ON trip_history(created_at DESC);
CREATE INDEX idx_trip_history_user_id ON trip_history(user_id);
CREATE INDEX idx_trip_history_action_type ON trip_history(action_type);

-- Enable Row Level Security (RLS)
ALTER TABLE trip_history ENABLE ROW LEVEL SECURITY;

-- Policy: Allow trip members to read their trip's history
CREATE POLICY "Allow members to read trip history"
ON trip_history
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM trip_members WHERE trip_id = trip_history.trip_id
  )
);


-- Add comments for clarity
COMMENT ON TABLE trip_history IS 'Stores audit log/history of events related to trips.';
COMMENT ON COLUMN trip_history.trip_id IS 'The trip this history event belongs to.';
COMMENT ON COLUMN trip_history.user_id IS 'The user who performed the action (can be null for system actions).';
COMMENT ON COLUMN trip_history.action_type IS 'The type of action performed.';
COMMENT ON COLUMN trip_history.details IS 'JSON object containing details specific to the action type (e.g., changed fields, added item ID).'; 