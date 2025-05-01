-- Comprehensive schema update for WithMe.Travel
-- This migration adds missing tables and ensures schema is up to date

-------------------------------------------------------------------------
-- User Login History Table (For security auditing and session tracking)
-------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  method TEXT, -- 'password', 'magic_link', 'oauth', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster user queries
CREATE INDEX IF NOT EXISTS idx_user_login_history_user_id ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_login_at ON user_login_history(login_at);

-- Add RLS policies
ALTER TABLE user_login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history"
  ON user_login_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can insert login history"
  ON user_login_history FOR INSERT
  WITH CHECK (true); -- Restricted via service role

-------------------------------------------------------------------------
-- Access Requests Table (For requesting access to trips)
-------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_trip_id ON access_requests(trip_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- Add RLS policies
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access requests"
  ON access_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Trip members can view access requests for their trips"
  ON access_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = access_requests.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can create access requests"
  ON access_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Trip admins can update access requests"
  ON access_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = access_requests.trip_id
      AND trip_members.user_id = auth.uid()
      AND trip_members.role = 'admin'
    )
  );

-- Function to update updated_at column automatically
CREATE OR REPLACE FUNCTION update_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
DROP TRIGGER IF EXISTS update_access_requests_updated_at ON access_requests;
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON access_requests
FOR EACH ROW
EXECUTE FUNCTION update_access_requests_updated_at();

-------------------------------------------------------------------------
-- Collaborative Notes Table (For shared trip notes)
-------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS collaborative_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_collaborative_notes_trip_id ON collaborative_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_notes_created_by ON collaborative_notes(created_by);

-- Add RLS policies
ALTER TABLE collaborative_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip members can view collaborative notes"
  ON collaborative_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = collaborative_notes.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members can create collaborative notes"
  ON collaborative_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = collaborative_notes.trip_id
      AND trip_members.user_id = auth.uid()
    ) AND auth.uid() = created_by
  );

CREATE POLICY "Trip members can update collaborative notes"
  ON collaborative_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = collaborative_notes.trip_id
      AND trip_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Trip members (admin/editor) can delete collaborative notes"
  ON collaborative_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM trip_members
      WHERE trip_members.trip_id = collaborative_notes.trip_id
      AND trip_members.user_id = auth.uid()
      AND (trip_members.role IN ('admin', 'editor') OR auth.uid() = collaborative_notes.created_by)
    )
  );

-- Function to update updated_at and last_edited_* columns automatically
CREATE OR REPLACE FUNCTION update_collaborative_notes_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_edited_at = now();
  NEW.last_edited_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamps and editor info
DROP TRIGGER IF EXISTS update_collaborative_notes_metadata ON collaborative_notes;
CREATE TRIGGER update_collaborative_notes_metadata
BEFORE UPDATE ON collaborative_notes
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*)
EXECUTE FUNCTION update_collaborative_notes_metadata();

-------------------------------------------------------------------------
-- Add missing columns to existing tables (if needed)
-------------------------------------------------------------------------

-- Check and add missing columns to trips table
DO $$ 
BEGIN
  -- Check for and add is_archived column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'is_archived') THEN
    ALTER TABLE trips ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false;
  END IF;
  
  -- Check for and add last_accessed_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'last_accessed_at') THEN
    ALTER TABLE trips ADD COLUMN last_accessed_at TIMESTAMPTZ;
  END IF;

  -- Check for and add cover_image_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'cover_image_url') THEN
    ALTER TABLE trips ADD COLUMN cover_image_url TEXT;
  END IF;
  
  -- Check for and add color_scheme column (for UI customization)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trips' AND column_name = 'color_scheme') THEN
    ALTER TABLE trips ADD COLUMN color_scheme TEXT;
  END IF;
END $$;

-- Check and add missing columns to trip_members table
DO $$ 
BEGIN
  -- Check for and add notification_preferences column (JSON for flexibility)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_members' AND column_name = 'notification_preferences') THEN
    ALTER TABLE trip_members ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "push": true}';
  END IF;
  
  -- Check for and add last_viewed_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trip_members' AND column_name = 'last_viewed_at') THEN
    ALTER TABLE trip_members ADD COLUMN last_viewed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Check and add missing columns to itinerary_items table
DO $$ 
BEGIN
  -- Check for and add votes column (for collaborative decision making)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itinerary_items' AND column_name = 'votes') THEN
    ALTER TABLE itinerary_items ADD COLUMN votes JSONB DEFAULT '{}';
  END IF;
  
  -- Check for and add last_modified_by column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itinerary_items' AND column_name = 'last_modified_by') THEN
    ALTER TABLE itinerary_items ADD COLUMN last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  -- Check for and add is_favorite column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itinerary_items' AND column_name = 'is_favorite') THEN
    ALTER TABLE itinerary_items ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- ADD THE MISSING DAY COLUMN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'itinerary_items' AND column_name = 'day') THEN
    ALTER TABLE itinerary_items ADD COLUMN day INTEGER;
  END IF;
END $$;

-------------------------------------------------------------------------
-- Update RLS policies for existing tables if needed
-------------------------------------------------------------------------

-- Make sure all base tables have RLS enabled
DO $$ 
BEGIN
  -- Enable RLS on profiles if not already
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on trips if not already
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'trips' AND rowsecurity = true
  ) THEN
    ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on trip_members if not already
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'trip_members' AND rowsecurity = true
  ) THEN
    ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Enable RLS on itinerary_items if not already
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'itinerary_items' AND rowsecurity = true
  ) THEN
    ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Ensure trip visibility policies exist (public vs private trips)
DROP POLICY IF EXISTS "Users can view trips they are members of" ON trips;
CREATE POLICY "Users can view trips they are members of" 
ON trips FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM trip_members 
    WHERE trip_members.trip_id = id 
    AND trip_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view public trips" ON trips;
CREATE POLICY "Users can view public trips" 
ON trips FOR SELECT
USING (privacy_setting = 'public');

-- Ensure proper RLS for trip_members
DROP POLICY IF EXISTS "Trip members can view other trip members" ON trip_members;
CREATE POLICY "Trip members can view other trip members" 
ON trip_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM trip_members AS tm 
    WHERE tm.trip_id = trip_members.trip_id 
    AND tm.user_id = auth.uid()
  )
);

-- Ensure trip_members role-based editing permissions
DROP POLICY IF EXISTS "Only admins can modify trip member roles" ON trip_members;
CREATE POLICY "Only admins can modify trip member roles" 
ON trip_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM trip_members AS tm 
    WHERE tm.trip_id = trip_members.trip_id 
    AND tm.user_id = auth.uid()
    AND tm.role = 'admin'
  )
);

-- Update any types/enums that might be needed
DO $$ 
BEGIN
  -- Create trip role enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trip_role') THEN
    CREATE TYPE trip_role AS ENUM ('admin', 'editor', 'viewer');
  END IF;
  
  -- Create item status enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_status') THEN
    CREATE TYPE item_status AS ENUM ('suggested', 'planned', 'confirmed', 'completed', 'cancelled');
  END IF;
  
  -- Create privacy setting enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'privacy_setting') THEN
    CREATE TYPE privacy_setting AS ENUM ('private', 'unlisted', 'public');
  END IF;
END $$;

-------------------------------------------------------------------------
-- Helper functions for trip management
-------------------------------------------------------------------------

-- Function to check if a user is a trip member
-- DROP FUNCTION IF EXISTS is_trip_member(uuid, uuid); -- REMOVED to avoid dependency issues
CREATE OR REPLACE FUNCTION is_trip_member(p_trip_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_members.trip_id = p_trip_id
    AND trip_members.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in a trip
-- DROP FUNCTION IF EXISTS get_trip_role(uuid, uuid); -- REMOVED to avoid dependency issues
CREATE OR REPLACE FUNCTION get_trip_role(p_trip_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM trip_members
  WHERE trip_members.trip_id = p_trip_id
  AND trip_members.user_id = p_user_id;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can edit a trip
-- DROP FUNCTION IF EXISTS can_edit_trip(uuid, uuid); -- REMOVED to avoid dependency issues
CREATE OR REPLACE FUNCTION can_edit_trip(p_trip_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM trip_members
  WHERE trip_members.trip_id = p_trip_id
  AND trip_members.user_id = p_user_id;
  
  RETURN user_role IN ('admin', 'editor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trip last_accessed_at
CREATE OR REPLACE FUNCTION update_trip_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trips
  SET last_accessed_at = now()
  WHERE id = NEW.trip_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_accessed_at when members view a trip
DROP TRIGGER IF EXISTS update_trip_last_viewed ON trip_members;
CREATE TRIGGER update_trip_last_viewed
AFTER UPDATE OF last_viewed_at ON trip_members
FOR EACH ROW
WHEN (OLD.last_viewed_at IS DISTINCT FROM NEW.last_viewed_at)
EXECUTE FUNCTION update_trip_last_accessed();

-------------------------------------------------------------------------
-- Ensure correct indexes exist on frequently queried columns
-------------------------------------------------------------------------

-- Trips table indexes
CREATE INDEX IF NOT EXISTS idx_trips_privacy_setting ON trips(privacy_setting);
CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON trips(destination_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips(start_date);
CREATE INDEX IF NOT EXISTS idx_trips_last_accessed_at ON trips(last_accessed_at);

-- Trip members indexes
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_user ON trip_members(trip_id, user_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_role ON trip_members(role);

-- Itinerary items indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_section_id ON itinerary_items(section_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_status ON itinerary_items(status);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_day ON itinerary_items(day);

-- User presence indexes
CREATE INDEX IF NOT EXISTS idx_user_presence_trip_id ON user_presence(trip_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_active ON user_presence(last_active); 