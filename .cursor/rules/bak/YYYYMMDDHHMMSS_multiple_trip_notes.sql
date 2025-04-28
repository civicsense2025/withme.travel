-- Migration to enable multiple notes per trip with titles

BEGIN;

-- Drop the existing primary key constraint (assuming it's on trip_id)
-- Adjust constraint name if different
ALTER TABLE public.trip_notes DROP CONSTRAINT IF EXISTS trip_notes_pkey;

-- Add the new ID column as primary key
ALTER TABLE public.trip_notes
ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();

-- 1. Add the title column, allowing NULLs temporarily
ALTER TABLE public.trip_notes
ADD COLUMN title TEXT; 

-- 2. Update existing rows with a default title
UPDATE public.trip_notes
SET title = 'General Notes' -- Or choose another default like 'Untitled Note'
WHERE title IS NULL;

-- 3. Now, enforce the NOT NULL constraint on title
ALTER TABLE public.trip_notes
ALTER COLUMN title SET NOT NULL;

-- Ensure trip_id is indexed if not already (it was likely indexed as PK)
CREATE INDEX IF NOT EXISTS idx_trip_notes_trip_id ON public.trip_notes(trip_id);

-- Re-validate trip_id foreign key constraint if it exists, or add it if needed
-- Ensure it references the trips table correctly and handles deletion (e.g., ON DELETE CASCADE)
-- This example assumes the constraint exists and is named trip_notes_trip_id_fkey
-- ALTER TABLE public.trip_notes VALIDATE CONSTRAINT trip_notes_trip_id_fkey;
-- If the FK doesn't exist, add it:
-- ALTER TABLE public.trip_notes
-- ADD CONSTRAINT trip_notes_trip_id_fkey FOREIGN KEY (trip_id)
-- REFERENCES public.trips(id) ON DELETE CASCADE;

-- RLS Policies Update --

-- Disable existing RLS temporarily if needed for modification
-- ALTER TABLE public.trip_notes DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (adjust names if necessary)
DROP POLICY IF EXISTS "Enable read access for trip members" ON public.trip_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.trip_notes;
DROP POLICY IF EXISTS "Enable update for trip members" ON public.trip_notes;
DROP POLICY IF EXISTS "Enable delete for trip admins" ON public.trip_notes;

-- Helper function to check trip membership and role
CREATE OR REPLACE FUNCTION is_trip_member_with_role(
    _trip_id uuid,
    _user_id uuid,
    _roles text[]
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    member_role text;
BEGIN
    SELECT role INTO member_role
    FROM public.trip_members
    WHERE trip_id = _trip_id AND user_id = _user_id;

    RETURN member_role = ANY(_roles);
END;
$$;

-- Allow members to read notes for their trips
CREATE POLICY "Allow members to read notes for their trips" ON public.trip_notes
    FOR SELECT
    USING (
        is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin', 'editor', 'contributor', 'viewer'])
    );

-- Allow editors and admins to create notes for their trips
CREATE POLICY "Allow editors/admins to create notes" ON public.trip_notes
    FOR INSERT
    WITH CHECK (
        is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin', 'editor'])
    );

-- Allow editors and admins to update notes for their trips
-- Or allow the user who last updated it (updated_by)
CREATE POLICY "Allow editors/admins or last updater to update notes" ON public.trip_notes
    FOR UPDATE
    USING (
        is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin', 'editor']) OR
        updated_by = auth.uid()
    )
    WITH CHECK (
        is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin', 'editor']) OR
        updated_by = auth.uid()
    );

-- Allow admins to delete notes for their trips
CREATE POLICY "Allow admins to delete notes" ON public.trip_notes
    FOR DELETE
    USING (
        is_trip_member_with_role(trip_id, auth.uid(), ARRAY['admin'])
    );

-- Enable RLS
ALTER TABLE public.trip_notes ENABLE ROW LEVEL SECURITY;

-- Ensure the updated_at trigger is still in place
-- (Assuming it exists from a previous migration, e.g., supabase_functions.handle_updated_at('trip_notes'))
-- If not, add it:
-- CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.trip_notes
-- FOR EACH ROW EXECUTE PROCEDURE supabase_functions.handle_updated_at();

COMMIT; 