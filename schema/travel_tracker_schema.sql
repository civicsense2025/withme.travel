-- Migration script for Travel Tracker feature
-- This script creates the user_travel table, sets up policies, and adds triggers to update destination travelers_count

-- Optional: Enable the pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create the user_travel table to track visited destinations by users
CREATE TABLE IF NOT EXISTS public.user_travel (
  user_id uuid NOT NULL,
  destination_id uuid NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES public.destinations (id) ON DELETE CASCADE
);

-- 2. Enable Row Level Security on the user_travel table
ALTER TABLE public.user_travel ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_travel
-- Allow SELECT for rows where the authenticated user owns the row
CREATE POLICY "Allow select on user_travel" ON public.user_travel
  FOR SELECT
  USING ( auth.uid() = user_id );

-- Allow INSERT only if the inserted row's user_id matches the authenticated user
CREATE POLICY "Allow insert on user_travel" ON public.user_travel
  FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Allow DELETE for rows where the authenticated user owns the row
CREATE POLICY "Allow delete on user_travel" ON public.user_travel
  FOR DELETE
  USING ( auth.uid() = user_id );

-- Allow UPDATE for rows where the authenticated user owns the row
CREATE POLICY "Allow update on user_travel" ON public.user_travel
  FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id );


-- 4. Create trigger functions to update the travelers_count in the destinations table

-- Function to increment travelers_count on insert
CREATE OR REPLACE FUNCTION public.increment_travelers_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.destinations
  SET travelers_count = travelers_count + 1
  WHERE id = NEW.destination_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement travelers_count on delete
CREATE OR REPLACE FUNCTION public.decrement_travelers_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.destinations
  SET travelers_count = GREATEST(travelers_count - 1, 0)
  WHERE id = OLD.destination_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. Create triggers on user_travel

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_increment_travelers ON public.user_travel;
DROP TRIGGER IF EXISTS trg_decrement_travelers ON public.user_travel;

-- Trigger to increment travelers_count after a record is inserted
CREATE TRIGGER trg_increment_travelers
AFTER INSERT ON public.user_travel
FOR EACH ROW
EXECUTE PROCEDURE public.increment_travelers_count();

-- Trigger to decrement travelers_count after a record is deleted
CREATE TRIGGER trg_decrement_travelers
AFTER DELETE ON public.user_travel
FOR EACH ROW
EXECUTE PROCEDURE public.decrement_travelers_count();

-- 6. (Optional) Enable RLS on the destinations table and create a public SELECT policy
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select on destinations" ON public.destinations
  FOR SELECT
  USING ( true ); 