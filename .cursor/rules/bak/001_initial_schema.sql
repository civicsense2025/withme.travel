-- supabase/migrations/001_initial_schema.sql
-- Creates the initial database schema including core tables, types, functions, and RLS.

-- 1. Create ENUM Types (using DO block for idempotency)
DO $$
BEGIN
    CREATE TYPE public.trip_role AS ENUM ('admin', 'editor', 'viewer', 'contributor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE TYPE public.item_status AS ENUM ('suggested', 'confirmed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE TYPE public.itinerary_category AS ENUM ('flight', 'accommodation', 'attraction', 'restaurant', 'transportation', 'activity', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE TYPE public.place_category AS ENUM ('attraction', 'restaurant', 'cafe', 'hotel', 'landmark', 'shopping', 'transport', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE TYPE public.vote_type AS ENUM ('up', 'down');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Profiles Table (linking to auth.users)
-- Note: Supabase automatically creates profiles based on auth.users usually.
-- This ensures essential columns exist if relying on standard Supabase auth triggers.
-- Add other profile fields as needed (username, bio, etc.)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NULL,
  avatar_url text NULL,
  username text NULL UNIQUE,
  updated_at timestamptz NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Create Destinations Table
CREATE TABLE IF NOT EXISTS public.destinations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city text NOT NULL,
  country text NOT NULL,
  continent text NULL,
  description text NULL,
  image_url text NULL,
  latitude numeric(9, 6) NULL,
  longitude numeric(9, 6) NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now()
  -- Add other destination fields as needed
);
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Destinations are viewable by everyone." ON destinations FOR SELECT USING (true);
-- Add policies for insert/update/delete if admins/specific users should manage them.

-- 4. Create Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NULL,
  tags text[] NULL,
  destination_id uuid NULL REFERENCES public.destinations(id) ON DELETE SET NULL,
  destination_name text NULL, -- Denormalized for easier display
  start_date date NULL,
  end_date date NULL,
  is_public boolean NULL DEFAULT false,
  cover_image_url text NULL,
  latitude numeric(9, 6) NULL,
  longitude numeric(9, 6) NULL,
  playlist_url text NULL, -- Added for Spotify/Tidal playlist embeds
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now()
  -- Add other trip fields (budget, vibe, etc.) as needed
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
COMMENT ON COLUMN public.trips.created_by IS 'Creator of the trip (references profiles.id)';

-- 5. Create Trip Members Table
CREATE TABLE IF NOT EXISTS public.trip_members (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.trip_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NULL DEFAULT now(),
  invited_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at timestamptz NULL,
  external_email text NULL,
  UNIQUE (trip_id, user_id),
  UNIQUE (trip_id, external_email) -- Ensure only one invite per email per trip
);
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
-- RLS Policies for trip_members will be added later, often depending on trip status (public/private) and member roles.

-- 6. Create Places Table
CREATE TABLE IF NOT EXISTS public.places (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    google_place_id text NULL UNIQUE,
    name text NOT NULL,
    description text NULL,
    category public.place_category NULL,
    address text NULL,
    latitude numeric(9, 6) NULL,
    longitude numeric(9, 6) NULL,
    destination_id uuid NULL REFERENCES public.destinations(id) ON DELETE SET NULL,
    price_level integer NULL CHECK (price_level >= 1 AND price_level <= 5),
    rating numeric(2, 1) NULL,
    rating_count integer NULL DEFAULT 0,
    images text[] NULL,
    tags text[] NULL,
    opening_hours jsonb NULL,
    is_verified boolean NOT NULL DEFAULT false,
    suggested_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    source text NULL,
    source_id text NULL
);
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Places are viewable by everyone." ON public.places FOR SELECT USING (true);
-- Add more restrictive policies if needed

-- 7. Create Itinerary Items Table
CREATE TABLE IF NOT EXISTS public.itinerary_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  created_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NULL,
  status public.item_status NULL DEFAULT 'suggested',
  start_time time NULL,
  end_time time NULL,
  date date NULL,
  day_number integer NULL,
  address text NULL,
  latitude numeric(9, 6) NULL,
  longitude numeric(9, 6) NULL,
  place_id uuid NULL REFERENCES public.places(id) ON DELETE SET NULL,
  category public.itinerary_category NULL,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  is_custom boolean NOT NULL DEFAULT false
);
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
-- RLS Policies for itinerary_items will depend on trip membership and roles.

-- 8. Create Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  itinerary_item_id uuid NOT NULL REFERENCES public.itinerary_items(id) ON DELETE CASCADE,
  vote_type public.vote_type NOT NULL,
  created_at timestamptz NULL DEFAULT now(),
  UNIQUE (user_id, itinerary_item_id) -- Ensure one vote per user per item
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
-- RLS Policies for votes will depend on trip membership.

-- 9. Create Trip Creation Function (with Admin Role)
CREATE OR REPLACE FUNCTION public.create_trip_with_owner (
  trip_name text,
  user_id uuid,
  description_param text DEFAULT NULL,
  tags_param text[] DEFAULT NULL,
  destination_id uuid DEFAULT NULL,
  destination_name_param text DEFAULT NULL,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  is_public boolean DEFAULT false,
  cover_image_url text DEFAULT NULL,
  latitude numeric DEFAULT NULL,
  longitude numeric DEFAULT NULL
)
RETURNS uuid -- Return the new trip_id
LANGUAGE plpgsql
SECURITY DEFINER -- Important for inserting into trip_members
AS $$
DECLARE
  new_trip_id uuid;
BEGIN
  -- Insert the new trip
  INSERT INTO public.trips (
    name, created_by, description, tags, destination_id, 
    destination_name, start_date, end_date, is_public, 
    cover_image_url, latitude, longitude
  )
  VALUES (
    trip_name, user_id, description_param, tags_param, destination_id, 
    destination_name_param, start_date, end_date, is_public, 
    cover_image_url, latitude, longitude
  )
  RETURNING id INTO new_trip_id;

  -- Add the creator as an ADMIN member
  IF new_trip_id IS NOT NULL AND user_id IS NOT NULL THEN
    INSERT INTO public.trip_members (trip_id, user_id, role, joined_at)
    VALUES (new_trip_id, user_id, 'admin'::public.trip_role, now());
  END IF;

  RETURN new_trip_id;
END;
$$;

-- 10. Create RLS Policies for Trips and Members (Examples)

-- Trips: Public trips are viewable, members can view their trips.
DROP POLICY IF EXISTS "Allow public read access" ON public.trips;
CREATE POLICY "Allow public read access" ON public.trips FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Allow member read access" ON public.trips;
CREATE POLICY "Allow member read access" ON public.trips FOR SELECT USING (
  auth.role() = 'authenticated' -- Simplified check for diagnostics
);

-- Trips: Admins/Editors can update their trips.
DROP POLICY IF EXISTS "Allow admin/editor update access" ON public.trips;
CREATE POLICY "Allow admin/editor update access" ON public.trips FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = public.trips.id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'admin'::public.trip_role OR tm.role = 'editor'::public.trip_role)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = public.trips.id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'admin'::public.trip_role OR tm.role = 'editor'::public.trip_role)
  )
);

-- Trips: Admins can delete their trips.
DROP POLICY IF EXISTS "Allow admin delete access" ON public.trips;
CREATE POLICY "Allow admin delete access" ON public.trips FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = public.trips.id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'::public.trip_role
  )
);

-- Trip Members: Members can view other members of the same trip.
DROP POLICY IF EXISTS "Allow members to view other members" ON public.trip_members;
CREATE POLICY "Allow members to view other members" ON public.trip_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_members tm_check
    WHERE tm_check.trip_id = public.trip_members.trip_id AND tm_check.user_id = auth.uid()
  )
);

-- Trip Members: Admins/Editors can insert/update/delete members for their trips.
DROP POLICY IF EXISTS "Allow admin/editor to manage members" ON public.trip_members;
CREATE POLICY "Allow admin/editor to manage members" ON public.trip_members FOR ALL USING ( -- Covers INSERT, UPDATE, DELETE
  EXISTS (
    SELECT 1 FROM public.trip_members tm_check
    WHERE tm_check.trip_id = public.trip_members.trip_id
      AND tm_check.user_id = auth.uid()
      AND (tm_check.role = 'admin'::public.trip_role OR tm_check.role = 'editor'::public.trip_role)
  )
) WITH CHECK ( -- Ensure they are adding members to the correct trip
  EXISTS (
    SELECT 1 FROM public.trip_members tm_check
    WHERE tm_check.trip_id = public.trip_members.trip_id
      AND tm_check.user_id = auth.uid()
      AND (tm_check.role = 'admin'::public.trip_role OR tm_check.role = 'editor'::public.trip_role)
  )
);

-- Itinerary Items: Members can view items for their trips.
DROP POLICY IF EXISTS "Allow members to view itinerary items" ON public.itinerary_items;
CREATE POLICY "Allow members to view itinerary items" ON public.itinerary_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = public.itinerary_items.trip_id AND tm.user_id = auth.uid()
  )
);

-- Itinerary Items: Admins/Editors/Contributors can manage items.
DROP POLICY IF EXISTS "Allow contributors to manage itinerary items" ON public.itinerary_items;
CREATE POLICY "Allow contributors to manage itinerary items" ON public.itinerary_items FOR ALL USING ( -- Covers INSERT, UPDATE, DELETE
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = public.itinerary_items.trip_id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'admin'::public.trip_role OR tm.role = 'editor'::public.trip_role OR tm.role = 'contributor'::public.trip_role)
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_members tm
    WHERE tm.trip_id = public.itinerary_items.trip_id
      AND tm.user_id = auth.uid()
      AND (tm.role = 'admin'::public.trip_role OR tm.role = 'editor'::public.trip_role OR tm.role = 'contributor'::public.trip_role)
  )
);

-- Votes: Members can manage their own votes for items in their trips.
DROP POLICY IF EXISTS "Allow members to manage own votes" ON public.votes;
CREATE POLICY "Allow members to manage own votes" ON public.votes FOR ALL USING (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.trip_members tm
    JOIN public.itinerary_items ii ON tm.trip_id = ii.trip_id
    WHERE ii.id = public.votes.itinerary_item_id AND tm.user_id = auth.uid()
  )
) WITH CHECK (
  auth.uid() = user_id
);

-- Add other necessary triggers, functions, or initial RLS policies here. 