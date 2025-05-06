-- =========================
-- GROUPS FEATURE SCHEMA
-- =========================

-- This script implements the complete database schema for the groups feature
-- It creates tables, indexes, RLS policies, and utility functions

-- =========================
-- 1. GROUPS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'shared_with_link', 'public')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups by creator
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON public.groups(slug);

-- Trigger to generate slug from name
CREATE OR REPLACE FUNCTION generate_group_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a basic slug
  NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Remove any leading or trailing hyphens
  NEW.slug := trim(both '-' from NEW.slug);
  
  -- Ensure uniqueness by appending random chars if needed
  IF EXISTS (SELECT 1 FROM public.groups WHERE slug = NEW.slug AND id != NEW.id) THEN
    NEW.slug := NEW.slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_group
  BEFORE INSERT ON public.groups
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_group_slug();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_group_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_group
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_group_timestamp();

-- =========================
-- 2. GROUP MEMBERS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'left', 'removed')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON public.group_members(group_id, role);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON public.group_members(group_id, status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_group_member_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_group_member
  BEFORE UPDATE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_timestamp();

-- =========================
-- 3. GROUP TRIPS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.group_trips (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, trip_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_group_trips_trip_id ON public.group_trips(trip_id);
CREATE INDEX IF NOT EXISTS idx_group_trips_added_by ON public.group_trips(added_by);

-- =========================
-- 4. RLS POLICIES
-- =========================

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_trips ENABLE ROW LEVEL SECURITY;

-- Groups table policies
CREATE POLICY "Group creators can do anything"
  ON public.groups
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group members can view groups they belong to"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Public groups are viewable by anyone"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (visibility = 'public');

-- Group members table policies
CREATE POLICY "Group owners and admins can manage members"
  ON public.group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Users can view members of groups they belong to"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_members.group_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "Users can view their own membership"
  ON public.group_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own membership (except ownership)"
  ON public.group_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND 
    role != 'owner'
  )
  WITH CHECK (
    user_id = auth.uid() AND
    role != 'owner'
  );

-- Group trips table policies
CREATE POLICY "Group admins can manage trips"
  ON public.group_trips
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_trips.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_trips.group_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND status = 'active'
    )
  );

CREATE POLICY "Group members can view group trips"
  ON public.group_trips
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = group_trips.group_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
  );

-- =========================
-- 5. HELPER FUNCTIONS
-- =========================

-- Function to create a group and add the creator as owner
CREATE OR REPLACE FUNCTION create_group(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_emoji TEXT DEFAULT NULL,
  p_visibility TEXT DEFAULT 'private'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
BEGIN
  -- Make sure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create a group';
  END IF;

  -- Insert the group
  INSERT INTO public.groups (name, description, emoji, created_by, visibility)
  VALUES (p_name, p_description, p_emoji, auth.uid(), p_visibility)
  RETURNING id INTO v_group_id;

  -- Add creator as owner
  INSERT INTO public.group_members (group_id, user_id, role, status)
  VALUES (v_group_id, auth.uid(), 'owner', 'active');

  RETURN v_group_id;
END;
$$;

-- Function to invite a user to a group
CREATE OR REPLACE FUNCTION invite_to_group(
  p_group_id UUID,
  p_user_id UUID,
  p_role TEXT DEFAULT 'member'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inviter_role TEXT;
BEGIN
  -- Check if inviter is an owner or admin
  SELECT role INTO v_inviter_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'active';

  IF v_inviter_role IS NULL OR v_inviter_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'User must be an owner or admin to invite others';
  END IF;

  -- Check if the invited user already exists
  IF EXISTS (SELECT 1 FROM public.group_members WHERE group_id = p_group_id AND user_id = p_user_id) THEN
    -- Update existing record if status is not active
    UPDATE public.group_members
    SET status = 'invited', role = p_role, updated_at = now()
    WHERE group_id = p_group_id AND user_id = p_user_id AND status != 'active';
  ELSE
    -- Insert new invitation
    INSERT INTO public.group_members (group_id, user_id, role, status)
    VALUES (p_group_id, p_user_id, p_role, 'invited');
  END IF;

  RETURN TRUE;
END;
$$;

-- Function to accept a group invitation
CREATE OR REPLACE FUNCTION accept_group_invitation(
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if invitation exists
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'invited'
  ) THEN
    RAISE EXCEPTION 'No active invitation found for this group';
  END IF;

  -- Update the status to active
  UPDATE public.group_members
  SET status = 'active', joined_at = now(), updated_at = now()
  WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'invited';

  RETURN TRUE;
END;
$$;

-- Function to leave a group
CREATE OR REPLACE FUNCTION leave_group(
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_role TEXT;
  v_owner_count INTEGER;
BEGIN
  -- Check if user is a member
  SELECT role INTO v_member_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'active';

  IF v_member_role IS NULL THEN
    RAISE EXCEPTION 'User is not an active member of this group';
  END IF;

  -- If user is an owner, check if they're the last owner
  IF v_member_role = 'owner' THEN
    SELECT COUNT(*) INTO v_owner_count
    FROM public.group_members
    WHERE group_id = p_group_id AND role = 'owner' AND status = 'active';

    IF v_owner_count = 1 THEN
      RAISE EXCEPTION 'Cannot leave group as you are the only owner. Transfer ownership first.';
    END IF;
  END IF;

  -- Update status to 'left'
  UPDATE public.group_members
  SET status = 'left', updated_at = now()
  WHERE group_id = p_group_id AND user_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Function to add a trip to a group
CREATE OR REPLACE FUNCTION add_trip_to_group(
  p_group_id UUID,
  p_trip_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member_role TEXT;
BEGIN
  -- Check if user is a member with appropriate permissions
  SELECT role INTO v_member_role
  FROM public.group_members
  WHERE group_id = p_group_id AND user_id = auth.uid() AND status = 'active';

  IF v_member_role IS NULL OR v_member_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'User must be an owner or admin to add trips';
  END IF;

  -- Check if the user has access to the trip
  IF NOT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = p_trip_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User does not have access to this trip';
  END IF;

  -- Add the trip to the group
  INSERT INTO public.group_trips (group_id, trip_id, added_by)
  VALUES (p_group_id, p_trip_id, auth.uid())
  ON CONFLICT (group_id, trip_id) DO NOTHING;

  RETURN TRUE;
END;
$$;

-- =========================
-- 6. UPDATE CONSTANTS
-- =========================

-- Add groups-related constants to database.ts
-- This is a comment and not actual SQL execution - you'll need to update
-- these files manually or in a separate migration
-- 
-- In database.ts, add:
-- groups = 'groups';
-- group_members = 'group_members';
-- group_group_trips = 'group_trips';
--
-- Add fields for each table as well
--
-- In status.ts, add:
-- GROUP_MEMBER_ROLES = { OWNER: 'owner', ADMIN: 'admin', MEMBER: 'member' }
-- GROUP_MEMBER_STATUSES = { INVITED: 'invited', ACTIVE: 'active', LEFT: 'left', REMOVED: 'removed' } 