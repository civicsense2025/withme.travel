-- Create trip_action_type ENUM if it doesn't exist
-- Add all known initial values here
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_action_type') THEN
        CREATE TYPE public.trip_action_type AS ENUM (
            'TRIP_CREATED', 
            'TRIP_UPDATED', 
            'MEMBER_ADDED', 
            'MEMBER_REMOVED', 
            'ITEM_ADDED', 
            'ITEM_UPDATED', 
            'ITEM_DELETED' 
            -- Add other initial values if known
        );
    END IF;
END$$; 