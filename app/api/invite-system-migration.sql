-- Invitations and Referrals System Migration
-- This migration creates or modifies the necessary tables, indexes, and triggers
-- for the invite system (trip invitations, group invitations, and referrals)

-- Create invitation_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_type') THEN
        CREATE TYPE invitation_type AS ENUM ('trip', 'group', 'referral');
    END IF;
END$$;

-- Create invitation_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
        CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
    END IF;
END$$;

-- Create or update invitations table with additional fields for groups and referrals
CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN DEFAULT FALSE,
    type invitation_type NOT NULL,
    status invitation_status DEFAULT 'pending',
    metadata JSONB
);

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'group_id') THEN
        ALTER TABLE invitations ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'type') THEN
        ALTER TABLE invitations ADD COLUMN type invitation_type NOT NULL DEFAULT 'trip';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'status') THEN
        ALTER TABLE invitations ADD COLUMN status invitation_status DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'used') THEN
        ALTER TABLE invitations ADD COLUMN used BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'accepted_at') THEN
        ALTER TABLE invitations ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'metadata') THEN
        ALTER TABLE invitations ADD COLUMN metadata JSONB;
    END IF;
END$$;

-- Add constraint: trip_id or group_id must be set for trip/group invitations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invitations_type_validation'
    ) THEN
        ALTER TABLE invitations
        ADD CONSTRAINT invitations_type_validation
        CHECK (
            (type = 'trip' AND trip_id IS NOT NULL) OR
            (type = 'group' AND group_id IS NOT NULL) OR
            (type = 'referral')
        );
    END IF;
END$$;

-- Create indexes for performance
DROP INDEX IF EXISTS idx_invitations_token;
CREATE INDEX idx_invitations_token ON invitations(token);

DROP INDEX IF EXISTS idx_invitations_email;
CREATE INDEX idx_invitations_email ON invitations(email);

DROP INDEX IF EXISTS idx_invitations_trip_id;
CREATE INDEX idx_invitations_trip_id ON invitations(trip_id);

DROP INDEX IF EXISTS idx_invitations_group_id;
CREATE INDEX idx_invitations_group_id ON invitations(group_id);

DROP INDEX IF EXISTS idx_invitations_inviter_id;
CREATE INDEX idx_invitations_inviter_id ON invitations(inviter_id);

DROP INDEX IF EXISTS idx_invitations_type;
CREATE INDEX idx_invitations_type ON invitations(type);

DROP INDEX IF EXISTS idx_invitations_status;
CREATE INDEX idx_invitations_status ON invitations(status);

-- Function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations() RETURNS TRIGGER AS $$
BEGIN
    UPDATE invitations
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS expire_invitations_trigger ON invitations;
CREATE TRIGGER expire_invitations_trigger
AFTER INSERT OR UPDATE ON invitations
FOR EACH STATEMENT EXECUTE PROCEDURE expire_old_invitations();

-- RLS Policies
-- Enable RLS on the invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS invitations_select_policy ON invitations;
DROP POLICY IF EXISTS invitations_insert_policy ON invitations;
DROP POLICY IF EXISTS invitations_update_policy ON invitations;
DROP POLICY IF EXISTS invitations_delete_policy ON invitations;

-- Policy for selecting invitations
CREATE POLICY invitations_select_policy ON invitations
    FOR SELECT
    USING (
        -- Users can see their own invitations (as invitee via email)
        email = auth.email() OR
        -- Users can see invitations they sent
        inviter_id = auth.uid() OR
        -- Trip admins can see invitations for their trips
        (
            trip_id IN (
                SELECT trip_id FROM members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Group admins can see invitations for their groups
        (
            group_id IN (
                SELECT group_id FROM group_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Authenticated users can view an invitation by token (needed for accepting it)
        (auth.role() = 'authenticated' AND token = current_setting('app.current_token', true))
    );

-- Policy for inserting invitations (trip owners/group owners/any authenticated for referrals)
CREATE POLICY invitations_insert_policy ON invitations
    FOR INSERT
    WITH CHECK (
        -- For trip invitations, user must be an admin of the trip
        (
            type = 'trip' AND
            trip_id IN (
                SELECT trip_id FROM members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- For group invitations, user must be an admin of the group
        (
            type = 'group' AND
            group_id IN (
                SELECT group_id FROM group_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Anyone can create referral invitations
        (
            type = 'referral' AND
            inviter_id = auth.uid()
        )
    );

-- Policy for updating invitations
CREATE POLICY invitations_update_policy ON invitations
    FOR UPDATE
    USING (
        -- Users can update invitations by token (e.g., to accept)
        token = current_setting('app.current_token', true) OR
        -- Trip admins can update invitations for their trips
        (
            trip_id IN (
                SELECT trip_id FROM members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Group admins can update invitations for their groups
        (
            group_id IN (
                SELECT group_id FROM group_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Users can update their own referral invitations
        (
            type = 'referral' AND
            inviter_id = auth.uid()
        )
    );

-- Policy for deleting invitations (only trip/group admins)
CREATE POLICY invitations_delete_policy ON invitations
    FOR DELETE
    USING (
        -- Trip admins can delete invitations for their trips
        (
            trip_id IN (
                SELECT trip_id FROM members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Group admins can delete invitations for their groups
        (
            group_id IN (
                SELECT group_id FROM group_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        ) OR
        -- Users can delete their own referral invitations
        (
            type = 'referral' AND
            inviter_id = auth.uid()
        )
    );

-- Add tracking columns to users table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referrer_id') THEN
        ALTER TABLE profiles ADD COLUMN referrer_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_count') THEN
        ALTER TABLE profiles ADD COLUMN referral_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'referral_bonus') THEN
        ALTER TABLE profiles ADD COLUMN referral_bonus JSONB;
    END IF;
END$$;

-- Function to update referrer stats when a new user registers with a referral
CREATE OR REPLACE FUNCTION update_referral_stats() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referrer_id IS NOT NULL THEN
        -- Increment the referrer's count
        UPDATE profiles
        SET referral_count = referral_count + 1
        WHERE id = NEW.referrer_id;
        
        -- Could add logic here to apply bonuses based on count thresholds
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_referral_stats_trigger ON profiles;
CREATE TRIGGER update_referral_stats_trigger
AFTER INSERT OR UPDATE OF referrer_id ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_referral_stats(); 